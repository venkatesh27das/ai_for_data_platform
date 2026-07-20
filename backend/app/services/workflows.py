import asyncio
import json
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, cast

import aiosqlite
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from app.llm.base import LLMProvider
from app.orchestration.graph import MasterOrchestrator
from app.orchestration.state import ModellingGraphState

PRESENTER_PROMPT = """You present the result of a multi-agent data-modelling workflow.
Use only the supplied structured workflow state. If blocking questions exist, briefly restate
the understood objective and ask those exact questions. If generation completed, summarize
the grain, entity/mapping/DQ counts, validation outcome, assumptions, and human-review items.
Tell the modeller which generated assets are available. Never invent artifacts, evidence, or
profiling statistics. Be concise, practical, and transparent about assumptions."""

AGENT_LABELS = {
    "requirement_agent": "Requirement and clarification agent",
    "source_analysis_agent": "Source analysis agent",
    "model_design_agent": "Model design agent",
    "mapping_dq_agent": "Mapping and DQ agent",
    "validation_agent": "Validation agent",
}


class WorkflowService:
    def __init__(
        self,
        provider: LLMProvider,
        agent_timeout_seconds: float = 45,
        checkpoint_path: Path | None = None,
    ) -> None:
        self.provider = provider
        self.orchestrator = MasterOrchestrator(provider, agent_timeout_seconds)
        self.checkpoint_path = checkpoint_path

    async def run(
        self,
        *,
        project_id: str,
        user_message: str,
        conversation: list[dict[str, Any]],
        existing_state: dict[str, Any] | None = None,
        sources: list[dict[str, Any]] | None = None,
        resume_from_checkpoint: bool = False,
    ) -> AsyncIterator[dict[str, Any]]:
        initial = cast(
            ModellingGraphState,
            {
                **(existing_state or {}),
                "project_id": project_id,
                "thread_id": project_id,
                "user_message": user_message,
                "conversation_messages": conversation,
                "workflow_stage": "new",
                "run_status": "queued",
                "rework_count": 0,
                "rework_target": None,
                "regeneration_target": None,
                "agent_trace": [],
                "sources": sources or (existing_state or {}).get("sources", []),
            },
        )
        connection: aiosqlite.Connection | None = None
        graph = self.orchestrator.graph
        config: RunnableConfig | None = None
        if self.checkpoint_path is not None:
            self.checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
            connection = await aiosqlite.connect(self.checkpoint_path)
            checkpointer = AsyncSqliteSaver(connection)
            await checkpointer.setup()
            graph = self.orchestrator.compile(checkpointer)
            config = {"configurable": {"thread_id": project_id, "checkpoint_ns": "modelling"}}
        try:
            graph_input: ModellingGraphState | None = (
                None if resume_from_checkpoint and config is not None else initial
            )
            graph_task = asyncio.create_task(graph.ainvoke(graph_input, config=config))
            while not graph_task.done():
                try:
                    event = await asyncio.wait_for(self.orchestrator.events.get(), timeout=0.1)
                    yield event
                except TimeoutError:
                    continue
            while not self.orchestrator.events.empty():
                yield self.orchestrator.events.get_nowait()
            final_state = await graph_task
            yield {"event": "workflow.completed", "state": final_state}
        finally:
            if connection is not None:
                await connection.close()

    async def stream_response(
        self, state: dict[str, Any], conversation: list[dict[str, Any]]
    ) -> AsyncIterator[str]:
        relevant_state = {
            key: state.get(key)
            for key in (
                "workflow_stage",
                "modelling_brief",
                "source_analysis",
                "logical_model",
                "mapping_dq",
                "validation_report",
            )
            if state.get(key) is not None
        }
        messages = [
            {"role": "system", "content": PRESENTER_PROMPT},
            *conversation,
            {
                "role": "system",
                "content": "Structured workflow result:\n" + json.dumps(relevant_state),
            },
        ]
        async for token in self.provider.stream_text(messages):
            yield token


def agent_progress_label(event: dict[str, Any]) -> str:
    agent = AGENT_LABELS.get(str(event.get("agent_id")), "Specialist agent")
    action = "started" if event.get("event") == "agent.started" else "completed"
    return f"{agent} {action}"
