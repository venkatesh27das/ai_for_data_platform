from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from docintel.db.models import ExtractedFieldRecord
from docintel.db.repositories.documents import DocumentRepository
from docintel.db.repositories.profiles import ProfileRepository
from docintel.domain.ontology import ExtractionProfileDefinition
from docintel.services.ontology.profiles import (
    ProfileConflictError,
    ProfileNotFoundError,
)


@dataclass(frozen=True)
class TypedOutputTable:
    table_id: UUID
    table_name: str
    status: str
    validation_errors: list[str]
    values: dict[str, object]
    confidence: float
    review_status: str


class TypedOutputService:
    """Materialize profile-defined rows from existing generic extraction fields."""

    def __init__(self, session: Session) -> None:
        self.documents = DocumentRepository(session)
        self.profiles = ProfileRepository(session)

    def materialize(self, document_id: UUID, profile_key: str) -> list[TypedOutputTable]:
        if self.documents.get(document_id) is None:
            raise ProfileNotFoundError("document not found")
        profile = self.profiles.get_profile(profile_key)
        if profile is None:
            raise ProfileNotFoundError("profile not found")
        version = self.profiles.get_active_version(profile)
        if version is None:
            raise ProfileConflictError("profile has no active version")
        extraction_run = self.profiles.latest_extraction_run(document_id)
        if extraction_run is None or extraction_run.status not in {"SUCCEEDED", "PARTIAL"}:
            raise ProfileConflictError(
                "document must have a successful generic extraction before profile materialization"
            )

        definition = ExtractionProfileDefinition.model_validate(version.definition_json)
        fields = self.profiles.list_run_fields(extraction_run.id)
        best_by_name: dict[str, ExtractedFieldRecord] = {}
        for field in fields:
            best_by_name.setdefault(field.field_name, field)

        outputs = []
        for table in definition.typed_output_tables:
            values: dict[str, object] = {}
            evidence: list[dict[str, object]] = []
            confidences: list[float] = []
            missing: list[str] = []
            for expected in table.fields:
                matched = best_by_name.get(expected.name)
                if matched is None:
                    if expected.required:
                        missing.append(expected.name)
                    continue
                values[expected.name] = matched.normalized_value or matched.value
                evidence.extend(matched.source_evidence_json)
                confidences.append(matched.confidence)
            status = "VALID" if not missing else "REQUIRES_REVIEW"
            errors = [f"missing required field: {name}" for name in missing]
            confidence = min(confidences) if confidences else 0.0
            outputs.append((table.table_name, status, errors, values, evidence, confidence))

        records = self.profiles.replace_typed_outputs(
            document_id,
            extraction_run.id,
            version.id,
            outputs,
        )
        materialized: list[TypedOutputTable] = []
        for record in records:
            rows = list(self.profiles.list_typed_output_rows(record.id))
            materialized.append(
                TypedOutputTable(
                    table_id=record.id,
                    table_name=record.table_name,
                    status=record.status,
                    validation_errors=record.validation_errors_json,
                    values=rows[0].values_json if rows else {},
                    confidence=rows[0].confidence if rows else 0.0,
                    review_status=rows[0].review_status if rows else "REQUIRES_REVIEW",
                )
            )
        return materialized

    def list_outputs(self, document_id: UUID) -> list[TypedOutputTable]:
        outputs: list[TypedOutputTable] = []
        for record in self.profiles.list_typed_outputs(document_id):
            rows = list(self.profiles.list_typed_output_rows(record.id))
            outputs.append(
                TypedOutputTable(
                    table_id=record.id,
                    table_name=record.table_name,
                    status=record.status,
                    validation_errors=record.validation_errors_json,
                    values=rows[0].values_json if rows else {},
                    confidence=rows[0].confidence if rows else 0.0,
                    review_status=rows[0].review_status if rows else "REQUIRES_REVIEW",
                )
            )
        return outputs
