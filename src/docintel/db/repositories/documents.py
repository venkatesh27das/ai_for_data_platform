from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from docintel.db.models import (
    Chunk,
    ChunkProjectionRun,
    Document,
    DocumentArtifact,
    DocumentElementRecord,
    DocumentPage,
    DocumentVersion,
    ProcessingEvent,
    ProcessingRun,
    VectorIndexRecord,
)
from docintel.domain.canonical_ir import CanonicalDocument
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
