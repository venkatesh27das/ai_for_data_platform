from __future__ import annotations

from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from docintel.db.models import Document
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
