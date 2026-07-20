from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import ProjectSource


class SourceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_project(self, project_id: str) -> list[ProjectSource]:
        statement = (
            select(ProjectSource)
            .where(ProjectSource.project_id == project_id)
            .order_by(ProjectSource.created_at)
        )
        return list(self.db.scalars(statement))

    def create(
        self,
        *,
        project_id: str,
        name: str,
        format: str,
        size_bytes: int,
        content_excerpt: str,
        profile: dict[str, Any],
    ) -> ProjectSource:
        source = ProjectSource(
            project_id=project_id,
            name=name,
            format=format,
            size_bytes=size_bytes,
            content_excerpt=content_excerpt,
            profile=profile,
        )
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        return source
