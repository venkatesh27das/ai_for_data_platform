import pytest
from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.models import Artifact, Message, WorkflowEvent
from app.repositories.projects import ProjectRepository
from app.repositories.workflow_runs import WorkflowRunRepository
from app.services import workflow_runner


def test_finalization_is_atomic_and_run_idempotent(monkeypatch: object) -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    local_session = sessionmaker(bind=engine, expire_on_commit=False)
    monkeypatch.setattr(workflow_runner, "SessionLocal", local_session)  # type: ignore[attr-defined]
    with Session(engine, expire_on_commit=False) as db:
        project = ProjectRepository(db).create(name="Sales", objective="Analyse sales")
        run, _ = WorkflowRunRepository(db).get_or_create(
            project_id=project.id,
            idempotency_key="request-1",
            request_content="Build a sales model",
        )

    state = workflow_state()
    first_count = workflow_runner._finalize_result(
        run_id=run.id,
        project_id=project.id,
        state=state,
        response="Model ready",
        status="completed",
        duration_ms=10,
    )
    second_count = workflow_runner._finalize_result(
        run_id=run.id,
        project_id=project.id,
        state=state,
        response="Model ready",
        status="completed",
        duration_ms=10,
    )

    with Session(engine) as db:
        persisted_project = ProjectRepository(db).get(project.id)
        persisted_run = WorkflowRunRepository(db).get(run.id)
        assert first_count == second_count == 5
        assert persisted_project is not None and persisted_project.state_version == 1
        assert persisted_run is not None and persisted_run.status == "completed"
        assert len(list(db.scalars(select(Artifact)))) == 5
        assert len(list(db.scalars(select(Message)))) == 1
        assert len(list(db.scalars(select(WorkflowEvent)))) == 1


def test_finalization_rolls_back_every_output_when_commit_fails(monkeypatch: object) -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    local_session = sessionmaker(bind=engine, expire_on_commit=False)
    monkeypatch.setattr(workflow_runner, "SessionLocal", local_session)  # type: ignore[attr-defined]
    with Session(engine, expire_on_commit=False) as db:
        project = ProjectRepository(db).create(name="Sales", objective="Analyse sales")
        run, _ = WorkflowRunRepository(db).get_or_create(
            project_id=project.id,
            idempotency_key="request-rollback",
            request_content="Build a sales model",
        )

    def reject_commit(_: Session) -> None:
        raise RuntimeError("simulated commit failure")

    event.listen(local_session.class_, "before_commit", reject_commit)
    with pytest.raises(RuntimeError, match="simulated commit failure"):
        workflow_runner._finalize_result(
            run_id=run.id,
            project_id=project.id,
            state=workflow_state(),
            response="Model ready",
            status="completed",
            duration_ms=10,
        )
    event.remove(local_session.class_, "before_commit", reject_commit)

    with Session(engine) as db:
        persisted_project = ProjectRepository(db).get(project.id)
        persisted_run = WorkflowRunRepository(db).get(run.id)
        assert persisted_project is not None and persisted_project.state_version == 0
        assert persisted_run is not None and persisted_run.status == "queued"
        assert list(db.scalars(select(Artifact))) == []
        assert list(db.scalars(select(Message))) == []
        assert list(db.scalars(select(WorkflowEvent))) == []


def workflow_state() -> dict[str, object]:
    return {
        "workflow_stage": "completed",
        "source_analysis": {"sources": [{"table_name": "order_line"}]},
        "logical_model": {
            "model_name": "Sales",
            "entities": [{"id": "fact_sales", "name": "FactSales", "kind": "fact"}],
        },
        "mapping_dq": {"mappings": [], "dq_rules": []},
        "validation_report": {"findings": [], "summary": "Passed"},
    }
