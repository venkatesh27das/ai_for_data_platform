from __future__ import annotations

from docintel.domain.canonical_ir import CanonicalDocument


class OlmocrParser:
    """Feature-flagged placeholder for the future isolated olmOCR adapter."""

    name = "olmocr"

    def supports(self, file_path: str) -> bool:
        """Return false until the independent OCR runtime is configured."""

        _ = file_path
        return False

    async def parse(self, file_path: str, document_id: str) -> CanonicalDocument:
        """Fail clearly because OCR is not part of Phase 2."""

        _ = file_path, document_id
        raise RuntimeError("olmOCR is not enabled in the main application environment")
