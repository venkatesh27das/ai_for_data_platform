from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import Artifact, Message
from app.repositories.projects import ProjectRepository
from app.schemas.projects import ProjectCreate, ProjectUpdate
from app.services.projects import ProjectService


def test_project_crud_and_duplicate() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        service = ProjectService(ProjectRepository(db))
        project = service.create(
            ProjectCreate(name="Sales model", objective="Analyse orders", source_count=2)
        )
        assert project.status == "draft"
        assert service.get(project.id).objective == "Analyse orders"

        project.messages.append(Message(role="user", content="Model order lines"))
        project.artifacts.append(
            Artifact(
                artifact_type="logical_model",
                name="Sales model",
                version=1,
                status="ready",
                payload={"entities": []},
            )
        )
        db.commit()

        updated = service.update(project.id, ProjectUpdate(status="in_progress"))
        assert updated.status == "in_progress"

        duplicate = service.duplicate(project.id)
        assert duplicate.name == "Sales model (copy)"
        assert duplicate.source_count == 2
        assert [message.content for message in duplicate.messages] == ["Model order lines"]
        assert [artifact.name for artifact in duplicate.artifacts] == ["Sales model"]
        assert len(service.list()) == 2

        service.delete(project.id)
        assert [item.id for item in service.list()] == [duplicate.id]
