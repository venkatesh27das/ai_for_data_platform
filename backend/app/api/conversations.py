import asyncio
import json
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.api.dependencies import get_conversation_service, get_project_service
from app.config import get_settings
from app.db.models import Message
from app.db.session import SessionLocal
from app.repositories.workflow_runs import WorkflowRunRepository
from app.runtime import ensure_runtime
from app.schemas.messages import MessageCreate, MessageRead
from app.services.conversations import ConversationService
from app.services.projects import ProjectService
from app.services.workflow_runner import TERMINAL_RUN_STATUSES, execute_workflow_run

router = APIRouter(prefix="/projects/{project_id}/messages", tags=["conversations"])


def sse(event: str, data: object, *, sequence: int | None = None) -> str:
    event_id = f"id: {sequence}\n" if sequence is not None else ""
    return f"{event_id}event: {event}\ndata: {json.dumps(data)}\n\n"


@router.get("", response_model=list[MessageRead])
def list_messages(
    project_id: str,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    conversations: Annotated[ConversationService, Depends(get_conversation_service)],
) -> list[Message]:
    projects.get(project_id)
    return conversations.list(project_id)


@router.post("/stream")
async def stream_message(
    project_id: str,
    payload: MessageCreate,
    projects: Annotated[ProjectService, Depends(get_project_service)],
) -> StreamingResponse:
    projects.get(project_id)
    runtime = await ensure_runtime()
    with SessionLocal() as db:
        repository = WorkflowRunRepository(db)
        run, created = repository.get_or_create(
            project_id=project_id,
            idempotency_key=payload.idempotency_key,
            request_content=payload.content,
        )
        if not created and run.request_content != payload.content:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The idempotency key was already used for a different message.",
            )
        run_id = run.id
        run_status = run.status
    if created or (run_status == "queued" and run_id not in runtime.tasks):
        task = asyncio.create_task(execute_workflow_run(run_id, runtime))
        runtime.track_task(run_id, task)
    return StreamingResponse(
        follow_run_events(run_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "X-Workflow-Run-ID": run_id,
            "Access-Control-Expose-Headers": "X-Workflow-Run-ID",
        },
    )


@router.get("/runs/active")
def active_run(
    project_id: str,
    projects: Annotated[ProjectService, Depends(get_project_service)],
) -> dict[str, str] | None:
    project = projects.get(project_id)
    if not project.active_run_id:
        return None
    with SessionLocal() as db:
        run = WorkflowRunRepository(db).get(project.active_run_id)
        if run is None or run.status in TERMINAL_RUN_STATUSES:
            return None
        return {"run_id": run.id, "status": run.status}


@router.get("/runs/{run_id}/stream")
async def reconnect_run(project_id: str, run_id: str, after: int = 0) -> StreamingResponse:
    with SessionLocal() as db:
        run = WorkflowRunRepository(db).get(run_id)
        if run is None or run.project_id != project_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return StreamingResponse(
        follow_run_events(run_id, after=after),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/runs/{run_id}/cancel", status_code=status.HTTP_202_ACCEPTED)
async def cancel_run(project_id: str, run_id: str) -> dict[str, str]:
    runtime = await ensure_runtime()
    with SessionLocal() as db:
        run = WorkflowRunRepository(db).get(run_id)
        if run is None or run.project_id != project_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
        if run.status in TERMINAL_RUN_STATUSES:
            return {"run_id": run.id, "status": run.status}
    task = runtime.tasks.get(run_id)
    if task is not None:
        task.cancel()
    return {"run_id": run_id, "status": "cancelling"}


async def follow_run_events(run_id: str, *, after: int = 0) -> AsyncIterator[str]:
    await ensure_runtime()
    interval = get_settings().workflow_event_poll_interval
    sequence = after
    while True:
        with SessionLocal() as db:
            repository = WorkflowRunRepository(db)
            run = repository.get(run_id)
            if run is None:
                yield sse("error", {"detail": "Workflow run disappeared"})
                return
            events = repository.events_after(run_id, sequence)
            terminal = run.status in TERMINAL_RUN_STATUSES
            last_sequence = run.last_event_sequence
        for event in events:
            sequence = event.sequence
            yield sse(event.event_type, event.payload, sequence=event.sequence)
        if terminal and sequence >= last_sequence:
            return
        await asyncio.sleep(interval)
