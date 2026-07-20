import json
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.api.dependencies import (
    get_conversation_service,
    get_project_service,
    get_provider_configuration_service,
)
from app.autonomy.factory import build_autonomy_runtime
from app.config import get_settings
from app.db.models import Message, utcnow
from app.db.session import SessionLocal
from app.llm.registry import ProviderRegistry
from app.repositories.messages import MessageRepository
from app.repositories.projects import ProjectRepository
from app.repositories.sources import SourceRepository
from app.schemas.messages import MessageCreate, MessageRead
from app.services.conversations import ConversationService
from app.services.projects import ProjectService
from app.services.provider_settings import ProviderConfigurationService
from app.services.workflow_persistence import WorkflowPersistenceService
from app.services.workflows import WorkflowService, agent_progress_label

router = APIRouter(prefix="/projects/{project_id}/messages", tags=["conversations"])


def sse(event: str, data: object) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@router.get("", response_model=list[MessageRead])
def list_messages(
    project_id: str,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    conversations: Annotated[ConversationService, Depends(get_conversation_service)],
) -> list[Message]:
    projects.get(project_id)
    return conversations.list(project_id)


@router.post("/stream")
def stream_message(
    project_id: str,
    payload: MessageCreate,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    conversations: Annotated[ConversationService, Depends(get_conversation_service)],
    configuration: Annotated[
        ProviderConfigurationService, Depends(get_provider_configuration_service)
    ],
) -> StreamingResponse:
    project = projects.get(project_id)
    resume_from_checkpoint = project.status == "failed"
    awaiting_approval = project.workflow_stage == "awaiting_approval"
    approval_decision = parse_approval_decision(payload.content) if awaiting_approval else None
    existing_state = project.workflow_state
    conversations.add(project_id, "user", payload.content)
    projects.repository.update(project, status="in_progress", workflow_stage="understanding")
    config = configuration.get_model()
    history = [
        {"role": message.role, "content": message.content}
        for message in conversations.list(project_id)
        if message.role in {"user", "assistant"}
    ]
    source_metadata = [
        {
            "name": source.name,
            "format": source.format,
            "content_excerpt": source.content_excerpt,
            "profile": source.profile,
        }
        for source in SourceRepository(projects.repository.db).list_for_project(project_id)
    ]

    async def event_stream() -> AsyncIterator[str]:
        complete = ""
        try:
            yield sse("progress", {"label": "Understanding your modelling scenario"})
            settings = get_settings()
            provider = ProviderRegistry(settings).get(
                config.provider,
                base_url=config.base_url,
                model=config.model,
                api_key=config.api_key,
            )
            workflow = WorkflowService(
                provider,
                settings.agent_request_timeout,
                settings.workflow_checkpoint_path,
                *build_autonomy_runtime(
                    settings,
                    tool_calling_enabled=config.tool_calling,
                ),
            )
            final_state: dict[str, object] = {}
            interrupted = False
            async for workflow_event in workflow.run(
                project_id=project_id,
                user_message=payload.content,
                conversation=history,
                existing_state=existing_state,
                sources=source_metadata,
                resume_from_checkpoint=resume_from_checkpoint,
                approval_decision=approval_decision,
            ):
                event_name = str(workflow_event.get("event"))
                if event_name in {
                    "agent.started",
                    "agent.completed",
                    "tool.started",
                    "tool.completed",
                }:
                    event_data = {
                        "agent_id": workflow_event.get("agent_id"),
                        "confidence": workflow_event.get("confidence"),
                        "execution_mode": workflow_event.get("execution_mode"),
                        "label": agent_progress_label(workflow_event),
                    }
                    yield sse(event_name, event_data)
                    yield sse("progress", event_data)
                elif event_name == "workflow.completed":
                    state_value = workflow_event.get("state")
                    if isinstance(state_value, dict):
                        final_state = state_value
                elif event_name == "workflow.interrupted":
                    state_value = workflow_event.get("state")
                    if isinstance(state_value, dict):
                        final_state = state_value
                    final_state["workflow_stage"] = "awaiting_approval"
                    final_state["run_status"] = "interrupted"
                    interrupted = True
                    yield sse("approval.required", workflow_event.get("interrupt", {}))

            if interrupted:
                complete = (
                    "I prepared a bounded execution plan that requires your approval before "
                    "using an external capability. Review the plan and approve or reject it."
                )
                with SessionLocal() as db:
                    saved_project = ProjectRepository(db).get(project_id)
                    if saved_project is not None:
                        WorkflowPersistenceService(db).persist(saved_project, final_state)
                    MessageRepository(db).create(
                        project_id=project_id,
                        role="assistant",
                        content=complete,
                    )
                yield sse(
                    "done",
                    {
                        "content": complete,
                        "saved_at": utcnow().isoformat(),
                        "artifact_count": 0,
                        "workflow_stage": "awaiting_approval",
                    },
                )
                return

            yield sse("progress", {"label": "Presenting the orchestrator result"})
            async for token in workflow.stream_response(final_state, history):
                complete += token
                yield sse("token", {"content": token})

            with SessionLocal() as db:
                saved_project = ProjectRepository(db).get(project_id)
                artifacts = []
                if saved_project is not None:
                    artifacts = WorkflowPersistenceService(db).persist(saved_project, final_state)
                MessageRepository(db).create(
                    project_id=project_id, role="assistant", content=complete
                )
            yield sse(
                "done",
                {
                    "content": complete,
                    "saved_at": utcnow().isoformat(),
                    "artifact_count": len(artifacts),
                    "workflow_stage": final_state.get("workflow_stage"),
                },
            )
        except Exception as exc:
            reason = str(exc) or type(exc).__name__
            detail = f"The provider could not complete this request: {reason}"
            with SessionLocal() as db:
                MessageRepository(db).create(
                    project_id=project_id, role="assistant", content=detail
                )
                failed_project = ProjectRepository(db).get(project_id)
                if failed_project is not None:
                    ProjectRepository(db).update(
                        failed_project, status="failed", workflow_stage="error"
                    )
            yield sse("error", {"detail": detail})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


def parse_approval_decision(content: str) -> str:
    normalized = content.strip().lower()
    return "approved" if normalized in {"approve", "approved", "approve plan"} else "denied"
