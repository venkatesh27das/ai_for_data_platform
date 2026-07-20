from typing import Any, cast

from sqlalchemy import select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models import Project, WorkflowEvent, WorkflowRun, utcnow


class WorkflowRunRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, run_id: str) -> WorkflowRun | None:
        return self.db.get(WorkflowRun, run_id)

    def get_or_create(
        self, *, project_id: str, idempotency_key: str, request_content: str
    ) -> tuple[WorkflowRun, bool]:
        existing = self.db.scalar(
            select(WorkflowRun).where(
                WorkflowRun.project_id == project_id,
                WorkflowRun.idempotency_key == idempotency_key,
            )
        )
        if existing is not None:
            return existing, False
        run = WorkflowRun(
            project_id=project_id,
            idempotency_key=idempotency_key,
            request_content=request_content,
        )
        self.db.add(run)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            existing = self.db.scalar(
                select(WorkflowRun).where(
                    WorkflowRun.project_id == project_id,
                    WorkflowRun.idempotency_key == idempotency_key,
                )
            )
            if existing is None:
                raise
            return existing, False
        self.db.refresh(run)
        return run, True

    def acquire_project_lease(self, project_id: str, run_id: str) -> bool:
        result = cast(
            CursorResult[Any],
            self.db.execute(
                update(Project)
                .where(
                    Project.id == project_id,
                    (Project.active_run_id.is_(None) | (Project.active_run_id == run_id)),
                )
                .values(active_run_id=run_id)
            ),
        )
        self.db.commit()
        return bool(result.rowcount)

    def mark_running(self, run: WorkflowRun) -> None:
        now = utcnow()
        run.status = "running"
        run.started_at = run.started_at or now
        run.heartbeat_at = now
        self.db.commit()

    def append_event(
        self,
        run: WorkflowRun,
        event_type: str,
        payload: dict[str, object],
        *,
        commit: bool = True,
    ) -> WorkflowEvent:
        run.last_event_sequence += 1
        run.heartbeat_at = utcnow()
        event = WorkflowEvent(
            run_id=run.id,
            sequence=run.last_event_sequence,
            event_type=event_type,
            payload=payload,
        )
        self.db.add(event)
        if commit:
            self.db.commit()
            self.db.refresh(event)
        else:
            self.db.flush()
        return event

    def events_after(self, run_id: str, sequence: int) -> list[WorkflowEvent]:
        return list(
            self.db.scalars(
                select(WorkflowEvent)
                .where(WorkflowEvent.run_id == run_id, WorkflowEvent.sequence > sequence)
                .order_by(WorkflowEvent.sequence)
            )
        )

    def finish(
        self,
        run: WorkflowRun,
        *,
        status: str,
        response_content: str = "",
        error: str = "",
        duration_ms: float = 0,
        commit: bool = True,
    ) -> None:
        now = utcnow()
        run.status = status
        run.response_content = response_content
        run.error = error
        run.duration_ms = duration_ms
        run.completed_at = now
        run.heartbeat_at = now
        self.db.execute(
            update(Project)
            .where(Project.id == run.project_id, Project.active_run_id == run.id)
            .values(active_run_id=None)
        )
        if commit:
            self.db.commit()
        else:
            self.db.flush()
