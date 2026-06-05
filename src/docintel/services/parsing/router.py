from __future__ import annotations

from docintel.services.parsing.base import DocumentParser


class CompositeParserRouter:
    """Deterministic parser router for Phase 2."""

    def __init__(self, parsers: list[DocumentParser]) -> None:
        self.parsers = parsers

    def select(self, file_path: str) -> DocumentParser:
        """Return the first parser that supports the file path."""

        for parser in self.parsers:
            if parser.supports(file_path):
                return parser
        raise ValueError(f"no parser supports {file_path}")
