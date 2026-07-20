from collections.abc import AsyncIterator
from typing import Any

from app.llm.base import LLMProvider
from app.orchestration.graph import modelling_graph

SYSTEM_PROMPT = """You are the requirement and clarification guide in an AI data
modelling assistant. Help the user turn an analytical scenario into a dimensional
modelling brief. Be concise and practical. In this first workflow step: restate the
objective, identify the likely business process and candidate fact grain, list any
assumptions, then ask at most two genuinely blocking questions. Do not claim that a
logical model, mappings, or data-quality rules have already been generated. Invite the
user to attach source metadata. Use markdown headings sparingly and never expose hidden
reasoning."""


class WorkflowService:
    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider

    async def prepare(
        self, *, project_id: str, user_message: str, conversation: list[dict[str, Any]]
    ) -> None:
        await modelling_graph.ainvoke(
            {
                "project_id": project_id,
                "thread_id": project_id,
                "user_message": user_message,
                "conversation_messages": conversation,
                "workflow_stage": "new",
                "run_status": "queued",
            }
        )

    async def stream(self, conversation: list[dict[str, Any]]) -> AsyncIterator[str]:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}, *conversation]
        async for token in self.provider.stream_text(messages):
            yield token
