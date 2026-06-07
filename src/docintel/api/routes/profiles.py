from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from docintel.api.dependencies import get_db_session
from docintel.db.models import ExtractionProfileProposal, OntologyVersion
from docintel.db.repositories.profiles import ProfileRepository
from docintel.domain.ontology import ExtractionProfileDefinition
from docintel.services.ontology.profiles import (
    ExtractionProfileService,
    ProfileConflictError,
    ProfileNotFoundError,
    ProfileSummary,
)
from docintel.services.ontology.typed_outputs import TypedOutputService

router = APIRouter(prefix="/api/v1/extraction-profiles", tags=["extraction-profiles"])
ontology_router = APIRouter(prefix="/api/v1/ontologies", tags=["ontologies"])
profile_output_router = APIRouter(prefix="/api/v1/documents", tags=["profile-outputs"])


class ProfileSummaryResponse(BaseModel):
    """Public profile catalog summary."""

    profile_key: str
    name: str
    description: str
    active_version: str | None
    versions: list[str]


class ProposalCreateRequest(BaseModel):
    """Evidence-bearing draft profile proposal."""

    definition: ExtractionProfileDefinition
    rationale: str = Field(min_length=10)
    sample_evidence: list[dict[str, object]] = Field(min_length=1)


class ProposalReviewRequest(BaseModel):
    """Explicit human review decision for a draft profile."""

    decision: Literal["APPROVED", "REJECTED"]
    reviewed_by: str = Field(min_length=1)
    review_notes: str | None = None


class ProposalResponse(BaseModel):
    """Persisted draft proposal and review state."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    profile_key: str
    proposed_version: str
    status: str
    rationale: str
    definition_json: dict[str, object]
    sample_evidence_json: list[dict[str, object]]
    reviewed_by: str | None
    review_notes: str | None
    reviewed_at: datetime | None
    created_at: datetime


class OntologyResponse(BaseModel):
    """Versioned ontology catalog response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ontology_key: str
    version: str
    name: str
    status: str
    definition_json: dict[str, object]
    activated_at: datetime | None


class TypedOutputResponse(BaseModel):
    """Typed row materialized from generic extraction records."""

    table_id: UUID
    table_name: str
    status: str
    validation_errors: list[str]
    values: dict[str, object]
    confidence: float
    review_status: str


def _summary_response(summary: ProfileSummary) -> ProfileSummaryResponse:
    return ProfileSummaryResponse(
        profile_key=summary.profile_key,
        name=summary.name,
        description=summary.description,
        active_version=summary.active_version,
        versions=summary.versions,
    )


def _translate_profile_error(exc: Exception) -> HTTPException:
    if isinstance(exc, ProfileNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.post("/sync-starters", response_model=list[ProfileSummaryResponse])
def sync_starter_profiles(
    session: Annotated[Session, Depends(get_db_session)],
) -> list[ProfileSummaryResponse]:
    """Synchronize version-controlled starter profiles and core ontology."""

    return [
        _summary_response(item) for item in ExtractionProfileService(session).synchronize_starters()
    ]


@router.get("", response_model=list[ProfileSummaryResponse])
def list_profiles(
    session: Annotated[Session, Depends(get_db_session)],
) -> list[ProfileSummaryResponse]:
    """List persisted approved profiles and active versions."""

    return [_summary_response(item) for item in ExtractionProfileService(session).list_profiles()]


@router.post(
    "/proposals",
    response_model=ProposalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_proposal(
    request: ProposalCreateRequest,
    session: Annotated[Session, Depends(get_db_session)],
) -> ExtractionProfileProposal:
    """Persist a draft schema proposal and create a pending review task."""

    try:
        return ExtractionProfileService(session).submit_proposal(
            request.definition, request.rationale, request.sample_evidence
        )
    except ProfileConflictError as exc:
        raise _translate_profile_error(exc) from exc


@router.get("/proposals", response_model=list[ProposalResponse])
def list_proposals(
    session: Annotated[Session, Depends(get_db_session)],
) -> list[ExtractionProfileProposal]:
    """List draft profile proposals and their review states."""

    return ExtractionProfileService(session).list_proposals()


@router.post("/proposals/{proposal_id}/review", response_model=ProposalResponse)
def review_proposal(
    proposal_id: UUID,
    request: ProposalReviewRequest,
    session: Annotated[Session, Depends(get_db_session)],
) -> ExtractionProfileProposal:
    """Approve or reject a proposal without activating it automatically."""

    try:
        return ExtractionProfileService(session).review_proposal(
            proposal_id,
            request.decision,
            request.reviewed_by,
            request.review_notes,
        )
    except (ProfileNotFoundError, ProfileConflictError) as exc:
        raise _translate_profile_error(exc) from exc


@router.post(
    "/{profile_key}/versions/{version}/activate",
    response_model=ProfileSummaryResponse,
)
def activate_profile(
    profile_key: str,
    version: str,
    session: Annotated[Session, Depends(get_db_session)],
) -> ProfileSummaryResponse:
    """Activate an approved profile version through a separate explicit action."""

    try:
        return _summary_response(ExtractionProfileService(session).activate(profile_key, version))
    except (ProfileNotFoundError, ProfileConflictError) as exc:
        raise _translate_profile_error(exc) from exc


@router.get("/{profile_key}", response_model=ExtractionProfileDefinition)
def get_profile(
    profile_key: str,
    session: Annotated[Session, Depends(get_db_session)],
    version: str | None = None,
) -> ExtractionProfileDefinition:
    """Return an active or explicitly selected profile definition."""

    try:
        return ExtractionProfileService(session).get_profile_definition(profile_key, version)
    except ProfileNotFoundError as exc:
        raise _translate_profile_error(exc) from exc


@ontology_router.get("", response_model=list[OntologyResponse])
def list_ontologies(
    session: Annotated[Session, Depends(get_db_session)],
) -> list[OntologyVersion]:
    """List persisted ontology versions."""

    return list(ProfileRepository(session).list_ontologies())


@profile_output_router.post(
    "/{document_id}/profiles/{profile_key}/materialize",
    response_model=list[TypedOutputResponse],
)
def materialize_profile_outputs(
    document_id: UUID,
    profile_key: str,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[TypedOutputResponse]:
    """Materialize active profile tables from generic extraction fields."""

    try:
        return [
            TypedOutputResponse(**item.__dict__)
            for item in TypedOutputService(session).materialize(document_id, profile_key)
        ]
    except (ProfileNotFoundError, ProfileConflictError) as exc:
        raise _translate_profile_error(exc) from exc


@profile_output_router.get(
    "/{document_id}/typed-outputs",
    response_model=list[TypedOutputResponse],
)
def list_profile_outputs(
    document_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[TypedOutputResponse]:
    """List persisted typed outputs for a document."""

    return [
        TypedOutputResponse(**item.__dict__)
        for item in TypedOutputService(session).list_outputs(document_id)
    ]
