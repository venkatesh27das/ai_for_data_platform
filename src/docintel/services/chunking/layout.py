from __future__ import annotations

from dataclasses import dataclass, field
from uuid import UUID

from docintel.domain.canonical_ir import CanonicalDocument, DocumentElement


@dataclass(frozen=True)
class LayoutAwareChunk:
    """A chunk generated from canonical document layout."""

    chunk_id: str
    document_id: UUID
    chunk_type: str
    text: str
    markdown: str | None
    section_path: list[str]
    page_numbers: list[int]
    source_element_ids: list[str]
    quality_score: float | None
    metadata: dict[str, object] = field(default_factory=dict)


class LayoutAwareChunker:
    """Build chunks from canonical document elements."""

    def __init__(self, chunk_size_tokens: int, chunk_overlap_tokens: int) -> None:
        self.chunk_size_tokens = chunk_size_tokens
        self.chunk_overlap_tokens = chunk_overlap_tokens

    def build_chunks(self, document: CanonicalDocument) -> list[LayoutAwareChunk]:
        """Generate layout-aware chunks from a canonical document."""

        chunks: list[LayoutAwareChunk] = []
        section_path: list[str] = []
        pending: list[DocumentElement] = []

        def flush_pending() -> None:
            nonlocal pending
            if not pending:
                return
            chunks.extend(self._chunk_text_elements(document, pending, section_path))
            pending = []

        for page in document.pages:
            for element in page.elements:
                if element.element_type in {"title", "heading"}:
                    flush_pending()
                    heading = (element.text or element.markdown or "").strip()
                    if heading:
                        if element.element_type == "title":
                            section_path = [heading]
                        else:
                            section_path = (
                                [*section_path[:1], heading] if section_path else [heading]
                            )
                    pending.append(element)
                    continue
                if element.element_type == "table":
                    flush_pending()
                    chunks.append(
                        self._table_chunk(document, element, section_path, len(chunks) + 1)
                    )
                    continue
                if element.element_type == "image":
                    if element.text or element.markdown:
                        flush_pending()
                        chunks.append(
                            self._single_element_chunk(
                                document,
                                element,
                                "image",
                                section_path,
                                len(chunks) + 1,
                            )
                        )
                    continue
                pending.append(element)
        flush_pending()
        return [
            chunk
            for index, chunk in enumerate(chunks, start=1)
            if chunk.text.strip()
            for chunk in [self._with_stable_id(chunk, index)]
        ]

    def _chunk_text_elements(
        self,
        document: CanonicalDocument,
        elements: list[DocumentElement],
        section_path: list[str],
    ) -> list[LayoutAwareChunk]:
        text = "\n\n".join(
            value
            for element in elements
            for value in [element.markdown or element.text or ""]
            if value.strip()
        ).strip()
        if not text:
            return []
        words = text.split()
        if len(words) <= self.chunk_size_tokens:
            return [
                self._make_chunk(
                    document,
                    "text",
                    text,
                    text,
                    section_path,
                    elements,
                    ordinal=1,
                )
            ]

        chunks: list[LayoutAwareChunk] = []
        step = max(1, self.chunk_size_tokens - self.chunk_overlap_tokens)
        for ordinal, start in enumerate(range(0, len(words), step), start=1):
            window = words[start : start + self.chunk_size_tokens]
            if not window:
                continue
            chunks.append(
                self._make_chunk(
                    document,
                    "text",
                    " ".join(window),
                    " ".join(window),
                    section_path,
                    elements,
                    ordinal=ordinal,
                    metadata={"split": True, "word_start": start},
                )
            )
            if start + self.chunk_size_tokens >= len(words):
                break
        return chunks

    def _table_chunk(
        self,
        document: CanonicalDocument,
        element: DocumentElement,
        section_path: list[str],
        ordinal: int,
    ) -> LayoutAwareChunk:
        return self._make_chunk(
            document,
            "table",
            element.markdown or element.text or "",
            element.markdown,
            section_path,
            [element],
            ordinal=ordinal,
            metadata={"table_data": element.table_data or {}},
        )

    def _single_element_chunk(
        self,
        document: CanonicalDocument,
        element: DocumentElement,
        chunk_type: str,
        section_path: list[str],
        ordinal: int,
    ) -> LayoutAwareChunk:
        return self._make_chunk(
            document,
            chunk_type,
            element.markdown or element.text or "",
            element.markdown,
            section_path,
            [element],
            ordinal=ordinal,
        )

    def _make_chunk(
        self,
        document: CanonicalDocument,
        chunk_type: str,
        text: str,
        markdown: str | None,
        section_path: list[str],
        elements: list[DocumentElement],
        ordinal: int,
        metadata: dict[str, object] | None = None,
    ) -> LayoutAwareChunk:
        page_numbers = sorted(
            {element.page_number for element in elements if element.page_number is not None}
        )
        quality_scores = [
            page.text_quality_score
            for page in document.pages
            if page.page_number in page_numbers and page.text_quality_score is not None
        ]
        return LayoutAwareChunk(
            chunk_id=f"pending-{ordinal:06d}",
            document_id=document.document_id,
            chunk_type=chunk_type,
            text=text.strip(),
            markdown=markdown.strip() if markdown else None,
            section_path=list(section_path),
            page_numbers=page_numbers,
            source_element_ids=[element.element_id for element in elements],
            quality_score=round(sum(quality_scores) / len(quality_scores), 3)
            if quality_scores
            else None,
            metadata={
                "file_name": document.file_name,
                "file_type": document.file_type,
                "document_class": document.document_class,
                **(metadata or {}),
            },
        )

    def _with_stable_id(self, chunk: LayoutAwareChunk, index: int) -> LayoutAwareChunk:
        return LayoutAwareChunk(
            chunk_id=f"chunk-{index:06d}",
            document_id=chunk.document_id,
            chunk_type=chunk.chunk_type,
            text=chunk.text,
            markdown=chunk.markdown,
            section_path=chunk.section_path,
            page_numbers=chunk.page_numbers,
            source_element_ids=chunk.source_element_ids,
            quality_score=chunk.quality_score,
            metadata=chunk.metadata,
        )
