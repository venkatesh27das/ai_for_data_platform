from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_artifact_service, get_project_service
from app.db.models import Artifact
from app.schemas.artifacts import ArtifactRead
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
