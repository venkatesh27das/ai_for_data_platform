import re
from asyncio import Queue
from time import perf_counter
from typing import Any, Literal

from langgraph.graph import END, START, StateGraph

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
from app.llm.base import LLMProvider
from app.orchestration.state import ModellingGraphState

NodeResult = dict[str, Any]


class MasterOrchestrator:
    """Deterministic LangGraph coordinator for provider-independent specialist agents."""

    def __init__(self, provider: LLMProvider, agent_timeout_seconds: float = 45) -> None:
        self.events: Queue[dict[str, Any]] = Queue()
        self.requirement_agent = RequirementAgent(provider, agent_timeout_seconds)
        self.source_analysis_agent = SourceAnalysisAgent(provider, agent_timeout_seconds)
        self.model_design_agent = ModelDesignAgent(provider, agent_timeout_seconds)
        self.mapping_dq_agent = MappingDQAgent(provider, agent_timeout_seconds)
        self.validation_agent = ValidationAgent(provider, agent_timeout_seconds)
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
        report = ValidationReport.model_validate(state["validation_report"])
        return {
            "workflow_stage": "ready_for_review" if report.findings else "completed",
            "run_status": "completed",
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
        graph.add_node("requirement_agent", self.understand_scenario)
        graph.add_node("source_analysis_agent", self.analyse_sources)
        graph.add_node("model_design_agent", self.design_model)
        graph.add_node("mapping_dq_agent", self.create_mappings_and_rules)
        graph.add_node("validation_agent", self.validate)
        graph.add_node("persist_version", self.persist_version)
        graph.add_node("present_response", self.present_response)
        graph.add_edge(START, "load_project_state")
        graph.add_conditional_edges(
            "load_project_state",
            route_from_entry,
            {
                "requirements": "requirement_agent",
                "sources": "source_analysis_agent",
                "model": "model_design_agent",
                "mapping_dq": "mapping_dq_agent",
                "validation": "validation_agent",
            },
        )
        graph.add_conditional_edges(
            "requirement_agent",
            route_after_requirements,
            {"continue": "source_analysis_agent", "wait": "present_response"},
        )
        graph.add_conditional_edges(
            "source_analysis_agent",
            route_after_sources,
            {"continue": "model_design_agent", "wait": "present_response"},
        )
        graph.add_edge("model_design_agent", "mapping_dq_agent")
        graph.add_edge("mapping_dq_agent", "validation_agent")
        graph.add_conditional_edges(
            "validation_agent",
            route_after_validation,
            {
                "model_design": "model_design_agent",
                "mapping_dq": "mapping_dq_agent",
                "complete": "persist_version",
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


def route_after_validation(
    state: ModellingGraphState,
) -> Literal["model_design", "mapping_dq", "complete"]:
    report = ValidationReport.model_validate(state["validation_report"])
    if report.requires_rework and state.get("rework_count", 0) < 1:
        if report.rework_target in {"model_design", "mapping_dq"}:
            return report.rework_target
    return "complete"


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
