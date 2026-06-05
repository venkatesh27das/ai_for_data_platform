from __future__ import annotations

import importlib.metadata
from pathlib import Path
from typing import Any, cast
from uuid import UUID

import httpx

from docintel.config import Settings
from docintel.domain.canonical_ir import CanonicalDocument, CanonicalPage, DocumentElement


class OlmocrParser:
    """Feature-flagged HTTP adapter for an independently running olmOCR service."""

    name = "olmocr"

    def __init__(
        self, settings: Settings, file_name: str, file_type: str, checksum_sha256: str
    ) -> None:
        self.settings = settings
        self.file_name = file_name
        self.file_type = file_type
        self.checksum_sha256 = checksum_sha256
        self.parser_version = self._parser_version()

    def supports(self, file_path: str) -> bool:
        """Return whether the configured OCR runtime should handle this file."""

        return (
            self.settings.ocr_provider == "olmocr"
            and self.settings.olmocr_enabled
            and Path(file_path).suffix.lower() == ".pdf"
        )

    async def parse(self, file_path: str, document_id: str) -> CanonicalDocument:
        """Call the isolated olmOCR service and normalize its response into canonical IR."""

        if not self.supports(file_path):
            raise RuntimeError("olmOCR is not enabled or does not support this file")

        endpoint = f"{self.settings.olmocr_base_url.rstrip('/')}/ocr"
        timeout = httpx.Timeout(float(self.settings.olmocr_timeout_seconds))
        path = Path(file_path)
        async with httpx.AsyncClient(timeout=timeout) as client:
            with path.open("rb") as source:
                response = await client.post(
                    endpoint,
                    files={"file": (path.name, source, "application/pdf")},
                    data={"document_id": document_id},
                )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise RuntimeError("olmOCR returned a non-object response")
        return self._document_from_payload(cast(dict[str, Any], payload), UUID(document_id))

    def _document_from_payload(
        self, payload: dict[str, Any], document_id: UUID
    ) -> CanonicalDocument:
        if {"document_id", "file_name", "file_type", "checksum_sha256", "pages"} <= set(payload):
            return CanonicalDocument.model_validate(payload)

        pages_payload = payload.get("pages")
        pages = self._pages_from_payload(pages_payload if isinstance(pages_payload, list) else None)
        if not pages:
            text = payload.get("markdown") or payload.get("text")
            if not isinstance(text, str) or not text.strip():
                raise RuntimeError("olmOCR response did not include usable text")
            pages = [self._page_from_text(1, text)]

        return CanonicalDocument(
            document_id=document_id,
            file_name=self.file_name,
            file_type=self.file_type,  # type: ignore[arg-type]
            checksum_sha256=self.checksum_sha256,
            pages=pages,
            metadata={
                "parser_name": self.name,
                "parser_version": self.parser_version,
                "ocr_provider": "olmocr",
            },
        )

    def _pages_from_payload(self, pages_payload: list[Any] | None) -> list[CanonicalPage]:
        if not pages_payload:
            return []

        pages: list[CanonicalPage] = []
        for index, raw_page in enumerate(pages_payload, start=1):
            if not isinstance(raw_page, dict):
                continue
            page = cast(dict[str, Any], raw_page)
            page_number = int(page.get("page_number") or index)
            elements = self._elements_from_payload(page, page_number)
            if not elements:
                text = page.get("markdown") or page.get("text")
                if isinstance(text, str) and text.strip():
                    elements = [self._text_element(page_number, text, 1)]
            if elements:
                pages.append(
                    CanonicalPage(
                        page_number=page_number,
                        parser_route=self.name,
                        text_quality_score=float(page.get("text_quality_score") or 1.0),
                        elements=elements,
                        warnings=[
                            str(warning)
                            for warning in page.get("warnings", [])
                            if isinstance(warning, str)
                        ],
                    )
                )
        return pages

    def _elements_from_payload(
        self, page: dict[str, Any], page_number: int
    ) -> list[DocumentElement]:
        raw_elements = page.get("elements")
        if not isinstance(raw_elements, list):
            return []

        elements: list[DocumentElement] = []
        for index, raw_element in enumerate(raw_elements, start=1):
            if not isinstance(raw_element, dict):
                continue
            element = cast(dict[str, Any], raw_element)
            text = element.get("text") or element.get("markdown")
            if not isinstance(text, str) or not text.strip():
                continue
            elements.append(self._text_element(page_number, text, index))
        return elements

    def _page_from_text(self, page_number: int, text: str) -> CanonicalPage:
        return CanonicalPage(
            page_number=page_number,
            parser_route=self.name,
            text_quality_score=1.0,
            elements=[self._text_element(page_number, text, 1)],
        )

    def _text_element(self, page_number: int, text: str, index: int) -> DocumentElement:
        return DocumentElement(
            element_id=f"ocr-p{page_number:04d}-e{index:04d}",
            element_type="paragraph",
            text=text,
            markdown=text,
            page_number=page_number,
            parser_name=self.name,
            parser_version=self.parser_version,
            confidence=1.0,
            metadata={"ocr_provider": "olmocr"},
        )

    def _parser_version(self) -> str | None:
        try:
            return importlib.metadata.version("olmocr")
        except importlib.metadata.PackageNotFoundError:
            return None
