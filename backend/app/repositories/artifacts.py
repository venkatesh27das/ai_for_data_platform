from typing import Any

from sqlalchemy import func, select
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

    def next_version(self, project_id: str, artifact_type: str) -> int:
        current = self.db.scalar(
            select(func.max(Artifact.version)).where(
                Artifact.project_id == project_id,
                Artifact.artifact_type == artifact_type,
            )
        )
        return int(current or 0) + 1

    def create(
        self,
        *,
        project_id: str,
        artifact_type: str,
        name: str,
        version: int,
        status: str,
        payload: dict[str, Any],
        generated_by_run_id: str | None = None,
        commit: bool = True,
    ) -> Artifact:
        if generated_by_run_id is not None:
            existing = self.db.scalar(
                select(Artifact).where(
                    Artifact.generated_by_run_id == generated_by_run_id,
                    Artifact.artifact_type == artifact_type,
                )
            )
            if existing is not None:
                return existing
        artifact = Artifact(
            project_id=project_id,
            artifact_type=artifact_type,
            name=name,
            version=version,
            status=status,
            payload=payload,
            generated_by_run_id=generated_by_run_id,
        )
        self.db.add(artifact)
        if commit:
            self.db.commit()
            self.db.refresh(artifact)
        else:
            self.db.flush()
        return artifact

    def update(self, artifact: Artifact, **values: object) -> Artifact:
        for key, value in values.items():
            setattr(artifact, key, value)
        self.db.commit()
        self.db.refresh(artifact)
        return artifact
