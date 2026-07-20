from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.repositories.projects import ProjectRepository
from app.schemas.projects import ProjectCreate, ProjectUpdate
from app.services.projects import ProjectService


def test_project_crud_and_duplicate() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        service = ProjectService(ProjectRepository(db))
        project = service.create(ProjectCreate(name="Sales model", objective="Analyse orders"))
        assert project.status == "draft"
        assert service.get(project.id).objective == "Analyse orders"

        updated = service.update(project.id, ProjectUpdate(status="in_progress"))
        assert updated.status == "in_progress"

        duplicate = service.duplicate(project.id)
        assert duplicate.name == "Sales model (copy)"
        assert len(service.list()) == 2

        service.delete(project.id)
        assert [item.id for item in service.list()] == [duplicate.id]
