import json
from collections.abc import AsyncIterator
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.api.dependencies import (
    get_conversation_service,
    get_project_service,
    get_provider_configuration_service,
)
from app.config import get_settings
from app.db.models import Message, utcnow
from app.db.session import SessionLocal
from app.llm.registry import ProviderRegistry
from app.repositories.messages import MessageRepository
from app.repositories.projects import ProjectRepository
from app.schemas.messages import MessageCreate, MessageRead
from app.services.conversations import ConversationService
from app.services.projects import ProjectService
from app.services.provider_settings import ProviderConfigurationService
from app.services.workflows import WorkflowService

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
    conversations.add(project_id, "user", payload.content)
    projects.repository.update(project, status="in_progress", workflow_stage="understanding")
    config = configuration.get_model()
    history = [
        {"role": message.role, "content": message.content}
        for message in conversations.list(project_id)
        if message.role in {"user", "assistant"}
    ]

    async def event_stream() -> AsyncIterator[str]:
        complete = ""
        try:
            yield sse("progress", {"label": "Understanding your modelling scenario"})
            provider = ProviderRegistry(get_settings()).get(
                config.provider,
                base_url=config.base_url,
                model=config.model,
                api_key=config.api_key,
            )
            workflow = WorkflowService(provider)
            await workflow.prepare(
                project_id=project_id, user_message=payload.content, conversation=history
            )
            yield sse("progress", {"label": "Consulting the configured model"})
            async for token in workflow.stream(history):
                complete += token
                yield sse("token", {"content": token})

            with SessionLocal() as db:
                MessageRepository(db).create(
                    project_id=project_id, role="assistant", content=complete
                )
                saved_project = ProjectRepository(db).get(project_id)
                if saved_project is not None:
                    ProjectRepository(db).update(saved_project, workflow_stage="awaiting_input")
            yield sse("done", {"content": complete, "saved_at": utcnow().isoformat()})
        except (httpx.HTTPError, RuntimeError, ValueError) as exc:
            detail = f"The provider could not complete this request: {exc}"
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
