from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from docintel.domain.canonical_ir import SourceEvidence


class ExtractedField(BaseModel):
    """Generic extracted scalar field."""

    field_name: str
    field_type: str
    value: str
    normalized_value: str | None = None
    confidence: float
    evidence: list[SourceEvidence]
    extractor_name: str


class ExtractedEntity(BaseModel):
    """Generic extracted entity."""

    entity_type: str
    canonical_name: str
    raw_mention: str
    attributes: dict[str, object] = Field(default_factory=dict)
    confidence: float
    evidence: list[SourceEvidence]
    extractor_name: str


class ExtractedRelationship(BaseModel):
    """Generic extracted relationship."""

    relationship_type: str
    source_entity: str
    target_entity: str
    attributes: dict[str, object] = Field(default_factory=dict)
    confidence: float
    evidence: list[SourceEvidence]
    extractor_name: str


class ExtractedEvent(BaseModel):
    """Generic extracted event."""

    event_type: str
    name: str
    attributes: dict[str, object] = Field(default_factory=dict)
    confidence: float
    evidence: list[SourceEvidence]
    extractor_name: str


class ExtractedClaim(BaseModel):
    """Generic extracted claim."""

    claim_text: str
    attributes: dict[str, object] = Field(default_factory=dict)
    confidence: float
    evidence: list[SourceEvidence]
    extractor_name: str


class ExtractedObligation(BaseModel):
    """Generic extracted obligation."""

    obligation_text: str
    obligated_party: str | None = None
    attributes: dict[str, object] = Field(default_factory=dict)
    confidence: float
    evidence: list[SourceEvidence]
    extractor_name: str


class GenericExtractionResult(BaseModel):
    """Stable generic extraction result from deterministic and model extractors."""

    document_id: UUID
    fields: list[ExtractedField] = Field(default_factory=list)
    entities: list[ExtractedEntity] = Field(default_factory=list)
    relationships: list[ExtractedRelationship] = Field(default_factory=list)
    events: list[ExtractedEvent] = Field(default_factory=list)
    claims: list[ExtractedClaim] = Field(default_factory=list)
    obligations: list[ExtractedObligation] = Field(default_factory=list)

    @field_validator("fields", "entities", "relationships", "events", "claims", "obligations")
    @classmethod
    def require_evidence(cls, items: list[BaseModel]) -> list[BaseModel]:
        """Reject model output that cannot be traced back to source text."""

        for item in items:
            evidence = getattr(item, "evidence", None)
            if not evidence:
                raise ValueError("all extracted items must include source evidence")
        return items
