from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from docintel.db.models import (
    ExtractedFieldRecord,
    ExtractedTableRecord,
    ExtractedTableRowRecord,
    ExtractionProfile,
    ExtractionProfileProposal,
    ExtractionProfileVersion,
    ExtractionRun,
    OntologyAlias,
    OntologyEntityType,
    OntologyRelationshipType,
    OntologyVersion,
    ReviewTask,
)
from docintel.domain.ontology import ExtractionProfileDefinition, OntologyDefinition


class ProfileRepository:
    """Persistence operations for extraction profiles and ontology drafts."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def list_profiles(self) -> Sequence[ExtractionProfile]:
        return self.session.scalars(
            select(ExtractionProfile).order_by(ExtractionProfile.profile_key.asc())
        ).all()

    def get_profile(self, profile_key: str) -> ExtractionProfile | None:
        return self.session.scalar(
            select(ExtractionProfile).where(ExtractionProfile.profile_key == profile_key)
        )

    def list_versions(self, profile_id: UUID) -> Sequence[ExtractionProfileVersion]:
        return self.session.scalars(
            select(ExtractionProfileVersion)
            .where(ExtractionProfileVersion.profile_id == profile_id)
            .order_by(ExtractionProfileVersion.created_at.desc())
        ).all()

    def get_version(self, profile_id: UUID, version: str) -> ExtractionProfileVersion | None:
        return self.session.scalar(
            select(ExtractionProfileVersion).where(
                ExtractionProfileVersion.profile_id == profile_id,
                ExtractionProfileVersion.version == version,
            )
        )

    def upsert_approved_profile(
        self,
        definition: ExtractionProfileDefinition,
        source: str,
        activate: bool,
    ) -> tuple[ExtractionProfile, ExtractionProfileVersion]:
        profile = self.get_profile(definition.profile_key)
        if profile is None:
            profile = ExtractionProfile(
                profile_key=definition.profile_key,
                name=definition.name,
                description=definition.description,
            )
            self.session.add(profile)
            self.session.flush()
        else:
            profile.name = definition.name
            profile.description = definition.description

        version = self.get_version(profile.id, definition.version)
        if version is None:
            version = ExtractionProfileVersion(
                profile_id=profile.id,
                version=definition.version,
                status="APPROVED",
                source=source,
                definition_json=definition.model_dump(mode="json"),
                approved_at=datetime.now(UTC),
            )
            self.session.add(version)
            self.session.flush()
        if activate:
            profile.active_version_id = version.id
        self.session.add(profile)
        self.session.commit()
        self.session.refresh(profile)
        self.session.refresh(version)
        return profile, version

    def activate_version(
        self, profile: ExtractionProfile, version: ExtractionProfileVersion
    ) -> ExtractionProfile:
        if version.status != "APPROVED":
            raise ValueError("only approved profile versions can be activated")
        profile.active_version_id = version.id
        self.session.add(profile)
        self.session.commit()
        self.session.refresh(profile)
        return profile

    def get_active_version(self, profile: ExtractionProfile) -> ExtractionProfileVersion | None:
        if profile.active_version_id is None:
            return None
        return self.session.get(ExtractionProfileVersion, profile.active_version_id)

    def latest_extraction_run(self, document_id: UUID) -> ExtractionRun | None:
        return self.session.scalar(
            select(ExtractionRun)
            .where(ExtractionRun.document_id == document_id)
            .order_by(ExtractionRun.created_at.desc())
        )

    def list_run_fields(self, extraction_run_id: UUID) -> Sequence[ExtractedFieldRecord]:
        return self.session.scalars(
            select(ExtractedFieldRecord)
            .where(ExtractedFieldRecord.extraction_run_id == extraction_run_id)
            .order_by(
                ExtractedFieldRecord.confidence.desc(),
                ExtractedFieldRecord.created_at.desc(),
            )
        ).all()

    def replace_typed_outputs(
        self,
        document_id: UUID,
        extraction_run_id: UUID,
        profile_version_id: UUID,
        outputs: list[
            tuple[
                str,
                str,
                list[str],
                dict[str, object],
                list[dict[str, object]],
                float,
            ]
        ],
    ) -> Sequence[ExtractedTableRecord]:
        existing = self.session.scalars(
            select(ExtractedTableRecord).where(
                ExtractedTableRecord.document_id == document_id,
                ExtractedTableRecord.profile_version_id == profile_version_id,
            )
        ).all()
        for record in existing:
            self.session.delete(record)
        self.session.flush()

        tables: list[ExtractedTableRecord] = []
        for table_name, status, errors, values, evidence, confidence in outputs:
            table = ExtractedTableRecord(
                document_id=document_id,
                extraction_run_id=extraction_run_id,
                profile_version_id=profile_version_id,
                table_name=table_name,
                status=status,
                validation_errors_json=errors,
            )
            self.session.add(table)
            self.session.flush()
            self.session.add(
                ExtractedTableRowRecord(
                    extracted_table_id=table.id,
                    row_index=0,
                    values_json=values,
                    source_evidence_json=evidence,
                    confidence=confidence,
                    review_status=("PROPOSED" if status == "VALID" else "REQUIRES_REVIEW"),
                )
            )
            tables.append(table)
        self.session.commit()
        for table in tables:
            self.session.refresh(table)
        return tables

    def list_typed_outputs(self, document_id: UUID) -> Sequence[ExtractedTableRecord]:
        return self.session.scalars(
            select(ExtractedTableRecord)
            .where(ExtractedTableRecord.document_id == document_id)
            .order_by(ExtractedTableRecord.created_at.desc())
        ).all()

    def list_typed_output_rows(self, table_id: UUID) -> Sequence[ExtractedTableRowRecord]:
        return self.session.scalars(
            select(ExtractedTableRowRecord)
            .where(ExtractedTableRowRecord.extracted_table_id == table_id)
            .order_by(ExtractedTableRowRecord.row_index.asc())
        ).all()

    def create_proposal(
        self,
        definition: ExtractionProfileDefinition,
        rationale: str,
        sample_evidence: list[dict[str, object]],
    ) -> ExtractionProfileProposal:
        proposal = ExtractionProfileProposal(
            profile_key=definition.profile_key,
            proposed_version=definition.version,
            status="PROPOSED",
            rationale=rationale,
            definition_json=definition.model_dump(mode="json"),
            sample_evidence_json=sample_evidence,
        )
        self.session.add(proposal)
        self.session.flush()
        self.session.add(
            ReviewTask(
                task_type="EXTRACTION_PROFILE_PROPOSAL",
                target_type="extraction_profile_proposal",
                target_id=proposal.id,
                status="PENDING",
                payload_json={
                    "profile_key": proposal.profile_key,
                    "proposed_version": proposal.proposed_version,
                },
            )
        )
        self.session.commit()
        self.session.refresh(proposal)
        return proposal

    def list_proposals(self) -> Sequence[ExtractionProfileProposal]:
        return self.session.scalars(
            select(ExtractionProfileProposal).order_by(ExtractionProfileProposal.created_at.desc())
        ).all()

    def get_proposal(self, proposal_id: UUID) -> ExtractionProfileProposal | None:
        return self.session.get(ExtractionProfileProposal, proposal_id)

    def resolve_proposal(
        self,
        proposal: ExtractionProfileProposal,
        decision: str,
        reviewed_by: str,
        review_notes: str | None,
    ) -> ExtractionProfileProposal:
        if proposal.status != "PROPOSED":
            raise ValueError("proposal has already been reviewed")
        now = datetime.now(UTC)
        proposal.status = decision
        proposal.reviewed_by = reviewed_by
        proposal.review_notes = review_notes
        proposal.reviewed_at = now
        task = self.session.scalar(
            select(ReviewTask).where(
                ReviewTask.target_type == "extraction_profile_proposal",
                ReviewTask.target_id == proposal.id,
            )
        )
        if task is not None:
            task.status = "RESOLVED"
            task.resolution_notes = review_notes or decision
            task.resolved_at = now
            self.session.add(task)
        self.session.add(proposal)
        self.session.commit()
        self.session.refresh(proposal)
        return proposal

    def get_ontology(self, ontology_key: str, version: str) -> OntologyVersion | None:
        return self.session.scalar(
            select(OntologyVersion).where(
                OntologyVersion.ontology_key == ontology_key,
                OntologyVersion.version == version,
            )
        )

    def list_ontologies(self) -> Sequence[OntologyVersion]:
        return self.session.scalars(
            select(OntologyVersion).order_by(OntologyVersion.created_at.desc())
        ).all()

    def upsert_ontology(
        self, definition: OntologyDefinition, activate: bool = True
    ) -> OntologyVersion:
        ontology = self.get_ontology(definition.ontology_key, definition.version)
        if ontology is not None:
            return ontology
        ontology = OntologyVersion(
            ontology_key=definition.ontology_key,
            version=definition.version,
            name=definition.name,
            status="ACTIVE" if activate else "APPROVED",
            definition_json=definition.model_dump(mode="json"),
            activated_at=datetime.now(UTC) if activate else None,
        )
        self.session.add(ontology)
        self.session.flush()
        self.session.add_all(
            [
                OntologyEntityType(
                    ontology_version_id=ontology.id,
                    name=item.name,
                    description=item.description,
                    parent_type=item.parent_type,
                )
                for item in definition.entity_types
            ]
        )
        self.session.add_all(
            [
                OntologyRelationshipType(
                    ontology_version_id=ontology.id,
                    name=item.name,
                    description=item.description,
                    source_types_json=item.source_types,
                    target_types_json=item.target_types,
                )
                for item in definition.relationship_types
            ]
        )
        self.session.add_all(
            [
                OntologyAlias(
                    ontology_version_id=ontology.id,
                    alias=item.alias,
                    target_type=item.target_type,
                    target_kind=item.target_kind,
                )
                for item in definition.aliases
            ]
        )
        self.session.commit()
        self.session.refresh(ontology)
        return ontology
