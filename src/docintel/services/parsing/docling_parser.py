from __future__ import annotations

import asyncio
import importlib.metadata
from pathlib import Path
from typing import Any, Literal, cast
from uuid import UUID

from docintel.domain.canonical_ir import (
    BoundingBox,
    CanonicalDocument,
    CanonicalPage,
    DocumentElement,
)

ElementType = Literal[
    "title",
    "heading",
    "paragraph",
    "list_item",
    "table",
    "image",
    "caption",
    "hyperlink",
    "header",
    "footer",
    "unknown",
]


class DoclingParser:
    """Docling-backed parser for PDF and DOCX files."""

    name = "docling"

    def __init__(self, file_name: str, file_type: str, checksum_sha256: str) -> None:
        self.file_name = file_name
        self.file_type = file_type
        self.checksum_sha256 = checksum_sha256
        self.parser_version = importlib.metadata.version("docling")

    def supports(self, file_path: str) -> bool:
        """Return whether Docling supports this file extension."""

        return Path(file_path).suffix.lower() in {".pdf", ".docx"}

    async def parse(self, file_path: str, document_id: str) -> CanonicalDocument:
        """Parse a PDF or DOCX into canonical IR."""

        return await asyncio.to_thread(self._parse_sync, Path(file_path), UUID(document_id))

    def _parse_sync(self, file_path: Path, document_id: UUID) -> CanonicalDocument:
        from docling.datamodel.base_models import InputFormat
        from docling.datamodel.pipeline_options import PdfPipelineOptions
        from docling.document_converter import DocumentConverter, PdfFormatOption

        pdf_options = PdfPipelineOptions()
        pdf_options.do_ocr = False
        converter = DocumentConverter(
            format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pdf_options)}
        )
        result = converter.convert(file_path)
        docling_document = result.document
        pages = self._build_pages(docling_document)
        native_json = self._native_json(docling_document)
        warnings = self._document_warnings(pages)
        return CanonicalDocument(
            document_id=document_id,
            file_name=self.file_name,
            file_type=self.file_type,  # type: ignore[arg-type]
            checksum_sha256=self.checksum_sha256,
            pages=pages,
            metadata={
                "parser_name": self.name,
                "parser_version": self.parser_version,
                "docling_status": str(result.status),
                "docling_markdown": docling_document.export_to_markdown(),
                "parser_native_json": native_json,
            },
            warnings=warnings,
        )

    def _build_pages(self, docling_document: Any) -> list[CanonicalPage]:
        page_numbers = sorted(getattr(docling_document, "pages", {}) or {1: object()})
        page_elements: dict[int, list[DocumentElement]] = {int(page): [] for page in page_numbers}

        for index, item in enumerate(self._iter_docling_items(docling_document), start=1):
            element = self._to_element(item, index, docling_document)
            page_number = element.page_number or page_numbers[0]
            page_elements.setdefault(page_number, []).append(
                element.model_copy(update={"page_number": page_number})
            )

        pages: list[CanonicalPage] = []
        for page_number in sorted(page_elements):
            elements = page_elements[page_number]
            text_length = sum(len(element.text or element.markdown or "") for element in elements)
            warnings: list[str] = []
            quality = min(1.0, text_length / 500)
            if text_length == 0:
                warnings.append("No useful text extracted; OCR may be required.")
                quality = 0.0
            pages.append(
                CanonicalPage(
                    page_number=page_number,
                    parser_route=self.name,
                    text_quality_score=round(quality, 3),
                    elements=elements,
                    warnings=warnings,
                )
            )
        return pages or [
            CanonicalPage(
                page_number=1,
                parser_route=self.name,
                text_quality_score=0.0,
                elements=[],
                warnings=[
                    "No pages were produced by Docling; OCR or manual review may be required."
                ],
            )
        ]

    def _iter_docling_items(self, docling_document: Any) -> list[Any]:
        if hasattr(docling_document, "iterate_items"):
            return [
                entry[0] if isinstance(entry, tuple) else entry
                for entry in docling_document.iterate_items()
            ]
        return [
            *list(getattr(docling_document, "texts", []) or []),
            *list(getattr(docling_document, "tables", []) or []),
            *list(getattr(docling_document, "pictures", []) or []),
        ]

    def _to_element(self, item: Any, index: int, docling_document: Any) -> DocumentElement:
        label = str(getattr(item, "label", "")).lower()
        text = getattr(item, "text", None)
        markdown = self._item_markdown(item, docling_document)
        table_data = self._table_data(item) if "table" in label else None
        page_number = self._page_number(item)
        element_type = self._element_type(item, label, index)
        return DocumentElement(
            element_id=f"e{index:06d}",
            element_type=element_type,
            text=text if isinstance(text, str) else None,
            markdown=markdown,
            table_data=table_data,
            page_number=page_number,
            bounding_box=self._bounding_box(item),
            parent_element_id=self._parent_ref(item),
            parser_name=self.name,
            parser_version=self.parser_version,
            confidence=None,
            metadata={
                "docling_ref": str(getattr(item, "self_ref", "")),
                "docling_label": label,
            },
        )

    def _element_type(self, item: Any, label: str, index: int) -> ElementType:
        level = getattr(item, "level", None)
        if "table" in label:
            return "table"
        if "picture" in label or "image" in label:
            return "image"
        if "list" in label:
            return "list_item"
        if "section_header" in label or "heading" in label:
            return "title" if index == 1 and level == 1 else "heading"
        if getattr(item, "hyperlink", None):
            return "hyperlink"
        if "caption" in label:
            return "caption"
        if "text" in label or "paragraph" in label:
            return "paragraph"
        return "unknown"

    def _item_markdown(self, item: Any, docling_document: Any) -> str | None:
        if hasattr(item, "export_to_markdown"):
            try:
                markdown = item.export_to_markdown(doc=docling_document)
            except TypeError:
                markdown = item.export_to_markdown()
            if isinstance(markdown, str) and markdown.strip():
                return markdown
        text = getattr(item, "text", None)
        return text if isinstance(text, str) and text.strip() else None

    def _table_data(self, item: Any) -> dict[str, object] | None:
        data = getattr(item, "data", None)
        if data is None:
            return None
        if hasattr(data, "model_dump"):
            return cast(dict[str, object], data.model_dump(mode="json"))
        if hasattr(data, "dict"):
            return cast(dict[str, object], data.dict())
        return {"raw": str(data)}

    def _page_number(self, item: Any) -> int | None:
        prov = getattr(item, "prov", None) or []
        first = prov[0] if prov else None
        page_no = getattr(first, "page_no", None)
        return int(page_no) if page_no is not None else None

    def _bounding_box(self, item: Any) -> BoundingBox | None:
        prov = getattr(item, "prov", None) or []
        first = prov[0] if prov else None
        bbox = getattr(first, "bbox", None)
        if bbox is None:
            return None
        left = getattr(bbox, "l", None)
        top = getattr(bbox, "t", None)
        right = getattr(bbox, "r", None)
        bottom = getattr(bbox, "b", None)
        if None in {left, top, right, bottom}:
            return None
        left_float = cast(float, left)
        top_float = cast(float, top)
        right_float = cast(float, right)
        bottom_float = cast(float, bottom)
        return BoundingBox(
            x0=float(left_float),
            y0=float(top_float),
            x1=float(right_float),
            y1=float(bottom_float),
        )

    def _parent_ref(self, item: Any) -> str | None:
        parent = getattr(item, "parent", None)
        cref = getattr(parent, "cref", None)
        return str(cref) if cref else None

    def _native_json(self, docling_document: Any) -> str:
        if hasattr(docling_document, "model_dump_json"):
            return str(docling_document.model_dump_json())
        if hasattr(docling_document, "json"):
            return str(docling_document.json())
        return "{}"

    def _document_warnings(self, pages: list[CanonicalPage]) -> list[str]:
        warnings = [warning for page in pages for warning in page.warnings]
        if pages and all(not page.elements for page in pages):
            warnings.append("Document produced no canonical elements; OCR may be required.")
        return warnings
