from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from docintel.api.dependencies import get_db_session, get_settings
from docintel.config import Settings
from docintel.db.models import Document
from docintel.db.repositories.documents import DocumentRepository
from docintel.services.ingestion.files import UploadValidationError, store_upload

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


class DocumentResponse(BaseModel):
    """API representation of a document registry record."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    file_name: str
    file_type: str
    checksum_sha256: str
    storage_uri: str
    size_bytes: int
    status: str
    created_at: datetime
    updated_at: datetime


class UploadResponse(BaseModel):
    """Upload response including duplicate information."""

    document: DocumentResponse
    duplicate: bool


class StatusResponse(BaseModel):
    """Document processing status response."""

    document_id: UUID
    status: str
    message: str
    available_projections: list[str]
    unavailable_projections: list[str]


class ProjectionUnavailableResponse(BaseModel):
    """Projection placeholder response for future phases."""

    document_id: UUID
    status: Literal["unavailable"]
    message: str
    required_phase: str
    data: dict[str, object]


class ProcessResponse(BaseModel):
    """Response for a processing trigger request."""

    document: DocumentResponse
    status: str
    message: str


def _get_document_or_404(repository: DocumentRepository, document_id: UUID) -> Document:
    document = repository.get(document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="document not found")
    return document


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: Annotated[UploadFile, File()],
    settings: Annotated[Settings, Depends(get_settings)],
    session: Annotated[Session, Depends(get_db_session)],
) -> UploadResponse:
    """Upload a PDF or DOCX and create a document registry record."""

    content = await file.read()
    try:
        stored = store_upload(content, file.filename or "", settings)
    except UploadValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    repository = DocumentRepository(session)
    existing = repository.get_by_checksum(stored.checksum_sha256)
    if existing is not None:
        return UploadResponse(document=DocumentResponse.model_validate(existing), duplicate=True)

    document = repository.create_from_upload(stored)
    return UploadResponse(document=DocumentResponse.model_validate(document), duplicate=False)


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    session: Annotated[Session, Depends(get_db_session)],
) -> list[DocumentResponse]:
    """List known documents."""

    repository = DocumentRepository(session)
    return [DocumentResponse.model_validate(document) for document in repository.list()]


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> DocumentResponse:
    """Return document metadata."""

    repository = DocumentRepository(session)
    document = _get_document_or_404(repository, document_id)
    return DocumentResponse.model_validate(document)


@router.post("/{document_id}/process", response_model=ProcessResponse)
def process_document(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> ProcessResponse:
    """Trigger processing for a document.

    The parser/model pipeline is not implemented yet, so this endpoint records a
    review-required state instead of fabricating projections.
    """

    repository = DocumentRepository(session)
    document = _get_document_or_404(repository, document_id)
    document = repository.update_status(document, "REQUIRES_REVIEW")
    return ProcessResponse(
        document=DocumentResponse.model_validate(document),
        status="not_implemented",
        message=(
            "Document registered successfully. Parsing, vector indexing, structured extraction, "
            "and graph projection start in later phases."
        ),
    )


@router.get("/{document_id}/status", response_model=StatusResponse)
def get_document_status(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> StatusResponse:
    """Return processing status and projection availability."""

    repository = DocumentRepository(session)
    document = _get_document_or_404(repository, document_id)
    return StatusResponse(
        document_id=document.id,
        status=document.status,
        message="Original file is registered. Processing projections are not implemented yet.",
        available_projections=["document_registry"],
        unavailable_projections=["canonical_ir", "vector_store", "structured_extraction", "graph"],
    )


@router.get("/{document_id}/artifacts", response_model=ProjectionUnavailableResponse)
def get_document_artifacts(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> ProjectionUnavailableResponse:
    """Return artifact projection placeholder."""

    repository = DocumentRepository(session)
    _get_document_or_404(repository, document_id)
    return ProjectionUnavailableResponse(
        document_id=document_id,
        status="unavailable",
        required_phase="Phase 2",
        message=(
            "Canonical JSON, Markdown, parser-native, table, and image artifacts are not "
            "available until parsing is implemented."
        ),
        data={"artifacts": []},
    )


@router.get("/{document_id}/extractions", response_model=ProjectionUnavailableResponse)
def get_document_extractions(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> ProjectionUnavailableResponse:
    """Return structured extraction placeholder."""

    repository = DocumentRepository(session)
    _get_document_or_404(repository, document_id)
    return ProjectionUnavailableResponse(
        document_id=document_id,
        status="unavailable",
        required_phase="Phase 4",
        message=(
            "Structured fields, entities, relationships, claims, and obligations are not "
            "available until extraction is implemented."
        ),
        data={"fields": [], "tables": [], "entities": [], "relationships": []},
    )


@router.get("/{document_id}/graph", response_model=ProjectionUnavailableResponse)
def get_document_graph(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> ProjectionUnavailableResponse:
    """Return graph projection placeholder."""

    repository = DocumentRepository(session)
    _get_document_or_404(repository, document_id)
    return ProjectionUnavailableResponse(
        document_id=document_id,
        status="unavailable",
        required_phase="Phase 5",
        message=(
            "Neo4j graph nodes and relationships are not available until entity resolution "
            "and graph projection are implemented."
        ),
        data={"nodes": [], "edges": []},
    )
