from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.repositories.projects import ProjectRepository
from app.repositories.workflow_runs import WorkflowRunRepository


def test_workflow_runs_are_idempotent_replayable_and_leased() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine, expire_on_commit=False) as db:
        project = ProjectRepository(db).create(name="Sales", objective="Model sales")
        runs = WorkflowRunRepository(db)
        first, created = runs.get_or_create(
            project_id=project.id,
            idempotency_key="request-123",
            request_content="Build a model",
        )
        duplicate, duplicate_created = runs.get_or_create(
            project_id=project.id,
            idempotency_key="request-123",
            request_content="Build a model",
        )
        second, _ = runs.get_or_create(
            project_id=project.id,
            idempotency_key="request-456",
            request_content="Regenerate mappings",
        )

        assert created is True
        assert duplicate_created is False
        assert duplicate.id == first.id
        assert runs.acquire_project_lease(project.id, first.id) is True
        assert runs.acquire_project_lease(project.id, second.id) is False

        one = runs.append_event(first, "progress", {"label": "Planning"})
        two = runs.append_event(first, "done", {"content": "Ready"})
        assert [event.sequence for event in runs.events_after(first.id, 0)] == [1, 2]
        assert one.event_type == "progress"
        assert two.payload["content"] == "Ready"

        runs.finish(first, status="completed", response_content="Ready", duration_ms=12.5)
        db.refresh(project)
        assert project.active_run_id is None
        assert first.duration_ms == 12.5
