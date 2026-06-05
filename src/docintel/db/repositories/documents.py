from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from docintel.db.models import (
    Chunk,
    ChunkProjectionRun,
    ClaimRecord,
    Document,
    DocumentArtifact,
    DocumentElementRecord,
    DocumentPage,
    DocumentVersion,
    EntityAliasRecord,
    EntityMentionRecord,
    EntityRecord,
    EventRecord,
    ExtractedFieldRecord,
    ExtractionRun,
    GraphProjectionRun,
    ObligationRecord,
    ProcessingEvent,
    ProcessingRun,
    RelationshipRecord,
    VectorIndexRecord,
)
from docintel.domain.canonical_ir import CanonicalDocument
from docintel.domain.extraction import GenericExtractionResult
from docintel.services.chunking.layout import LayoutAwareChunk
from docintel.services.ingestion.files import StoredUpload


class DocumentRepository:
    """Repository for document registry rows."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def list(self) -> Sequence[Document]:
        """Return documents ordered by newest first."""

        return self.session.scalars(select(Document).order_by(Document.created_at.desc())).all()

    def get(self, document_id: UUID) -> Document | None:
        """Return one document by ID."""

        return self.session.get(Document, document_id)

    def get_by_checksum(self, checksum_sha256: str) -> Document | None:
        """Return a document matching a checksum."""

        return self.session.scalar(
            select(Document).where(Document.checksum_sha256 == checksum_sha256)
        )

    def create_from_upload(self, upload: StoredUpload) -> Document:
        """Create and persist a new document row."""

        document = Document(
            file_name=upload.file_name,
            file_type=upload.file_type,
            checksum_sha256=upload.checksum_sha256,
            storage_uri=upload.storage_uri,
            size_bytes=upload.size_bytes,
            status="PENDING",
        )
        self.session.add(document)
        self.session.flush()
        self.session.add(
            DocumentVersion(
                document_id=document.id,
                version_number=1,
                checksum_sha256=upload.checksum_sha256,
                storage_uri=upload.storage_uri,
            )
        )
        self.session.commit()
        self.session.refresh(document)
        return document

    def update_status(self, document: Document, status: str) -> Document:
        """Update the processing status for a document."""

        document.status = status
        self.session.add(document)
        self.session.commit()
        self.session.refresh(document)
        return document

    def create_processing_run(self, document: Document) -> ProcessingRun:
        """Create a new processing run for a document."""

        run = ProcessingRun(
            document_id=document.id,
            status="RUNNING",
            started_at=datetime.now(UTC),
            pipeline_version="phase-3",
        )
        document.status = "RUNNING"
        self.session.add_all([run, document])
        self.session.commit()
        self.session.refresh(run)
        self.session.refresh(document)
        return run

    def list_chunks(self, document_id: UUID) -> Sequence[Chunk]:
        """Return persisted chunks ordered by creation time."""

        return self.session.scalars(
            select(Chunk).where(Chunk.document_id == document_id).order_by(Chunk.created_at.asc())
        ).all()

    def replace_chunks(
        self,
        document_id: UUID,
        processing_run_id: UUID,
        chunks: Sequence[LayoutAwareChunk],
    ) -> Sequence[Chunk]:
        """Replace chunks for a processing run and persist the new set."""

        existing = self.session.scalars(
            select(Chunk).where(Chunk.processing_run_id == processing_run_id)
        ).all()
        for existing_chunk in existing:
            self.session.delete(existing_chunk)
        self.session.flush()
        records: list[Chunk] = []
        for layout_chunk in chunks:
            record = Chunk(
                document_id=document_id,
                processing_run_id=processing_run_id,
                chunk_id=layout_chunk.chunk_id,
                chunk_type=layout_chunk.chunk_type,
                text=layout_chunk.text,
                markdown=layout_chunk.markdown,
                section_path_json=layout_chunk.section_path,
                page_numbers_json=layout_chunk.page_numbers,
                source_element_ids_json=layout_chunk.source_element_ids,
                quality_score=layout_chunk.quality_score,
                metadata_json=layout_chunk.metadata,
            )
            self.session.add(record)
            records.append(record)
        self.session.commit()
        for record in records:
            self.session.refresh(record)
        return records

    def create_chunk_projection_run(
        self, document_id: UUID, processing_run_id: UUID | None = None
    ) -> ChunkProjectionRun:
        """Create a vector projection run."""

        run = ChunkProjectionRun(
            document_id=document_id,
            processing_run_id=processing_run_id,
            status="RUNNING",
            started_at=datetime.now(UTC),
        )
        self.session.add(run)
        self.session.commit()
        self.session.refresh(run)
        return run

    def finish_chunk_projection_run(
        self,
        run: ChunkProjectionRun,
        status: str,
        chunk_count: int,
        embedded_count: int,
        error_details: str | None = None,
    ) -> ChunkProjectionRun:
        """Finalize a vector projection run."""

        run.status = status
        run.chunk_count = chunk_count
        run.embedded_count = embedded_count
        run.error_details = error_details
        run.ended_at = datetime.now(UTC)
        self.session.add(run)
        self.session.commit()
        self.session.refresh(run)
        return run

    def latest_chunk_projection_run(self, document_id: UUID) -> ChunkProjectionRun | None:
        """Return the newest vector projection run for a document."""

        return self.session.scalar(
            select(ChunkProjectionRun)
            .where(ChunkProjectionRun.document_id == document_id)
            .order_by(ChunkProjectionRun.created_at.desc())
        )

    def create_extraction_run(
        self,
        document_id: UUID,
        processing_run_id: UUID | None,
        extractor_name: str,
        model_id: str | None = None,
        prompt_version: str | None = None,
    ) -> ExtractionRun:
        """Create a generic extraction run."""

        run = ExtractionRun(
            document_id=document_id,
            processing_run_id=processing_run_id,
            status="RUNNING",
            extractor_name=extractor_name,
            model_id=model_id,
            prompt_version=prompt_version,
            started_at=datetime.now(UTC),
        )
        self.session.add(run)
        self.session.commit()
        self.session.refresh(run)
        return run

    def finish_extraction_run(
        self,
        run: ExtractionRun,
        status: str,
        error_details: str | None = None,
    ) -> ExtractionRun:
        """Finalize a generic extraction run."""

        run.status = status
        run.error_details = error_details
        run.ended_at = datetime.now(UTC)
        self.session.add(run)
        self.session.commit()
        self.session.refresh(run)
        return run

    def latest_extraction_run(self, document_id: UUID) -> ExtractionRun | None:
        """Return the newest extraction run for a document."""

        return self.session.scalar(
            select(ExtractionRun)
            .where(ExtractionRun.document_id == document_id)
            .order_by(ExtractionRun.created_at.desc())
        )

    def persist_vector_records(
        self,
        document_id: UUID,
        projection_run_id: UUID,
        collection_name: str,
        embedding_model: str,
        records: Sequence[tuple[Chunk, str, dict[str, object]]],
    ) -> Sequence[VectorIndexRecord]:
        """Persist serving-store point metadata for vector records."""

        existing = self.session.scalars(
            select(VectorIndexRecord).where(VectorIndexRecord.document_id == document_id)
        ).all()
        for record in existing:
            self.session.delete(record)
        self.session.flush()
        persisted: list[VectorIndexRecord] = []
        for chunk, point_id, payload in records:
            record = VectorIndexRecord(
                document_id=document_id,
                chunk_db_id=chunk.id,
                projection_run_id=projection_run_id,
                collection_name=collection_name,
                point_id=point_id,
                embedding_model=embedding_model,
                status="INDEXED",
                payload_json=payload,
            )
            self.session.add(record)
            persisted.append(record)
        self.session.commit()
        for record in persisted:
            self.session.refresh(record)
        return persisted

    def persist_extraction_result(
        self, result: GenericExtractionResult, extraction_run: ExtractionRun
    ) -> None:
        """Persist a generic extraction result for one run."""

        existing_models = (
            ExtractedFieldRecord,
            EntityMentionRecord,
            EntityRecord,
            RelationshipRecord,
            EventRecord,
            ClaimRecord,
            ObligationRecord,
        )
        for model in existing_models:
            existing = self.session.scalars(
                select(model).where(model.extraction_run_id == extraction_run.id)
            ).all()
            for record in existing:
                self.session.delete(record)
        self.session.flush()

        for field in result.fields:
            self.session.add(
                ExtractedFieldRecord(
                    document_id=result.document_id,
                    extraction_run_id=extraction_run.id,
                    field_name=field.field_name,
                    field_type=field.field_type,
                    value=field.value,
                    normalized_value=field.normalized_value,
                    confidence=field.confidence,
                    source_evidence_json=[
                        evidence.model_dump(mode="json") for evidence in field.evidence
                    ],
                    extractor_name=field.extractor_name,
                    model_id=extraction_run.model_id,
                    prompt_version=extraction_run.prompt_version,
                )
            )

        for entity in result.entities:
            entity_record = EntityRecord(
                document_id=result.document_id,
                extraction_run_id=extraction_run.id,
                entity_type=entity.entity_type,
                canonical_name=entity.canonical_name,
                normalized_key=_normalized_key(entity.canonical_name),
                attributes_json=entity.attributes,
                confidence=entity.confidence,
                source_evidence_json=[
                    evidence.model_dump(mode="json") for evidence in entity.evidence
                ],
                extractor_name=entity.extractor_name,
                model_id=extraction_run.model_id,
                prompt_version=extraction_run.prompt_version,
            )
            self.session.add(entity_record)
            self.session.flush()
            self.session.add(
                EntityMentionRecord(
                    document_id=result.document_id,
                    entity_id=entity_record.id,
                    extraction_run_id=extraction_run.id,
                    raw_mention=entity.raw_mention,
                    source_evidence_json=[
                        evidence.model_dump(mode="json") for evidence in entity.evidence
                    ],
                    confidence=entity.confidence,
                )
            )

        for relationship in result.relationships:
            self.session.add(
                RelationshipRecord(
                    document_id=result.document_id,
                    extraction_run_id=extraction_run.id,
                    relationship_type=relationship.relationship_type,
                    source_entity=relationship.source_entity,
                    target_entity=relationship.target_entity,
                    attributes_json=relationship.attributes,
                    confidence=relationship.confidence,
                    source_evidence_json=[
                        evidence.model_dump(mode="json") for evidence in relationship.evidence
                    ],
                    extractor_name=relationship.extractor_name,
                    model_id=extraction_run.model_id,
                    prompt_version=extraction_run.prompt_version,
                )
            )

        for event in result.events:
            self.session.add(
                EventRecord(
                    document_id=result.document_id,
                    extraction_run_id=extraction_run.id,
                    event_type=event.event_type,
                    name=event.name,
                    attributes_json=event.attributes,
                    confidence=event.confidence,
                    source_evidence_json=[
                        evidence.model_dump(mode="json") for evidence in event.evidence
                    ],
                    extractor_name=event.extractor_name,
                )
            )

        for claim in result.claims:
            self.session.add(
                ClaimRecord(
                    document_id=result.document_id,
                    extraction_run_id=extraction_run.id,
                    claim_text=claim.claim_text,
                    attributes_json=claim.attributes,
                    confidence=claim.confidence,
                    source_evidence_json=[
                        evidence.model_dump(mode="json") for evidence in claim.evidence
                    ],
                    extractor_name=claim.extractor_name,
                )
            )

        for obligation in result.obligations:
            self.session.add(
                ObligationRecord(
                    document_id=result.document_id,
                    extraction_run_id=extraction_run.id,
                    obligation_text=obligation.obligation_text,
                    obligated_party=obligation.obligated_party,
                    attributes_json=obligation.attributes,
                    confidence=obligation.confidence,
                    source_evidence_json=[
                        evidence.model_dump(mode="json") for evidence in obligation.evidence
                    ],
                    extractor_name=obligation.extractor_name,
                )
            )

        self.session.commit()

    def list_extracted_fields(self, document_id: UUID) -> Sequence[ExtractedFieldRecord]:
        """Return extracted fields ordered by newest first."""

        return self.session.scalars(
            select(ExtractedFieldRecord)
            .where(ExtractedFieldRecord.document_id == document_id)
            .order_by(ExtractedFieldRecord.created_at.desc())
        ).all()

    def list_entities(self, document_id: UUID) -> Sequence[EntityRecord]:
        """Return extracted entities ordered by newest first."""

        return self.session.scalars(
            select(EntityRecord)
            .where(EntityRecord.document_id == document_id)
            .order_by(EntityRecord.created_at.desc())
        ).all()

    def replace_entity_aliases(
        self, aliases: Sequence[tuple[UUID, str, str, float, str]]
    ) -> Sequence[EntityAliasRecord]:
        """Replace aliases for resolved entities and persist the supplied set."""

        entity_ids = {entity_id for entity_id, *_ in aliases}
        if entity_ids:
            existing = self.session.scalars(
                select(EntityAliasRecord).where(EntityAliasRecord.entity_id.in_(entity_ids))
            ).all()
            for record in existing:
                self.session.delete(record)
            self.session.flush()
        records: list[EntityAliasRecord] = []
        for entity_id, alias, normalized_alias, confidence, source in aliases:
            record = EntityAliasRecord(
                entity_id=entity_id,
                alias=alias,
                normalized_alias=normalized_alias,
                confidence=confidence,
                source=source,
            )
            self.session.add(record)
            records.append(record)
        self.session.commit()
        for record in records:
            self.session.refresh(record)
        return records

    def update_entity_resolution(
        self,
        entity: EntityRecord,
        canonical_entity_id: UUID,
        resolution_status: str,
        resolution_method: str,
    ) -> EntityRecord:
        """Persist resolution state for one entity."""

        entity.canonical_entity_id = canonical_entity_id
        entity.resolution_status = resolution_status
        entity.resolution_method = resolution_method
        self.session.add(entity)
        return entity

    def commit_entity_resolution(self) -> None:
        """Commit batched entity resolution updates."""

        self.session.commit()

    def list_resolved_entities(self, document_id: UUID) -> Sequence[EntityRecord]:
        """Return entities that have been resolved or marked canonical."""

        return self.session.scalars(
            select(EntityRecord)
            .where(
                EntityRecord.document_id == document_id,
                EntityRecord.resolution_status.in_(["CANONICAL", "RESOLVED"]),
            )
            .order_by(EntityRecord.created_at.asc())
        ).all()

    def list_relationships(self, document_id: UUID) -> Sequence[RelationshipRecord]:
        """Return extracted relationships ordered by newest first."""

        return self.session.scalars(
            select(RelationshipRecord)
            .where(RelationshipRecord.document_id == document_id)
            .order_by(RelationshipRecord.created_at.desc())
        ).all()

    def create_graph_projection_run(
        self, document_id: UUID, processing_run_id: UUID | None = None
    ) -> GraphProjectionRun:
        """Create a graph projection run."""

        run = GraphProjectionRun(
            document_id=document_id,
            processing_run_id=processing_run_id,
            status="RUNNING",
            started_at=datetime.now(UTC),
        )
        self.session.add(run)
        self.session.commit()
        self.session.refresh(run)
        return run

    def finish_graph_projection_run(
        self,
        run: GraphProjectionRun,
        status: str,
        node_count: int = 0,
        edge_count: int = 0,
        error_details: str | None = None,
    ) -> GraphProjectionRun:
        """Finalize a graph projection run."""

        run.status = status
        run.node_count = node_count
        run.edge_count = edge_count
        run.error_details = error_details
        run.ended_at = datetime.now(UTC)
        self.session.add(run)
        self.session.commit()
        self.session.refresh(run)
        return run

    def latest_graph_projection_run(self, document_id: UUID) -> GraphProjectionRun | None:
        """Return the newest graph projection run for a document."""

        return self.session.scalar(
            select(GraphProjectionRun)
            .where(GraphProjectionRun.document_id == document_id)
            .order_by(GraphProjectionRun.created_at.desc())
        )

    def list_extracted_events(self, document_id: UUID) -> Sequence[EventRecord]:
        """Return extracted events ordered by newest first."""

        return self.session.scalars(
            select(EventRecord)
            .where(EventRecord.document_id == document_id)
            .order_by(EventRecord.created_at.desc())
        ).all()

    def list_claims(self, document_id: UUID) -> Sequence[ClaimRecord]:
        """Return extracted claims ordered by newest first."""

        return self.session.scalars(
            select(ClaimRecord)
            .where(ClaimRecord.document_id == document_id)
            .order_by(ClaimRecord.created_at.desc())
        ).all()

    def list_obligations(self, document_id: UUID) -> Sequence[ObligationRecord]:
        """Return extracted obligations ordered by newest first."""

        return self.session.scalars(
            select(ObligationRecord)
            .where(ObligationRecord.document_id == document_id)
            .order_by(ObligationRecord.created_at.desc())
        ).all()

    def finish_processing_run(
        self,
        document: Document,
        run: ProcessingRun,
        status: str,
        error_details: str | None = None,
    ) -> ProcessingRun:
        """Finalize a processing run and mirror its status on the document."""

        run.status = status
        run.error_details = error_details
        run.ended_at = datetime.now(UTC)
        document.status = status
        self.session.add_all([run, document])
        self.session.commit()
        self.session.refresh(run)
        self.session.refresh(document)
        return run

    def add_event(
        self,
        document_id: UUID,
        processing_run_id: UUID,
        stage: str,
        status: str,
        message: str | None = None,
        metadata: dict[str, object] | None = None,
    ) -> ProcessingEvent:
        """Persist a structured processing event."""

        event = ProcessingEvent(
            document_id=document_id,
            processing_run_id=processing_run_id,
            stage=stage,
            status=status,
            message=message,
            metadata_json=metadata or {},
        )
        self.session.add(event)
        self.session.commit()
        self.session.refresh(event)
        return event

    def latest_processing_run(self, document_id: UUID) -> ProcessingRun | None:
        """Return the newest processing run for a document."""

        return self.session.scalar(
            select(ProcessingRun)
            .where(ProcessingRun.document_id == document_id)
            .order_by(ProcessingRun.created_at.desc())
        )

    def list_events(self, document_id: UUID) -> Sequence[ProcessingEvent]:
        """Return processing events ordered by creation time."""

        return self.session.scalars(
            select(ProcessingEvent)
            .where(ProcessingEvent.document_id == document_id)
            .order_by(ProcessingEvent.created_at.asc())
        ).all()

    def list_artifacts(self, document_id: UUID) -> Sequence[DocumentArtifact]:
        """Return artifacts ordered newest first."""

        return self.session.scalars(
            select(DocumentArtifact)
            .where(DocumentArtifact.document_id == document_id)
            .order_by(DocumentArtifact.created_at.desc())
        ).all()

    def persist_artifact(
        self,
        document_id: UUID,
        processing_run_id: UUID,
        artifact_type: str,
        uri: str,
        media_type: str,
        metadata: dict[str, object] | None = None,
    ) -> DocumentArtifact:
        """Persist one generated artifact record."""

        artifact = DocumentArtifact(
            document_id=document_id,
            processing_run_id=processing_run_id,
            artifact_type=artifact_type,
            uri=uri,
            media_type=media_type,
            metadata_json=metadata or {},
        )
        self.session.add(artifact)
        self.session.commit()
        self.session.refresh(artifact)
        return artifact

    def persist_canonical_document(
        self,
        document: CanonicalDocument,
        processing_run_id: UUID,
    ) -> None:
        """Persist pages and elements from a canonical document."""

        for page in document.pages:
            self.session.add(
                DocumentPage(
                    document_id=document.document_id,
                    processing_run_id=processing_run_id,
                    page_number=page.page_number,
                    parser_route=page.parser_route,
                    text_quality_score=page.text_quality_score,
                    warnings_json=page.warnings,
                )
            )
            for element in page.elements:
                self.session.add(
                    DocumentElementRecord(
                        document_id=document.document_id,
                        processing_run_id=processing_run_id,
                        element_id=element.element_id,
                        element_type=element.element_type,
                        page_number=element.page_number,
                        text=element.text,
                        markdown=element.markdown,
                        source_json=element.model_dump(mode="json"),
                    )
                )
        self.session.commit()


def _normalized_key(value: str) -> str:
    """Normalize entity names for early exact-match style lookups."""

    return " ".join(value.casefold().strip().split())[:512]
