import asyncio
import re
from asyncio import Queue
from time import perf_counter
from typing import Any, Literal

from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from app.agents import (
    MappingDQAgent,
    ModelDesignAgent,
    RequirementAgent,
    SourceAnalysisAgent,
    ValidationAgent,
)
from app.agents.contracts import (
    LogicalModelProposal,
    MappingDQAgentInput,
    MappingDQProposal,
    ModelDesignAgentInput,
    ModellingBrief,
    RequirementAgentInput,
    SourceAnalysis,
    SourceAnalysisAgentInput,
    SourceMetadata,
    ValidationAgentInput,
    ValidationReport,
)
from app.autonomy.capabilities import CapabilityRegistry
from app.autonomy.contracts import (
    DecisionRecord,
    ExecutionPlan,
    PlannedToolCall,
    PlanningInput,
    PlanStep,
    ToolRequest,
)
from app.autonomy.planner import PlannerAgent
from app.autonomy.tools import ToolContext, ToolExecutor, ToolRegistry
from app.llm.base import LLMProvider
from app.orchestration.state import ModellingGraphState
from app.services.agent_cache import AgentResultCache

NodeResult = dict[str, Any]


class MasterOrchestrator:
    """Deterministic LangGraph coordinator for provider-independent specialist agents."""

    def __init__(
        self,
        provider: LLMProvider,
        agent_timeout_seconds: float = 45,
        capabilities: CapabilityRegistry | None = None,
        tool_executor: ToolExecutor | None = None,
        planner_fast_path: bool = False,
        result_cache: AgentResultCache | None = None,
    ) -> None:
        self.events: Queue[dict[str, Any]] = Queue()
        self.capabilities = capabilities or CapabilityRegistry()
        self.tool_executor = tool_executor or ToolExecutor(ToolRegistry(), self.capabilities)
        self.planner_agent = PlannerAgent(provider, agent_timeout_seconds, result_cache)
        self.requirement_agent = RequirementAgent(provider, agent_timeout_seconds, result_cache)
        self.source_analysis_agent = SourceAnalysisAgent(
            provider, agent_timeout_seconds, result_cache
        )
        self.model_design_agent = ModelDesignAgent(provider, agent_timeout_seconds, result_cache)
        self.mapping_dq_agent = MappingDQAgent(provider, agent_timeout_seconds, result_cache)
        self.validation_agent = ValidationAgent(provider, agent_timeout_seconds, result_cache)
        self.planner_fast_path = planner_fast_path
        self.builder = self._build_graph()
        self.graph = self.builder.compile()

    def compile(self, checkpointer: Any) -> Any:
        return self.builder.compile(checkpointer=checkpointer)

    async def load_project_state(self, state: ModellingGraphState) -> NodeResult:
        return {
            "workflow_stage": "understanding",
            "run_status": "running",
            "agent_trace": state.get("agent_trace", []),
            "regeneration_target": detect_regeneration_target(state.get("user_message") or ""),
        }

    async def plan_execution(self, state: ModellingGraphState) -> NodeResult:
        payload = PlanningInput(
            user_message=state.get("user_message") or "",
            existing_state=planning_context(state),
            available_skills=self.capabilities.all(),
            available_tools=self.tool_executor.registry.names(),
            validation_findings=state.get("validation_findings", []),
        )
        await self.emit("agent.started", self.planner_agent.identifier)
        if self.planner_fast_path and standard_plan_is_sufficient(state):
            plan = self.planner_agent.deterministic_plan(payload)
        else:
            plan = await self.planner_agent.run(payload)
        try:
            validate_plan(plan, self.capabilities, set(self.tool_executor.registry.names()))
        except ValueError as exc:
            plan = self.planner_agent.fallback(payload, exc).model_copy(
                update={"execution_mode": "fallback", "fallback_reason": str(exc)}
            )
        plan = reconcile_plan_with_state(plan, state)
        approval_required = plan.requires_human_approval or any(
            step_requires_approval(step, self.capabilities)
            for step in plan.steps
            if step.status != "completed"
        )
        if approval_required and not plan.requires_human_approval:
            plan = plan.model_copy(
                update={
                    "requires_human_approval": True,
                    "approval_reason": "The plan includes a capability that requires approval.",
                }
            )
        await self.emit(
            "agent.completed",
            self.planner_agent.identifier,
            confidence=plan.confidence,
            execution_mode=plan.execution_mode,
        )
        return {
            "execution_plan": plan.model_dump(mode="json"),
            "workflow_stage": "planned",
            "approval_status": "required" if approval_required else "not_required",
            "active_step_id": None,
            "next_action": None,
            "replan_count": state.get("replan_count", 0)
            + (1 if state.get("replanning_reason") else 0),
            "replanning_reason": None,
            "decision_trace": [
                *state.get("decision_trace", []),
                DecisionRecord(
                    decision="execution_plan_created",
                    reason=plan.rationale,
                    selected_route="approval" if approval_required else "execute",
                    plan_id=plan.plan_id,
                ).model_dump(mode="json"),
            ],
        }

    async def request_plan_approval(self, state: ModellingGraphState) -> NodeResult:
        plan = ExecutionPlan.model_validate(state["execution_plan"])
        response = interrupt(
            {
                "type": "plan_approval",
                "plan_id": plan.plan_id,
                "reason": plan.approval_reason or "This plan requires modeller approval.",
                "steps": [step.model_dump(mode="json") for step in plan.steps],
            }
        )
        approved = response == "approved" or (
            isinstance(response, dict) and response.get("decision") == "approved"
        )
        return {
            "approval_status": "approved" if approved else "denied",
            "workflow_stage": "plan_approved" if approved else "approval_denied",
            "decision_trace": [
                *state.get("decision_trace", []),
                DecisionRecord(
                    decision="plan_approval",
                    reason="The modeller approved the plan."
                    if approved
                    else "Approval was denied.",
                    selected_route="execute" if approved else "stop",
                    plan_id=plan.plan_id,
                ).model_dump(mode="json"),
            ],
        }

    async def execute_planned_tools(self, state: ModellingGraphState) -> NodeResult:
        plan = ExecutionPlan.model_validate(state["execution_plan"])
        step = plan_step(plan, state.get("active_step_id"))
        calls = planned_tool_calls(step)
        if not calls:
            return {
                "workflow_stage": "tools_skipped",
                "tool_steps_completed": [*state.get("tool_steps_completed", []), step.id],
            }
        remaining = max(0, plan.tool_call_budget - len(state.get("tool_trace", [])))
        selected_calls = calls[:remaining]
        requests = [
            ToolRequest(
                tool_name=call.tool_name,
                arguments=call.arguments,
                requested_by=step.agent_id,
                skill_id=step.skill_id,
                plan_step_id=step.id,
            )
            for call in selected_calls
        ]
        records = []
        results = dict(state.get("tool_results", {}))
        budget_exhausted = len(requests) < len(calls)
        async def execute_request(request: ToolRequest) -> Any:
            await self.emit("tool.started", request.tool_name)
            record = await self.tool_executor.execute(
                request,
                ToolContext(
                    project_id=state.get("project_id", ""),
                    run_id=state.get("run_id"),
                    state=dict(state),
                ),
            )
            if record.status == "completed":
                results[record.tool_name] = record.result
            await self.emit(
                "tool.completed",
                request.tool_name,
                execution_mode=record.status,
            )
            return record

        if len(requests) > 1 and all(call.parallel_safe for call in selected_calls):
            records.extend(await asyncio.gather(*(execute_request(item) for item in requests)))
        else:
            for request in requests:
                records.append(await execute_request(request))
        failed = [record for record in records if record.status != "completed"]
        reason: str | None = None
        if budget_exhausted:
            reason = f"Tool-call budget was exhausted while executing step {step.id}."
        elif failed:
            reason = "; ".join(
                f"{record.tool_name}: {record.error or record.status}" for record in failed
            )
        revised = update_plan_step_status(plan, step.id, "failed" if reason else "running")
        return {
            "tool_results": results,
            "tool_trace": [
                *state.get("tool_trace", []),
                *(record.model_dump(mode="json") for record in records),
            ],
            "execution_plan": revised.model_dump(mode="json"),
            "tool_steps_completed": (
                state.get("tool_steps_completed", [])
                if reason
                else [*state.get("tool_steps_completed", []), step.id]
            ),
            "replanning_reason": reason,
            "workflow_stage": "tool_observation_failed" if reason else "tools_completed",
        }

    async def dispatch_plan(self, state: ModellingGraphState) -> NodeResult:
        plan = ExecutionPlan.model_validate(state["execution_plan"])
        if state.get("replanning_reason"):
            if state.get("replan_count", 0) < plan.iteration_budget:
                return {
                    "next_action": "replan",
                    "workflow_stage": "replanning",
                    "decision_trace": [
                        *state.get("decision_trace", []),
                        DecisionRecord(
                            decision="observation_requires_replan",
                            reason=state["replanning_reason"] or "Execution observation failed.",
                            selected_route="planner_agent",
                            plan_id=plan.plan_id,
                        ).model_dump(mode="json"),
                    ],
                }
            return {
                "next_action": "stop",
                "workflow_stage": "ready_for_review",
                "run_status": "completed",
            }

        ready = next_ready_step(plan)
        if ready is None:
            unfinished = [step for step in plan.steps if step.status != "completed"]
            if unfinished:
                return {
                    "next_action": "stop",
                    "workflow_stage": "ready_for_review",
                    "run_status": "completed",
                }
            return {"next_action": "persist", "active_step_id": None}

        revised = update_plan_step_status(plan, ready.id, "running")
        needs_tools = bool(planned_tool_calls(ready)) and ready.id not in state.get(
            "tool_steps_completed", []
        )
        return {
            "execution_plan": revised.model_dump(mode="json"),
            "active_step_id": ready.id,
            "next_action": "tools" if needs_tools else ready.agent_id,
            "workflow_stage": f"executing:{ready.id}",
        }

    async def understand_scenario(self, state: ModellingGraphState) -> NodeResult:
        started = perf_counter()
        persisted = [SourceMetadata.model_validate(item) for item in state.get("sources", [])]
        inline = extract_source_metadata(state.get("user_message") or "")
        uploaded = deduplicate_sources([*persisted, *inline])
        await self.emit("agent.started", self.requirement_agent.identifier)
        brief = await self.requirement_agent.run(
            RequirementAgentInput(
                user_message=state.get("user_message") or "",
                recent_conversation=state.get("conversation_messages", []),
                existing_brief=state.get("modelling_brief"),
                uploaded_file_names=[source.name for source in uploaded],
            )
        )
        await self.emit(
            "agent.completed",
            self.requirement_agent.identifier,
            confidence=brief.confidence,
            execution_mode=brief.execution_mode,
        )
        return {
            "modelling_brief": brief.model_dump(mode="json"),
            "execution_plan": complete_plan_step(state, self.requirement_agent.identifier),
            "sources": [source.model_dump(mode="json") for source in uploaded],
            "workflow_stage": "scenario_understood",
            "agent_trace": append_trace(
                state,
                self.requirement_agent.identifier,
                started,
                brief.confidence,
                brief.execution_mode,
            ),
        }

    async def analyse_sources(self, state: ModellingGraphState) -> NodeResult:
        started = perf_counter()
        brief = ModellingBrief.model_validate(state["modelling_brief"])
        supplied_sources = [
            SourceMetadata.model_validate(item) for item in state.get("sources", [])
        ]
        await self.emit("agent.started", self.source_analysis_agent.identifier)
        analysis = await self.source_analysis_agent.run(
            SourceAnalysisAgentInput(
                modelling_brief=brief,
                uploaded_sources=supplied_sources,
                prior_analysis=state.get("source_analysis"),
                tool_results=state.get("tool_results", {}),
            )
        )
        await self.emit(
            "agent.completed",
            self.source_analysis_agent.identifier,
            confidence=analysis.confidence,
            execution_mode=analysis.execution_mode,
        )
        return {
            "source_analysis": analysis.model_dump(mode="json"),
            "execution_plan": complete_plan_step(state, self.source_analysis_agent.identifier),
            "workflow_stage": "sources_analysed",
            "agent_trace": append_trace(
                state,
                self.source_analysis_agent.identifier,
                started,
                analysis.confidence,
                analysis.execution_mode,
            ),
        }

    async def design_model(self, state: ModellingGraphState) -> NodeResult:
        started = perf_counter()
        reworking = state.get("rework_target") == "model_design"
        await self.emit("agent.started", self.model_design_agent.identifier)
        proposal = await self.model_design_agent.run(
            ModelDesignAgentInput(
                modelling_brief=ModellingBrief.model_validate(state["modelling_brief"]),
                source_analysis=SourceAnalysis.model_validate(state["source_analysis"]),
                existing_model=state.get("logical_model"),
                validation_findings=validation_findings(state) if reworking else [],
            )
        )
        await self.emit(
            "agent.completed",
            self.model_design_agent.identifier,
            confidence=proposal.confidence,
            execution_mode=proposal.execution_mode,
        )
        return {
            "logical_model": proposal.model_dump(mode="json"),
            "execution_plan": complete_plan_step(state, self.model_design_agent.identifier),
            "workflow_stage": "model_designed",
            "rework_count": state.get("rework_count", 0) + (1 if reworking else 0),
            "rework_target": None,
            "agent_trace": append_trace(
                state,
                self.model_design_agent.identifier,
                started,
                proposal.confidence,
                proposal.execution_mode,
            ),
        }

    async def create_mappings_and_rules(self, state: ModellingGraphState) -> NodeResult:
        started = perf_counter()
        reworking = state.get("rework_target") == "mapping_dq"
        await self.emit("agent.started", self.mapping_dq_agent.identifier)
        proposal = await self.mapping_dq_agent.run(
            MappingDQAgentInput(
                modelling_brief=ModellingBrief.model_validate(state["modelling_brief"]),
                source_analysis=SourceAnalysis.model_validate(state["source_analysis"]),
                logical_model=model_proposal(state),
                validation_findings=validation_findings(state) if reworking else [],
            )
        )
        await self.emit(
            "agent.completed",
            self.mapping_dq_agent.identifier,
            confidence=proposal.confidence,
            execution_mode=proposal.execution_mode,
        )
        return {
            "mapping_dq": proposal.model_dump(mode="json"),
            "execution_plan": complete_plan_step(state, self.mapping_dq_agent.identifier),
            "mappings": [item.model_dump(mode="json") for item in proposal.mappings],
            "dq_rules": [item.model_dump(mode="json") for item in proposal.dq_rules],
            "workflow_stage": "mappings_and_dq_generated",
            "rework_count": state.get("rework_count", 0) + (1 if reworking else 0),
            "rework_target": None,
            "agent_trace": append_trace(
                state,
                self.mapping_dq_agent.identifier,
                started,
                proposal.confidence,
                proposal.execution_mode,
            ),
        }

    async def validate(self, state: ModellingGraphState) -> NodeResult:
        started = perf_counter()
        await self.emit("agent.started", self.validation_agent.identifier)
        report = await self.validation_agent.run(
            ValidationAgentInput(
                modelling_brief=ModellingBrief.model_validate(state["modelling_brief"]),
                source_analysis=SourceAnalysis.model_validate(state["source_analysis"]),
                logical_model=model_proposal(state),
                mapping_dq=MappingDQProposal.model_validate(state["mapping_dq"]),
            )
        )
        await self.emit(
            "agent.completed",
            self.validation_agent.identifier,
            confidence=report.confidence,
            execution_mode=report.execution_mode,
        )
        return {
            "validation_report": report.model_dump(mode="json"),
            "execution_plan": complete_plan_step(state, self.validation_agent.identifier),
            "validation_findings": [finding.model_dump(mode="json") for finding in report.findings],
            "rework_target": report.rework_target if report.requires_rework else None,
            "workflow_stage": "validated",
            "agent_trace": append_trace(
                state,
                self.validation_agent.identifier,
                started,
                report.confidence,
                report.execution_mode,
            ),
        }

    async def persist_version(self, state: ModellingGraphState) -> NodeResult:
        report_data = state.get("validation_report")
        if not report_data:
            return {"workflow_stage": "ready_for_review", "run_status": "completed"}
        report = ValidationReport.model_validate(report_data)
        return {
            "workflow_stage": "ready_for_review" if report.findings else "completed",
            "run_status": "completed",
        }

    async def supervise_validation(self, state: ModellingGraphState) -> NodeResult:
        report = ValidationReport.model_validate(state["validation_report"])
        plan = ExecutionPlan.model_validate(state["execution_plan"])
        route = "complete"
        reason = "Validation completed without an automatically repairable defect."
        if report.requires_rework and state.get("rework_count", 0) < plan.iteration_budget:
            if report.rework_target in {"model_design", "mapping_dq"}:
                route = report.rework_target
                reason = (
                    f"Validation selected {report.rework_target} for bounded corrective "
                    "re-planning."
                )
        elif report.requires_rework:
            reason = "The re-planning budget is exhausted; remaining findings require review."
        revised = revise_plan_status(plan, route)
        return {
            "execution_plan": revised.model_dump(mode="json"),
            "supervisor_route": "replan" if route != "complete" else "dispatch",
            "replanning_reason": reason if route != "complete" else None,
            "decision_trace": [
                *state.get("decision_trace", []),
                DecisionRecord(
                    decision="validation_observed",
                    reason=reason,
                    selected_route=route,
                    plan_id=plan.plan_id,
                ).model_dump(mode="json"),
            ],
            "workflow_stage": "replanning" if route != "complete" else "supervision_completed",
        }

    async def present_response(self, state: ModellingGraphState) -> NodeResult:
        brief_data = state.get("modelling_brief")
        if brief_data:
            brief = ModellingBrief.model_validate(brief_data)
            if not brief.can_proceed or any(item.blocking for item in brief.blocking_questions):
                return {"workflow_stage": "awaiting_clarification", "run_status": "completed"}
        source_data = state.get("source_analysis")
        if source_data and not SourceAnalysis.model_validate(source_data).can_proceed:
            return {"workflow_stage": "awaiting_sources", "run_status": "completed"}
        return {"run_status": "completed"}

    def _build_graph(self) -> Any:
        graph = StateGraph(ModellingGraphState)
        graph.add_node("load_project_state", self.load_project_state)
        graph.add_node("planner_agent", self.plan_execution)
        graph.add_node("plan_approval", self.request_plan_approval)
        graph.add_node("requirement_agent", self.understand_scenario)
        graph.add_node("plan_dispatch", self.dispatch_plan)
        graph.add_node("tool_executor", self.execute_planned_tools)
        graph.add_node("source_analysis_agent", self.analyse_sources)
        graph.add_node("model_design_agent", self.design_model)
        graph.add_node("mapping_dq_agent", self.create_mappings_and_rules)
        graph.add_node("validation_agent", self.validate)
        graph.add_node("reactive_supervisor", self.supervise_validation)
        graph.add_node("persist_version", self.persist_version)
        graph.add_node("present_response", self.present_response)
        graph.add_edge(START, "load_project_state")
        graph.add_edge("load_project_state", "planner_agent")
        graph.add_conditional_edges(
            "planner_agent",
            route_after_planning,
            {"approval": "plan_approval", "dispatch": "plan_dispatch"},
        )
        graph.add_conditional_edges(
            "plan_approval",
            route_after_approval,
            {"dispatch": "plan_dispatch", "stop": "present_response"},
        )
        graph.add_conditional_edges(
            "plan_dispatch",
            route_after_dispatch,
            {
                "replan": "planner_agent",
                "tools": "tool_executor",
                "requirement_agent": "requirement_agent",
                "source_analysis_agent": "source_analysis_agent",
                "model_design_agent": "model_design_agent",
                "mapping_dq_agent": "mapping_dq_agent",
                "validation_agent": "validation_agent",
                "persist": "persist_version",
                "stop": "present_response",
            },
        )
        graph.add_edge("tool_executor", "plan_dispatch")
        graph.add_conditional_edges(
            "requirement_agent",
            route_after_requirements,
            {"continue": "plan_dispatch", "wait": "present_response"},
        )
        graph.add_conditional_edges(
            "source_analysis_agent",
            route_after_sources,
            {"continue": "plan_dispatch", "wait": "present_response"},
        )
        graph.add_edge("model_design_agent", "plan_dispatch")
        graph.add_edge("mapping_dq_agent", "plan_dispatch")
        graph.add_edge("validation_agent", "reactive_supervisor")
        graph.add_conditional_edges(
            "reactive_supervisor",
            route_after_supervision,
            {
                "replan": "planner_agent",
                "dispatch": "plan_dispatch",
            },
        )
        graph.add_edge("persist_version", "present_response")
        graph.add_edge("present_response", END)
        return graph

    async def emit(
        self,
        event: str,
        agent_id: str,
        *,
        confidence: float | None = None,
        execution_mode: str | None = None,
    ) -> None:
        await self.events.put(
            {
                "event": event,
                "agent_id": agent_id,
                "confidence": confidence,
                "execution_mode": execution_mode,
            }
        )


def route_after_requirements(state: ModellingGraphState) -> Literal["continue", "wait"]:
    brief = ModellingBrief.model_validate(state["modelling_brief"])
    blocking = any(question.blocking for question in brief.blocking_questions)
    return "continue" if brief.can_proceed and not blocking else "wait"


def route_after_planning(
    state: ModellingGraphState,
) -> Literal["approval", "dispatch"]:
    if state.get("approval_status") == "required":
        return "approval"
    return "dispatch"


def route_after_approval(
    state: ModellingGraphState,
) -> Literal["dispatch", "stop"]:
    if state.get("approval_status") != "approved":
        return "stop"
    return "dispatch"


def route_after_dispatch(
    state: ModellingGraphState,
) -> Literal[
    "replan",
    "tools",
    "requirement_agent",
    "source_analysis_agent",
    "model_design_agent",
    "mapping_dq_agent",
    "validation_agent",
    "persist",
    "stop",
]:
    action = state.get("next_action")
    allowed = {
        "replan",
        "tools",
        "requirement_agent",
        "source_analysis_agent",
        "model_design_agent",
        "mapping_dq_agent",
        "validation_agent",
        "persist",
        "stop",
    }
    return action if action in allowed else "stop"  # type: ignore[return-value]


def route_from_entry(
    state: ModellingGraphState,
) -> Literal["requirements", "sources", "model", "mapping_dq", "validation"]:
    target = state.get("regeneration_target")
    if target == "source_preview" and state.get("modelling_brief"):
        return "sources"
    if target == "logical_model" and state.get("source_analysis"):
        return "model"
    if target in {"mappings", "dq_rules"} and state.get("logical_model"):
        return "mapping_dq"
    if target == "validation" and state.get("mapping_dq"):
        return "validation"
    return "requirements"


def route_after_sources(state: ModellingGraphState) -> Literal["continue", "wait"]:
    analysis = SourceAnalysis.model_validate(state["source_analysis"])
    return "continue" if analysis.can_proceed else "wait"


def route_after_supervision(
    state: ModellingGraphState,
) -> Literal["replan", "dispatch"]:
    return "replan" if state.get("supervisor_route") == "replan" else "dispatch"


def extract_source_metadata(message: str) -> list[SourceMetadata]:
    pattern = re.compile(
        r"^--- (?P<name>.+?) \([^\n]+\) ---\n(?P<content>.*?)(?=\n\n--- |\Z)",
        re.MULTILINE | re.DOTALL,
    )
    return [
        SourceMetadata(
            name=match.group("name"),
            format=match.group("name").rsplit(".", 1)[-1].lower(),
            content_excerpt=match.group("content")[:20_000],
        )
        for match in pattern.finditer(message)
    ]


def deduplicate_sources(sources: list[SourceMetadata]) -> list[SourceMetadata]:
    return list({source.name: source for source in sources}.values())


def detect_regeneration_target(message: str) -> str | None:
    marker = re.search(
        r"\[regenerate:(source_preview|logical_model|mappings|dq_rules|validation)\]",
        message,
    )
    return marker.group(1) if marker else None


def append_trace(
    state: ModellingGraphState,
    agent_id: str,
    started: float,
    confidence: float,
    execution_mode: str,
) -> list[dict[str, Any]]:
    return [
        *state.get("agent_trace", []),
        {
            "agent_id": agent_id,
            "status": "completed",
            "confidence": confidence,
            "duration_ms": round((perf_counter() - started) * 1000, 2),
            "execution_mode": execution_mode,
        },
    ]


def validation_findings(state: ModellingGraphState) -> list[dict[str, Any]]:
    return state.get("validation_findings", [])


def model_proposal(state: ModellingGraphState) -> LogicalModelProposal:
    return LogicalModelProposal.model_validate(state["logical_model"])


def validate_plan(
    plan: ExecutionPlan,
    capabilities: CapabilityRegistry,
    available_tools: set[str],
) -> None:
    if not plan.steps:
        raise ValueError("The planner returned no executable steps")
    identifiers = [step.id for step in plan.steps]
    if len(identifiers) != len(set(identifiers)):
        raise ValueError("Plan step identifiers must be unique")
    known_ids = set(identifiers)
    supported_agents = {
        "requirement_agent",
        "source_analysis_agent",
        "model_design_agent",
        "mapping_dq_agent",
        "validation_agent",
    }
    for step in plan.steps:
        if step.agent_id not in supported_agents:
            raise ValueError(f"The plan selected an unsupported agent: {step.agent_id}")
        missing_dependencies = set(step.depends_on) - known_ids
        if missing_dependencies:
            raise ValueError(
                f"Step {step.id} has unknown dependencies: {', '.join(missing_dependencies)}"
            )
        if step.id in step.depends_on:
            raise ValueError(f"Step {step.id} cannot depend on itself")
        skill = capabilities.get(step.skill_id)
        if skill.agent_id != step.agent_id:
            raise ValueError(f"Skill {skill.id} belongs to {skill.agent_id}, not {step.agent_id}")
        allowed = set(skill.allowed_tools)
        selected_tools = [*step.required_tools, *(call.tool_name for call in step.tool_calls)]
        for tool in selected_tools:
            if tool not in available_tools:
                raise ValueError(f"The planner selected an unavailable tool: {tool}")
            if tool not in allowed and not (tool.startswith("mcp.") and "mcp.*" in allowed):
                raise ValueError(f"Skill {skill.id} does not allow tool {tool}")
    assert_acyclic_plan(plan)


def revise_plan_status(plan: ExecutionPlan, route: str) -> ExecutionPlan:
    target_agent = {
        "model_design": "model_design_agent",
        "mapping_dq": "mapping_dq_agent",
    }.get(route)
    steps = []
    for step in plan.steps:
        status = step.status
        if route == "complete":
            status = "completed"
        elif step.agent_id == target_agent:
            status = "pending"
        steps.append(step.model_copy(update={"status": status}))
    return plan.model_copy(update={"steps": steps})


def complete_plan_step(state: ModellingGraphState, agent_id: str) -> dict[str, Any]:
    plan = ExecutionPlan.model_validate(state["execution_plan"])
    active_step_id = state.get("active_step_id")
    steps = [
        step.model_copy(update={"status": "completed"})
        if step.agent_id == agent_id and (active_step_id is None or step.id == active_step_id)
        else step
        for step in plan.steps
    ]
    return plan.model_copy(update={"steps": steps}).model_dump(mode="json")


def assert_acyclic_plan(plan: ExecutionPlan) -> None:
    dependencies = {step.id: set(step.depends_on) for step in plan.steps}
    resolved: set[str] = set()
    while remaining := {key for key in dependencies if key not in resolved}:
        ready = {key for key in remaining if dependencies[key] <= resolved}
        if not ready:
            raise ValueError("Plan dependencies contain a cycle")
        resolved.update(ready)


def planned_tool_calls(step: PlanStep) -> list[PlannedToolCall]:
    calls = list(step.tool_calls)
    explicit_names = {call.tool_name for call in calls}
    calls.extend(
        PlannedToolCall(tool_name=name)
        for name in step.required_tools
        if name not in explicit_names
    )
    return calls


def step_requires_approval(step: PlanStep, capabilities: CapabilityRegistry) -> bool:
    skill = capabilities.get(step.skill_id)
    return (
        step.approval_required
        or skill.requires_human_approval
        or any(call.tool_name.startswith("mcp.") for call in planned_tool_calls(step))
    )


def plan_step(plan: ExecutionPlan, step_id: str | None) -> PlanStep:
    step = next((item for item in plan.steps if item.id == step_id), None)
    if step is None:
        raise ValueError("The execution plan has no active step")
    return step


def update_plan_step_status(
    plan: ExecutionPlan,
    step_id: str,
    status: Literal["pending", "running", "completed", "blocked", "failed"],
) -> ExecutionPlan:
    return plan.model_copy(
        update={
            "steps": [
                step.model_copy(update={"status": status}) if step.id == step_id else step
                for step in plan.steps
            ]
        }
    )


def next_ready_step(plan: ExecutionPlan) -> PlanStep | None:
    completed = {step.id for step in plan.steps if step.status == "completed"}
    return next(
        (
            step
            for step in plan.steps
            if step.status in {"pending", "running"} and set(step.depends_on) <= completed
        ),
        None,
    )


def reconcile_plan_with_state(
    plan: ExecutionPlan, state: ModellingGraphState
) -> ExecutionPlan:
    prior_data = state.get("execution_plan")
    prior = ExecutionPlan.model_validate(prior_data) if prior_data else None
    verified_outputs = {
        "requirement_agent": bool(state.get("modelling_brief")),
        "source_analysis_agent": bool(state.get("source_analysis")),
        "model_design_agent": bool(state.get("logical_model")),
        "mapping_dq_agent": bool(state.get("mapping_dq")),
        "validation_agent": bool(state.get("validation_report")),
    }
    completed_agents = {
        step.agent_id
        for step in plan.steps
        if step.status == "completed" and verified_outputs.get(step.agent_id, False)
    }
    if prior:
        completed_agents.update(
            step.agent_id
            for step in prior.steps
            if step.status == "completed" and verified_outputs.get(step.agent_id, False)
        )
    target = state.get("regeneration_target")
    if state.get("replanning_reason"):
        target = state.get("rework_target") or agent_rework_target(
            prior, state.get("active_step_id")
        )
    order = [
        "requirement_agent",
        "source_analysis_agent",
        "model_design_agent",
        "mapping_dq_agent",
        "validation_agent",
    ]
    target_agents = {
        "source_preview": "source_analysis_agent",
        "logical_model": "model_design_agent",
        "mappings": "mapping_dq_agent",
        "dq_rules": "mapping_dq_agent",
        "validation": "validation_agent",
        "model_design": "model_design_agent",
        "mapping_dq": "mapping_dq_agent",
    }
    target_agent = target_agents.get(target) if target is not None else None
    if target_agent in order:
        cutoff = order.index(target_agent)
        completed_agents.update(order[:cutoff])
        completed_agents.difference_update(order[cutoff:])
    return plan.model_copy(
        update={
            "steps": [
                step.model_copy(
                    update={
                        "status": "completed"
                        if step.agent_id in completed_agents
                        else "pending"
                    }
                )
                for step in plan.steps
            ]
        }
    )


def agent_rework_target(plan: ExecutionPlan | None, step_id: str | None) -> str | None:
    if plan is None:
        return None
    step = next((item for item in plan.steps if item.id == step_id), None)
    return step.agent_id if step else None


def standard_plan_is_sufficient(state: ModellingGraphState) -> bool:
    message = (state.get("user_message") or "").lower()
    return (
        not state.get("regeneration_target")
        and not state.get("replanning_reason")
        and not state.get("approval_status") == "required"
        and "mcp." not in message
        and "external catalog" not in message
    )


def planning_context(state: ModellingGraphState) -> dict[str, Any]:
    keys = (
        "project_id",
        "workflow_stage",
        "modelling_brief",
        "source_analysis",
        "logical_model",
        "mapping_dq",
        "validation_report",
        "validation_findings",
        "regeneration_target",
        "replanning_reason",
        "active_step_id",
        "execution_plan",
        "tool_results",
    )
    context = {key: state.get(key) for key in keys if state.get(key) is not None}
    context["sources"] = [
        {
            "name": source.get("name"),
            "format": source.get("format"),
            "profile": source.get("profile", {}),
        }
        for source in state.get("sources", [])
        if isinstance(source, dict)
    ]
    context["recent_tool_trace"] = state.get("tool_trace", [])[-8:]
    context["recent_decisions"] = state.get("decision_trace", [])[-8:]
    return context
