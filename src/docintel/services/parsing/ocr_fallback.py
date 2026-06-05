from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from docintel.config import Settings
from docintel.domain.canonical_ir import CanonicalDocument, CanonicalPage, DocumentElement
from docintel.services.parsing.base import DocumentParser
from docintel.services.parsing.olmocr_parser import OlmocrParser

OcrStatus = Literal["not_required", "disabled", "applied", "retryable"]


@dataclass(frozen=True)
class OcrFallbackResult:
    """Result of evaluating and optionally applying OCR fallback."""

    canonical: CanonicalDocument
    required_pages: list[int]
    status: OcrStatus
    message: str

    @property
    def retryable(self) -> bool:
        """Return whether the document can be retried after enabling OCR."""

        return self.status in {"disabled", "retryable"}


class OcrFallbackService:
    """Detect low-text pages and merge optional olmOCR output into canonical IR."""

    def __init__(self, settings: Settings, parser: DocumentParser | None = None) -> None:
        self.settings = settings
        self.parser = parser

    async def apply(
        self,
        canonical: CanonicalDocument,
        file_path: Path,
    ) -> OcrFallbackResult:
        """Apply feature-flagged OCR fallback to pages that require it."""

        required_pages = self.required_pages(canonical)
        if not required_pages:
            return OcrFallbackResult(
                canonical=canonical,
                required_pages=[],
                status="not_required",
                message="OCR fallback was not required.",
            )

        if not self._enabled():
            return OcrFallbackResult(
                canonical=self._mark_retryable(
                    canonical,
                    required_pages,
                    "OCR is required for low-text pages but OCR is disabled.",
                ),
                required_pages=required_pages,
                status="disabled",
                message=(
                    "OCR is required for pages "
                    f"{', '.join(str(page) for page in required_pages)} but OCR is disabled. "
                    "Set OCR_PROVIDER=olmocr and OLMOCR_ENABLED=true, then reprocess."
                ),
            )

        parser = self.parser or OlmocrParser(
            settings=self.settings,
            file_name=canonical.file_name,
            file_type=canonical.file_type,
            checksum_sha256=canonical.checksum_sha256,
        )
        if not parser.supports(str(file_path)):
            return OcrFallbackResult(
                canonical=self._mark_retryable(
                    canonical,
                    required_pages,
                    "Configured OCR provider does not support this file.",
                ),
                required_pages=required_pages,
                status="retryable",
                message="Configured OCR provider does not support this file.",
            )

        try:
            ocr_document = await parser.parse(str(file_path), str(canonical.document_id))
        except Exception as exc:
            return OcrFallbackResult(
                canonical=self._mark_retryable(
                    canonical,
                    required_pages,
                    f"olmOCR fallback failed: {exc}",
                ),
                required_pages=required_pages,
                status="retryable",
                message=f"olmOCR fallback failed: {exc}",
            )

        merged = self._merge_ocr_pages(canonical, ocr_document, required_pages)
        return OcrFallbackResult(
            canonical=merged,
            required_pages=required_pages,
            status="applied",
            message=(
                f"Applied OCR fallback to pages {', '.join(str(page) for page in required_pages)}."
            ),
        )

    def required_pages(self, canonical: CanonicalDocument) -> list[int]:
        """Return page numbers that should be retried through OCR."""

        return [
            page.page_number
            for page in canonical.pages
            if self.page_requires_ocr(page, self.settings.min_text_quality_score)
        ]

    @staticmethod
    def page_requires_ocr(page: CanonicalPage, min_text_quality_score: float) -> bool:
        """Return whether deterministic routing rules consider this page OCR-required."""

        text_length = sum(len(element.text or element.markdown or "") for element in page.elements)
        warning_text = " ".join(page.warnings).casefold()
        if "ocr" in warning_text or "scanned" in warning_text or "no useful text" in warning_text:
            return True
        if not page.elements:
            return True
        if page.text_quality_score is not None and page.text_quality_score < min_text_quality_score:
            return text_length < 80
        return text_length == 0

    def _enabled(self) -> bool:
        return self.settings.ocr_provider == "olmocr" and self.settings.olmocr_enabled

    def _mark_retryable(
        self, canonical: CanonicalDocument, required_pages: list[int], warning: str
    ) -> CanonicalDocument:
        required = set(required_pages)
        pages = [
            page.model_copy(
                update={
                    "warnings": [
                        *page.warnings,
                        warning,
                    ]
                    if page.page_number in required and warning not in page.warnings
                    else page.warnings
                }
            )
            for page in canonical.pages
        ]
        warnings = list(canonical.warnings)
        document_warning = (
            f"{warning} Required pages: {', '.join(str(page) for page in required_pages)}."
        )
        if document_warning not in warnings:
            warnings.append(document_warning)
        metadata = {
            **canonical.metadata,
            "ocr_status": "retryable",
            "ocr_provider": self.settings.ocr_provider,
            "ocr_required_pages": required_pages,
        }
        return canonical.model_copy(
            update={"pages": pages, "warnings": warnings, "metadata": metadata}
        )

    def _merge_ocr_pages(
        self,
        canonical: CanonicalDocument,
        ocr_document: CanonicalDocument,
        required_pages: list[int],
    ) -> CanonicalDocument:
        ocr_pages = {page.page_number: page for page in ocr_document.pages}
        required = set(required_pages)
        pages: list[CanonicalPage] = []
        merged_pages: list[int] = []
        for page in canonical.pages:
            if page.page_number not in required or page.page_number not in ocr_pages:
                pages.append(page)
                continue
            ocr_page = ocr_pages[page.page_number]
            ocr_elements = [
                self._copy_ocr_element(page.page_number, element, index)
                for index, element in enumerate(ocr_page.elements, start=1)
            ]
            pages.append(
                page.model_copy(
                    update={
                        "parser_route": f"{page.parser_route}+olmocr",
                        "text_quality_score": max(page.text_quality_score or 0.0, 1.0),
                        "elements": [*page.elements, *ocr_elements],
                        "warnings": [
                            warning
                            for warning in page.warnings
                            if "ocr may be required" not in warning.casefold()
                        ],
                    }
                )
            )
            merged_pages.append(page.page_number)

        warnings = [
            warning
            for warning in canonical.warnings
            if "ocr may be required" not in warning.casefold()
        ]
        if missing_pages := sorted(required - set(merged_pages)):
            warnings.append(
                "olmOCR did not return usable text for pages "
                f"{', '.join(str(page) for page in missing_pages)}."
            )
        metadata = {
            **canonical.metadata,
            "ocr_status": "applied",
            "ocr_provider": "olmocr",
            "ocr_required_pages": required_pages,
            "ocr_merged_pages": merged_pages,
        }
        return canonical.model_copy(
            update={"pages": pages, "warnings": warnings, "metadata": metadata}
        )

    def _copy_ocr_element(
        self, page_number: int, element: DocumentElement, index: int
    ) -> DocumentElement:
        return element.model_copy(
            update={
                "element_id": f"ocr-p{page_number:04d}-e{index:04d}",
                "page_number": page_number,
                "parser_name": "olmocr",
                "metadata": {
                    **element.metadata,
                    "ocr_provider": "olmocr",
                    "source_element_id": element.element_id,
                },
            }
        )
