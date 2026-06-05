from __future__ import annotations

import re
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from docintel.db.models import Document, EntityRecord
from docintel.db.repositories.documents import DocumentRepository


@dataclass(frozen=True)
class EntityResolutionResult:
    """Summary of an exact-match entity resolution run."""

    document_id: UUID
    canonical_count: int
    resolved_count: int
    alias_count: int


class ExactMatchEntityResolver:
    """Resolve entities by normalized type/name equality."""

    def __init__(self, session: Session) -> None:
        self.repository = DocumentRepository(session)

    def resolve_document(self, document: Document) -> EntityResolutionResult:
        """Resolve extracted entities for a document."""

        entities = list(self.repository.list_entities(document.id))
        grouped: dict[tuple[str, str], list[EntityRecord]] = {}
        for entity in entities:
            normalized_key = normalize_entity_key(entity.canonical_name)
            entity.normalized_key = normalized_key
            grouped.setdefault((entity.entity_type.casefold(), normalized_key), []).append(entity)

        aliases: list[tuple[UUID, str, str, float, str]] = []
        canonical_count = 0
        resolved_count = 0
        for records in grouped.values():
            canonical = _select_canonical(records)
            canonical_count += 1
            self.repository.update_entity_resolution(
                canonical,
                canonical.id,
                "CANONICAL",
                "exact_match",
            )
            aliases.append(
                (
                    canonical.id,
                    canonical.canonical_name,
                    normalize_entity_key(canonical.canonical_name),
                    canonical.confidence,
                    "canonical_name",
                )
            )
            for record in records:
                if record.id == canonical.id:
                    continue
                resolved_count += 1
                self.repository.update_entity_resolution(
                    record,
                    canonical.id,
                    "RESOLVED",
                    "exact_match",
                )
                aliases.append(
                    (
                        canonical.id,
                        record.canonical_name,
                        normalize_entity_key(record.canonical_name),
                        record.confidence,
                        "exact_match",
                    )
                )
        self.repository.commit_entity_resolution()
        self.repository.replace_entity_aliases(_unique_aliases(aliases))
        return EntityResolutionResult(
            document_id=document.id,
            canonical_count=canonical_count,
            resolved_count=resolved_count,
            alias_count=len(_unique_aliases(aliases)),
        )


def normalize_entity_key(value: str) -> str:
    """Normalize entity text for exact-match resolution."""

    normalized = re.sub(r"\s+", " ", value.casefold().strip())
    normalized = re.sub(r"^[^\w]+|[^\w]+$", "", normalized)
    return normalized[:512]


def _select_canonical(records: list[EntityRecord]) -> EntityRecord:
    return sorted(records, key=lambda record: (-record.confidence, record.created_at))[0]


def _unique_aliases(
    aliases: list[tuple[UUID, str, str, float, str]],
) -> list[tuple[UUID, str, str, float, str]]:
    seen: set[tuple[UUID, str]] = set()
    unique: list[tuple[UUID, str, str, float, str]] = []
    for alias in aliases:
        key = (alias[0], alias[2])
        if key in seen:
            continue
        seen.add(key)
        unique.append(alias)
    return unique
