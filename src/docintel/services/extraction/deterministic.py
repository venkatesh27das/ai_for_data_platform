from __future__ import annotations

import re
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from typing import TypeVar
from uuid import UUID

from docintel.db.models import Chunk
from docintel.domain.canonical_ir import SourceEvidence
from docintel.domain.extraction import (
    ExtractedEntity,
    ExtractedField,
    ExtractedObligation,
    ExtractedRelationship,
    GenericExtractionResult,
)

EXTRACTOR_NAME = "deterministic_patterns_v1"


@dataclass(frozen=True)
class PatternSpec:
    """Deterministic scalar extraction pattern."""

    field_name: str
    field_type: str
    entity_type: str
    pattern: re.Pattern[str]
    confidence: float
    normalize_lower: bool = False


PATTERNS: tuple[PatternSpec, ...] = (
    PatternSpec(
        "email",
        "email",
        "Email",
        re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE),
        0.98,
        normalize_lower=True,
    ),
    PatternSpec(
        "url",
        "url",
        "URL",
        re.compile(r"\bhttps?://[^\s<>()]+", re.IGNORECASE),
        0.96,
        normalize_lower=True,
    ),
    PatternSpec(
        "phone_number",
        "phone",
        "PhoneNumber",
        re.compile(r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b"),
        0.88,
    ),
    PatternSpec(
        "currency_amount",
        "currency",
        "Amount",
        re.compile(
            r"(?:[$€£₹]\s?\d[\d,]*(?:\.\d{2})?|\b\d[\d,]*(?:\.\d{2})?\s?(?:USD|EUR|GBP|INR)\b)"
        ),
        0.90,
    ),
    PatternSpec(
        "percentage",
        "percentage",
        "Percentage",
        re.compile(r"\b\d+(?:\.\d+)?\s?%"),
        0.92,
    ),
    PatternSpec(
        "date",
        "date",
        "Date",
        re.compile(
            r"\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{2,4}|"
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)"
            r"[a-z]*\s+\d{1,2},?\s+\d{4})\b",
            re.IGNORECASE,
        ),
        0.86,
    ),
    PatternSpec(
        "identifier",
        "identifier",
        "Identifier",
        re.compile(r"\b[A-Z]{2,}[A-Z0-9]*[-_][A-Z0-9][A-Z0-9-_]{2,}\b"),
        0.78,
    ),
)

OBLIGATION_PATTERN = re.compile(
    r"\b(shall|must|required to|is required to|are required to|will be responsible for)\b",
    re.IGNORECASE,
)
T = TypeVar("T")


class DeterministicExtractor:
    """Extract stable generic facts with regexes before any model call."""

    def extract(
        self, document_id: UUID, file_name: str, chunks: Sequence[Chunk]
    ) -> GenericExtractionResult:
        """Extract deterministic fields, entities, relationships, and obligations."""

        fields: list[ExtractedField] = []
        entities: list[ExtractedEntity] = []
        relationships: list[ExtractedRelationship] = []
        obligations: list[ExtractedObligation] = []
        seen_fields: set[tuple[str, str, int | None]] = set()
        seen_entities: set[tuple[str, str]] = set()
        seen_relationships: set[tuple[str, str, str]] = set()
        seen_obligations: set[str] = set()

        for chunk in chunks:
            text = chunk.text.strip()
            if not text:
                continue
            for spec in PATTERNS:
                for match in spec.pattern.finditer(text):
                    value = match.group(0).strip().rstrip(".,;:")
                    if not value:
                        continue
                    normalized = value.lower() if spec.normalize_lower else value
                    evidence = [_evidence_for_match(document_id, chunk, text, match)]
                    page_number = evidence[0].page_number
                    field_key = (spec.field_name, normalized, page_number)
                    if field_key not in seen_fields:
                        seen_fields.add(field_key)
                        fields.append(
                            ExtractedField(
                                field_name=spec.field_name,
                                field_type=spec.field_type,
                                value=value,
                                normalized_value=normalized,
                                confidence=spec.confidence,
                                evidence=evidence,
                                extractor_name=EXTRACTOR_NAME,
                            )
                        )
                    entity_key = (spec.entity_type, normalized.casefold())
                    if entity_key not in seen_entities:
                        seen_entities.add(entity_key)
                        entities.append(
                            ExtractedEntity(
                                entity_type=spec.entity_type,
                                canonical_name=normalized,
                                raw_mention=value,
                                attributes={"field_type": spec.field_type},
                                confidence=spec.confidence,
                                evidence=evidence,
                                extractor_name=EXTRACTOR_NAME,
                            )
                        )
                    relationship_key = ("MENTIONS", file_name, normalized.casefold())
                    if relationship_key not in seen_relationships:
                        seen_relationships.add(relationship_key)
                        relationships.append(
                            ExtractedRelationship(
                                relationship_type="MENTIONS",
                                source_entity=file_name,
                                target_entity=normalized,
                                attributes={"target_type": spec.entity_type},
                                confidence=min(spec.confidence, 0.90),
                                evidence=evidence,
                                extractor_name=EXTRACTOR_NAME,
                            )
                        )

            for sentence in _sentences(text):
                if not OBLIGATION_PATTERN.search(sentence):
                    continue
                normalized_sentence = " ".join(sentence.split())
                if normalized_sentence.casefold() in seen_obligations:
                    continue
                seen_obligations.add(normalized_sentence.casefold())
                evidence = [_evidence_for_text(document_id, chunk, normalized_sentence)]
                obligations.append(
                    ExtractedObligation(
                        obligation_text=normalized_sentence,
                        attributes={"source": "modal_keyword"},
                        confidence=0.74,
                        evidence=evidence,
                        extractor_name=EXTRACTOR_NAME,
                    )
                )

        return GenericExtractionResult(
            document_id=document_id,
            fields=fields,
            entities=entities,
            relationships=relationships,
            obligations=obligations,
        )


def _evidence_for_match(
    document_id: UUID, chunk: Chunk, text: str, match: re.Match[str]
) -> SourceEvidence:
    start = max(0, match.start() - 120)
    end = min(len(text), match.end() + 120)
    return SourceEvidence(
        document_id=document_id,
        page_number=_first_or_none(chunk.page_numbers_json),
        element_id=_first_or_none(chunk.source_element_ids_json),
        source_text=text[start:end].strip(),
    )


def _evidence_for_text(document_id: UUID, chunk: Chunk, source_text: str) -> SourceEvidence:
    return SourceEvidence(
        document_id=document_id,
        page_number=_first_or_none(chunk.page_numbers_json),
        element_id=_first_or_none(chunk.source_element_ids_json),
        source_text=source_text,
    )


def _sentences(text: str) -> Iterable[str]:
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        sentence = sentence.strip()
        if 20 <= len(sentence) <= 800:
            yield sentence


def _first_or_none(values: Sequence[T]) -> T | None:
    return values[0] if values else None
