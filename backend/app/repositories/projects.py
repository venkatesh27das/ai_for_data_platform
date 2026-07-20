from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Project, utcnow


class ProjectRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Project]:
        return list(self.db.scalars(select(Project).order_by(Project.updated_at.desc())))

    def get(self, project_id: str) -> Project | None:
        return self.db.get(Project, project_id)

    def create(self, *, name: str, objective: str) -> Project:
        project = Project(name=name, objective=objective)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

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
