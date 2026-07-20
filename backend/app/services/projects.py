from fastapi import HTTPException, status

from app.db.models import Project
from app.repositories.projects import ProjectRepository
from app.schemas.projects import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, repository: ProjectRepository) -> None:
        self.repository = repository

    def list(self) -> list[Project]:
        return self.repository.list()

    def get(self, project_id: str) -> Project:
        project = self.repository.get(project_id)
        if project is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return project

    def create(self, payload: ProjectCreate) -> Project:
        return self.repository.create(
            name=payload.name,
            objective=payload.objective,
            source_count=payload.source_count,
        )

    def update(self, project_id: str, payload: ProjectUpdate) -> Project:
        return self.repository.update(
            self.get(project_id), **payload.model_dump(exclude_unset=True)
        )

    def delete(self, project_id: str) -> None:
        self.repository.delete(self.get(project_id))

    def duplicate(self, project_id: str) -> Project:
        return self.repository.duplicate(self.get(project_id))
