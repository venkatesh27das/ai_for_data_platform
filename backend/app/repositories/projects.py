from copy import deepcopy

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Artifact, Message, Project, ProjectSource, utcnow


class ProjectRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Project]:
        return list(self.db.scalars(select(Project).order_by(Project.updated_at.desc())))

    def get(self, project_id: str) -> Project | None:
        return self.db.get(Project, project_id)

    def create(self, *, name: str, objective: str, source_count: int = 0) -> Project:
        project = Project(name=name, objective=objective, source_count=source_count)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def duplicate(self, source: Project) -> Project:
        duplicate = Project(
            name=f"{source.name} (copy)",
            objective=source.objective,
            status=source.status,
            workflow_stage=source.workflow_stage,
            source_count=source.source_count,
            entity_count=source.entity_count,
            mapping_count=source.mapping_count,
            dq_rule_count=source.dq_rule_count,
            review_count=source.review_count,
            workflow_state=deepcopy(source.workflow_state),
        )
        duplicate.messages = [
            Message(role=message.role, content=message.content) for message in source.messages
        ]
        duplicate.artifacts = [
            Artifact(
                artifact_type=artifact.artifact_type,
                name=artifact.name,
                version=artifact.version,
                status=artifact.status,
                review_status=artifact.review_status,
                review_note=artifact.review_note,
                payload=deepcopy(artifact.payload),
            )
            for artifact in source.artifacts
        ]
        duplicate.sources = [
            ProjectSource(
                name=project_source.name,
                format=project_source.format,
                size_bytes=project_source.size_bytes,
                content_excerpt=project_source.content_excerpt,
                profile=deepcopy(project_source.profile),
            )
            for project_source in source.sources
        ]
        self.db.add(duplicate)
        self.db.commit()
        self.db.refresh(duplicate)
        return duplicate

    def update(self, project: Project, **values: object) -> Project:
        for key, value in values.items():
            if value is not None:
                setattr(project, key, value)
        project.updated_at = utcnow()
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()
