import asyncio
import json
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, cast

import aiosqlite
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.types import Command

from app.autonomy.capabilities import CapabilityRegistry
from app.autonomy.tools import ToolExecutor
from app.llm.base import LLMProvider
from app.orchestration.graph import MasterOrchestrator
from app.orchestration.state import ModellingGraphState
from app.services.agent_cache import AgentResultCache

PRESENTER_PROMPT = """You present the result of a multi-agent data-modelling workflow.
Use only the supplied structured workflow state. If blocking questions exist, briefly restate
the understood objective and ask those exact questions. If generation completed, summarize
the grain, entity/mapping/DQ counts, validation outcome, assumptions, and human-review items.
Tell the modeller which generated assets are available. Never invent artifacts, evidence, or
profiling statistics. Mention whether the planner or any specialist used a safe fallback and
summarize material tool or reactive-supervisor decisions. Be concise and transparent."""

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
        capabilities: CapabilityRegistry | None = None,
        tool_executor: ToolExecutor | None = None,
        checkpointer: Any | None = None,
        planner_fast_path: bool = False,
        presenter_fast_path: bool = False,
        recent_message_limit: int = 12,
        message_char_limit: int = 4_000,
        source_excerpt_limit: int = 8_000,
        result_cache: AgentResultCache | None = None,
        deterministic_source_analysis: bool = False,
        deterministic_structural_validation: bool = False,
    ) -> None:
        self.provider = provider
        self.orchestrator = MasterOrchestrator(
            provider,
            agent_timeout_seconds,
            capabilities,
            tool_executor,
            planner_fast_path,
            result_cache,
            deterministic_source_analysis,
            deterministic_structural_validation,
        )
        self.checkpoint_path = checkpoint_path
        self.checkpointer = checkpointer
        self.presenter_fast_path = presenter_fast_path
        self.recent_message_limit = recent_message_limit
        self.message_char_limit = message_char_limit
        self.source_excerpt_limit = source_excerpt_limit

    async def run(
        self,
        *,
        project_id: str,
        user_message: str,
        conversation: list[dict[str, Any]],
        existing_state: dict[str, Any] | None = None,
        sources: list[dict[str, Any]] | None = None,
        resume_from_checkpoint: bool = False,
        approval_decision: str | None = None,
        run_id: str | None = None,
        memory_context: dict[str, Any] | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        compact_conversation = compact_messages(
            conversation, self.recent_message_limit, self.message_char_limit
        )
        if memory_context and has_memory(memory_context):
            compact_conversation.insert(
                0,
                {
                    "role": "system",
                    "content": (
                        "Durable modelling memory. Treat it as background context, prefer the "
                        "current user instruction on conflict, and never claim memory as fresh "
                        "source evidence:\n" + json.dumps(memory_context)
                    )[-self.message_char_limit :],
                },
            )
        compact_sources = compact_source_metadata(
            sources or (existing_state or {}).get("sources", []), self.source_excerpt_limit
        )
        initial = cast(
            ModellingGraphState,
            {
                **(existing_state or {}),
                "project_id": project_id,
                "run_id": run_id,
                "thread_id": project_id,
                "user_message": user_message,
                "conversation_messages": compact_conversation,
                "memory_context": memory_context or {},
                "workflow_stage": "new",
                "run_status": "queued",
                "rework_count": 0,
                "rework_target": None,
                "regeneration_target": None,
                "agent_trace": [],
                "active_step_id": None,
                "next_action": None,
                "tool_steps_completed": [],
                "replan_count": 0,
                "replanning_reason": None,
                "sources": compact_sources,
            },
        )
        connection: aiosqlite.Connection | None = None
        graph = self.orchestrator.graph
        config: RunnableConfig | None = None
        if self.checkpointer is not None:
            graph = self.orchestrator.compile(self.checkpointer)
            config = {"configurable": {"thread_id": project_id, "checkpoint_ns": "modelling"}}
        elif self.checkpoint_path is not None:
            self.checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
            connection = await aiosqlite.connect(self.checkpoint_path)
            checkpointer = AsyncSqliteSaver(connection)
            await checkpointer.setup()
            graph = self.orchestrator.compile(checkpointer)
            config = {"configurable": {"thread_id": project_id, "checkpoint_ns": "modelling"}}
        try:
            graph_input: ModellingGraphState | Command[Any] | None = initial
            if approval_decision is not None and config is not None:
                graph_input = Command(resume={"decision": approval_decision})
            elif resume_from_checkpoint and config is not None:
                graph_input = None
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
            interrupts = final_state.get("__interrupt__", [])
            if interrupts:
                first = interrupts[0]
                persisted_state = {
                    key: value for key, value in final_state.items() if key != "__interrupt__"
                }
                yield {
                    "event": "workflow.interrupted",
                    "state": persisted_state,
                    "interrupt": getattr(first, "value", first),
                }
            else:
                yield {"event": "workflow.completed", "state": final_state}
        finally:
            if connection is not None:
                await connection.close()

    async def stream_response(
        self, state: dict[str, Any], conversation: list[dict[str, Any]]
    ) -> AsyncIterator[str]:
        if self.presenter_fast_path:
            yield deterministic_presenter(state)
            return
        relevant_state = {
            key: state.get(key)
            for key in (
                "workflow_stage",
                "execution_plan",
                "tool_trace",
                "decision_trace",
                "approval_status",
                "modelling_brief",
                "source_analysis",
                "logical_model",
                "mapping_dq",
                "validation_report",
                "operation_impact",
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


def compact_messages(
    messages: list[dict[str, Any]], limit: int, character_limit: int
) -> list[dict[str, Any]]:
    return [
        {
            "role": item.get("role", "user"),
            "content": str(item.get("content", ""))[-character_limit:],
        }
        for item in messages[-limit:]
    ]


def compact_source_metadata(
    sources: list[dict[str, Any]], excerpt_limit: int
) -> list[dict[str, Any]]:
    return [
        {
            **source,
            "content_excerpt": str(source.get("content_excerpt", ""))[:excerpt_limit],
        }
        for source in sources
    ]


def has_memory(value: dict[str, Any]) -> bool:
    return bool(
        value.get("project_summary")
        or value.get("facts")
        or value.get("decisions")
        or value.get("preferences")
        or value.get("relevant_memories")
    )


def deterministic_presenter(state: dict[str, Any]) -> str:
    stage = str(state.get("workflow_stage", "completed"))
    brief_value = state.get("modelling_brief")
    brief: dict[str, Any] = brief_value if isinstance(brief_value, dict) else {}
    impact_value = state.get("operation_impact")
    impact: dict[str, Any] = impact_value if isinstance(impact_value, dict) else {}
    if impact.get("validation_errors"):
        return "I could not apply the requested model change: " + "; ".join(
            map(str, impact["validation_errors"])
        )
    if stage == "awaiting_clarification":
        questions = brief.get("blocking_questions", []) if isinstance(brief, dict) else []
        rendered = " ".join(
            str(item.get("question", "")) for item in questions if isinstance(item, dict)
        )
        return f"I need one modelling decision before continuing: {rendered}".strip()
    if stage == "awaiting_sources":
        return "I understand the scenario, but I need source metadata or files before modelling."
    model_value = state.get("logical_model")
    mapping_value = state.get("mapping_dq")
    validation_value = state.get("validation_report")
    model: dict[str, Any] = model_value if isinstance(model_value, dict) else {}
    mapping: dict[str, Any] = mapping_value if isinstance(mapping_value, dict) else {}
    validation: dict[str, Any] = (
        validation_value if isinstance(validation_value, dict) else {}
    )
    entity_count = len(model.get("entities", []))
    mapping_count = len(mapping.get("mappings", []))
    dq_count = len(mapping.get("dq_rules", []))
    finding_count = len(validation.get("findings", []))
    grain = str(model.get("fact_grain") or brief.get("candidate_grain") or "Not confirmed")
    review = (
        f" {finding_count} validation finding(s) need review."
        if finding_count
        else " Validation completed without findings."
    )
    return (
        f"The modelling run is complete. Grain: {grain}. Generated {entity_count} entities, "
        f"{mapping_count} mappings, and {dq_count} data-quality rules.{review} "
        "Open a generated asset to inspect or revise it."
    )


def agent_progress_label(event: dict[str, Any]) -> str:
    if str(event.get("event", "")).startswith("tool."):
        action = "started" if event.get("event") == "tool.started" else "completed"
        return f"Tool {event.get('agent_id', 'execution')} {action}"
    agent = AGENT_LABELS.get(str(event.get("agent_id")), "Specialist agent")
    action = "started" if event.get("event") == "agent.started" else "completed"
    return f"{agent} {action}"
