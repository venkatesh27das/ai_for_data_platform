from fastapi import HTTPException, status

from app.db.models import Artifact
from app.repositories.artifacts import ArtifactRepository
from app.schemas.artifacts import ArtifactCreate


class ArtifactService:
    def __init__(self, repository: ArtifactRepository) -> None:
        self.repository = repository

    def list(self, project_id: str) -> list[Artifact]:
        return self.repository.list_for_project(project_id)

    def get(self, project_id: str, artifact_id: str) -> Artifact:
        artifact = self.repository.get(artifact_id)
        if artifact is None or artifact.project_id != project_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not found")
        return artifact

    def create(self, project_id: str, payload: ArtifactCreate) -> Artifact:
        return self.repository.create(project_id=project_id, **payload.model_dump())
