from pathlib import Path
from uuid import UUID, uuid4

from docintel.config import Settings
from docintel.domain.canonical_ir import CanonicalDocument, CanonicalPage, DocumentElement
from docintel.services.parsing.ocr_fallback import OcrFallbackService
from docintel.services.parsing.olmocr_parser import OlmocrParser


def _low_text_document(document_id: UUID) -> CanonicalDocument:
    return CanonicalDocument(
        document_id=document_id,
        file_name="scan.pdf",
        file_type="pdf",
        checksum_sha256="a" * 64,
        pages=[
            CanonicalPage(
                page_number=1,
                parser_route="docling",
                text_quality_score=0.0,
                elements=[],
                warnings=["No useful text extracted; OCR may be required."],
            )
        ],
    )


def test_ocr_disabled_marks_required_pages_retryable(tmp_path: Path) -> None:
    document_id = uuid4()
    canonical = _low_text_document(document_id)
    settings = Settings(ocr_provider="disabled", olmocr_enabled=False)

    result = run_async(OcrFallbackService(settings).apply(canonical, tmp_path / "scan.pdf"))

    assert result.status == "disabled"
    assert result.retryable is True
    assert result.required_pages == [1]
    assert result.canonical.metadata["ocr_status"] == "retryable"
    assert result.canonical.metadata["ocr_required_pages"] == [1]
    assert "OCR is required" in result.canonical.warnings[0]
    assert "OCR is required" in result.canonical.pages[0].warnings[-1]


def test_ocr_enabled_merges_fallback_text(tmp_path: Path) -> None:
    document_id = uuid4()
    canonical = _low_text_document(document_id)
    settings = Settings(ocr_provider="olmocr", olmocr_enabled=True)
    parser = FakeOcrParser(document_id)

    result = run_async(
        OcrFallbackService(settings, parser=parser).apply(canonical, tmp_path / "scan.pdf")
    )

    assert result.status == "applied"
    assert result.retryable is False
    assert result.canonical.metadata["ocr_status"] == "applied"
    assert result.canonical.metadata["ocr_merged_pages"] == [1]
    page = result.canonical.pages[0]
    assert page.parser_route == "docling+olmocr"
    assert page.text_quality_score == 1.0
    assert page.elements[0].text == "Recognized OCR text from page one."
    assert page.elements[0].parser_name == "olmocr"
    assert not page.warnings


def test_olmocr_parser_supports_only_enabled_pdf() -> None:
    enabled = OlmocrParser(
        Settings(ocr_provider="olmocr", olmocr_enabled=True),
        file_name="scan.pdf",
        file_type="pdf",
        checksum_sha256="a" * 64,
    )
    disabled = OlmocrParser(
        Settings(ocr_provider="disabled", olmocr_enabled=False),
        file_name="scan.pdf",
        file_type="pdf",
        checksum_sha256="a" * 64,
    )

    assert enabled.supports("scan.pdf") is True
    assert enabled.supports("contract.docx") is False
    assert disabled.supports("scan.pdf") is False


class FakeOcrParser:
    name = "olmocr"

    def __init__(self, document_id: UUID) -> None:
        self.document_id = document_id

    def supports(self, file_path: str) -> bool:
        _ = file_path
        return True

    async def parse(self, file_path: str, document_id: str) -> CanonicalDocument:
        _ = file_path, document_id
        return CanonicalDocument(
            document_id=self.document_id,
            file_name="scan.pdf",
            file_type="pdf",
            checksum_sha256="a" * 64,
            pages=[
                CanonicalPage(
                    page_number=1,
                    parser_route="olmocr",
                    text_quality_score=1.0,
                    elements=[
                        DocumentElement(
                            element_id="p1",
                            element_type="paragraph",
                            text="Recognized OCR text from page one.",
                            markdown="Recognized OCR text from page one.",
                            page_number=1,
                            parser_name="olmocr",
                        )
                    ],
                )
            ],
        )


def run_async(coro):
    import asyncio

    return asyncio.run(coro)
