from __future__ import annotations

from typing import Protocol

from docintel.domain.canonical_ir import CanonicalDocument


class DocumentParser(Protocol):
    """Parser interface for converting source files into canonical IR."""

    name: str

    def supports(self, file_path: str) -> bool:
        """Return whether this parser can process the file."""

    async def parse(self, file_path: str, document_id: str) -> CanonicalDocument:
        """Parse a file into a canonical document."""
