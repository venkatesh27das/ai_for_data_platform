from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from docintel.api.dependencies import get_db_session, get_settings
from docintel.config import Settings
from docintel.db.models import Document
from docintel.db.repositories.documents import DocumentRepository
from docintel.services.ingestion.files import UploadValidationError, store_upload
from docintel.services.processing import DocumentProcessingService

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


class ProcessingEventResponse(BaseModel):
    """Processing event response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    processing_run_id: UUID
    stage: str
    status: str
    message: str | None
    metadata_json: dict[str, object]
    created_at: datetime


class StatusResponse(BaseModel):
    """Document processing status response."""

    document_id: UUID
    status: str
    message: str
    available_projections: list[str]
    unavailable_projections: list[str]
    latest_run_id: UUID | None = None
    events: list[ProcessingEventResponse] = Field(default_factory=list)


class ArtifactResponse(BaseModel):
    """Document artifact response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    processing_run_id: UUID | None
    artifact_type: str
    uri: str
    media_type: str
    metadata_json: dict[str, object]
    created_at: datetime


class ArtifactsResponse(BaseModel):
    """Document artifact listing response."""

    document_id: UUID
    status: Literal["available", "unavailable"]
    message: str
    artifacts: list[ArtifactResponse]


class ChunkResponse(BaseModel):
    """Layout-aware chunk response."""

    model_config = ConfigDict(from_attributes=True)

    chunk_id: str
    chunk_type: str
    text: str
    markdown: str | None
    section_path_json: list[str]
    page_numbers_json: list[int]
    source_element_ids_json: list[str]
    quality_score: float | None
    metadata_json: dict[str, object]


class ChunksResponse(BaseModel):
    """Document chunk listing response."""

    document_id: UUID
    status: Literal["available", "unavailable"]
    message: str
    chunks: list[ChunkResponse]


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
    processing_run_id: UUID | None = None


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
async def process_document(
    document_id: UUID,
    settings: Annotated[Settings, Depends(get_settings)],
    session: Annotated[Session, Depends(get_db_session)],
) -> ProcessResponse:
    """Trigger Phase 1/2 processing for a document."""

    repository = DocumentRepository(session)
    document = _get_document_or_404(repository, document_id)
    result = await DocumentProcessingService(session, settings).process(document)
    return ProcessResponse(
        document=DocumentResponse.model_validate(result.document),
        status=result.run.status,
        message=result.message,
        processing_run_id=result.run.id,
    )


@router.get("/{document_id}/status", response_model=StatusResponse)
def get_document_status(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> StatusResponse:
    """Return processing status and projection availability."""

    repository = DocumentRepository(session)
    document = _get_document_or_404(repository, document_id)
    latest_run = repository.latest_processing_run(document_id)
    events = [
        ProcessingEventResponse.model_validate(event)
        for event in repository.list_events(document_id)
    ]
    has_artifacts = bool(repository.list_artifacts(document_id))
    has_chunks = bool(repository.list_chunks(document_id))
    vector_run = repository.latest_chunk_projection_run(document_id)
    available = ["document_registry"]
    unavailable = ["structured_extraction", "graph"]
    if has_artifacts:
        available.extend(["canonical_ir", "markdown_artifact", "parser_native_artifact"])
    else:
        unavailable.insert(0, "canonical_ir")
    if has_chunks:
        available.append("chunks")
    else:
        unavailable.append("chunks")
    if vector_run and vector_run.status == "SUCCEEDED":
        available.append("vector_store")
    else:
        unavailable.append("vector_store")
    return StatusResponse(
        document_id=document.id,
        status=document.status,
        message=(
            "Document registry is available. Canonical artifacts are available after processing."
        ),
        available_projections=available,
        unavailable_projections=unavailable,
        latest_run_id=latest_run.id if latest_run else None,
        events=events,
    )


@router.get("/{document_id}/artifacts", response_model=ArtifactsResponse)
def get_document_artifacts(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> ArtifactsResponse:
    """Return persisted artifacts for a processed document."""

    repository = DocumentRepository(session)
    _get_document_or_404(repository, document_id)
    artifacts = [
        ArtifactResponse.model_validate(artifact)
        for artifact in repository.list_artifacts(document_id)
    ]
    if not artifacts:
        return ArtifactsResponse(
            document_id=document_id,
            status="unavailable",
            message="No canonical artifacts are available yet. Trigger processing first.",
            artifacts=[],
        )
    return ArtifactsResponse(
        document_id=document_id,
        status="available",
        message=f"{len(artifacts)} artifact(s) are available.",
        artifacts=artifacts,
    )


@router.get("/{document_id}/chunks", response_model=ChunksResponse)
def get_document_chunks(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> ChunksResponse:
    """Return persisted layout-aware chunks for a processed document."""

    repository = DocumentRepository(session)
    _get_document_or_404(repository, document_id)
    chunks = [ChunkResponse.model_validate(chunk) for chunk in repository.list_chunks(document_id)]
    if not chunks:
        return ChunksResponse(
            document_id=document_id,
            status="unavailable",
            message="No chunks are available yet. Process the document first.",
            chunks=[],
        )
    return ChunksResponse(
        document_id=document_id,
        status="available",
        message=f"{len(chunks)} chunk(s) are available.",
        chunks=chunks,
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
