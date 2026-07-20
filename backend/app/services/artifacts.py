from fastapi import HTTPException, status

from app.db.models import Artifact
from app.repositories.artifacts import ArtifactRepository
from app.schemas.artifacts import ArtifactCreate, ArtifactLayout, ArtifactReview, ArtifactRevision


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

    def review(self, project_id: str, artifact_id: str, payload: ArtifactReview) -> Artifact:
        artifact = self.get(project_id, artifact_id)
        return self.repository.update(
            artifact,
            review_status=payload.decision,
            review_note=payload.note,
        )

    def revise(self, project_id: str, artifact_id: str, payload: ArtifactRevision) -> Artifact:
        artifact = self.get(project_id, artifact_id)
        return self.repository.create(
            project_id=project_id,
            artifact_type=artifact.artifact_type,
            name=payload.name or artifact.name,
            version=self.repository.next_version(project_id, artifact.artifact_type),
            status=payload.status,
            payload=payload.payload,
        )

    def save_layout(self, project_id: str, artifact_id: str, layout: ArtifactLayout) -> Artifact:
        artifact = self.get(project_id, artifact_id)
        updated_payload = {**artifact.payload, "layout": layout.model_dump(mode="json")}
        return self.repository.update(artifact, payload=updated_payload)
