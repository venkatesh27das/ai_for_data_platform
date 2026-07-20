from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_artifact_service, get_project_service
from app.db.models import Artifact
from app.schemas.artifacts import (
    ArtifactLayout,
    ArtifactRead,
    ArtifactReview,
    ArtifactRevision,
)
from app.services.artifacts import ArtifactService
from app.services.projects import ProjectService

router = APIRouter(prefix="/projects/{project_id}/artifacts", tags=["artifacts"])


@router.get("", response_model=list[ArtifactRead])
def list_artifacts(
    project_id: str,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    artifacts: Annotated[ArtifactService, Depends(get_artifact_service)],
) -> list[Artifact]:
    projects.get(project_id)
    return artifacts.list(project_id)


@router.get("/{artifact_id}", response_model=ArtifactRead)
def get_artifact(
    project_id: str,
    artifact_id: str,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    artifacts: Annotated[ArtifactService, Depends(get_artifact_service)],
) -> Artifact:
    projects.get(project_id)
    return artifacts.get(project_id, artifact_id)


@router.post("/{artifact_id}/review", response_model=ArtifactRead)
def review_artifact(
    project_id: str,
    artifact_id: str,
    payload: ArtifactReview,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    artifacts: Annotated[ArtifactService, Depends(get_artifact_service)],
) -> Artifact:
    projects.get(project_id)
    return artifacts.review(project_id, artifact_id, payload)


@router.post("/{artifact_id}/revisions", response_model=ArtifactRead, status_code=201)
def create_revision(
    project_id: str,
    artifact_id: str,
    payload: ArtifactRevision,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    artifacts: Annotated[ArtifactService, Depends(get_artifact_service)],
) -> Artifact:
    projects.get(project_id)
    return artifacts.revise(project_id, artifact_id, payload)


@router.put("/{artifact_id}/layout", response_model=ArtifactRead)
def save_layout(
    project_id: str,
    artifact_id: str,
    payload: ArtifactLayout,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    artifacts: Annotated[ArtifactService, Depends(get_artifact_service)],
) -> Artifact:
    projects.get(project_id)
    return artifacts.save_layout(project_id, artifact_id, payload)
