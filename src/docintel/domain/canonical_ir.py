from __future__ import annotations

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Normalized document-space bounding box."""

    x0: float
    y0: float
    x1: float
    y1: float


class SourceEvidence(BaseModel):
    """Source pointer for extracted or normalized content."""

    document_id: UUID
    page_number: int | None = None
    element_id: str | None = None
    bounding_box: BoundingBox | None = None
    source_text: str | None = None


class DocumentElement(BaseModel):
    """One normalized document element."""

    element_id: str
    element_type: Literal[
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
    text: str | None = None
    markdown: str | None = None
    table_data: dict[str, object] | None = None
    image_artifact_uri: str | None = None
    page_number: int | None = None
    bounding_box: BoundingBox | None = None
    parent_element_id: str | None = None
    parser_name: str
    parser_version: str | None = None
    confidence: float | None = None
    metadata: dict[str, object] = Field(default_factory=dict)


class CanonicalPage(BaseModel):
    """One page in the normalized canonical representation."""

    page_number: int
    parser_route: str
    text_quality_score: float | None = None
    elements: list[DocumentElement]
    warnings: list[str] = Field(default_factory=list)


class CanonicalDocument(BaseModel):
    """Versioned canonical document representation used by later projections."""

    schema_version: str = "1.0.0"
    document_id: UUID
    file_name: str
    file_type: Literal["pdf", "docx"]
    checksum_sha256: str
    document_class: str | None = None
    pages: list[CanonicalPage]
    metadata: dict[str, object] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)

    def to_markdown(self) -> str:
        """Render a readable Markdown projection from canonical elements."""

        chunks: list[str] = []
        for page in self.pages:
            if len(self.pages) > 1:
                chunks.append(f"<!-- page {page.page_number} -->")
            for element in page.elements:
                if element.markdown:
                    chunks.append(element.markdown)
                elif element.text:
                    chunks.append(element.text)
        return "\n\n".join(chunk for chunk in chunks if chunk.strip())
