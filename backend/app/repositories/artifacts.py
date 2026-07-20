from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Artifact


class ArtifactRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_project(self, project_id: str) -> list[Artifact]:
        statement = (
            select(Artifact)
            .where(Artifact.project_id == project_id)
            .order_by(Artifact.updated_at.desc())
        )
        return list(self.db.scalars(statement))

    def get(self, artifact_id: str) -> Artifact | None:
        return self.db.get(Artifact, artifact_id)

    def create(
        self,
        *,
        project_id: str,
        artifact_type: str,
        name: str,
        version: int,
        status: str,
        payload: dict[str, Any],
    ) -> Artifact:
        artifact = Artifact(
            project_id=project_id,
            artifact_type=artifact_type,
            name=name,
            version=version,
            status=status,
            payload=payload,
        )
        self.db.add(artifact)
        self.db.commit()
        self.db.refresh(artifact)
        return artifact
