import sqlite3
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, TypeVar

import pytest
from pydantic import BaseModel

from app.autonomy.capabilities import CapabilityRegistry
from app.autonomy.tools import ToolExecutor, ToolRegistry
from app.services.workflows import WorkflowService

T = TypeVar("T", bound=BaseModel)


class ScriptedProvider:
    name = "fake"
    model = "fake-model"

    def __init__(self, *, blocking: bool = False) -> None:
        self.blocking = blocking
        self.structured_calls: list[str] = []

    async def health_check(self) -> dict[str, Any]:
        return {"ok": True}

    async def list_models(self) -> list[str]:
        return [self.model]

    async def generate_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> str:
        return "Workflow ready"

    async def generate_structured(
        self,
        messages: list[dict[str, Any]],
        response_model: type[T],
        *,
        temperature: float | None = None,
    ) -> T:
        self.structured_calls.append(response_model.__name__)
        return response_model.model_validate(self.payload(response_model.__name__))

    async def stream_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> AsyncIterator[str]:
        assert messages[0]["role"] == "system"
        for token in ["Workflow ", "ready"]:
            yield token

    async def invoke_tools(
        self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]
    ) -> dict[str, Any]:
        return {}

    def payload(self, name: str) -> dict[str, Any]:
        common = {
            "agent_version": "1.0",
            "confidence": 0.9,
            "evidence": ["User supplied scenario"],
            "assumptions": [],
        }
        if name == "ExecutionPlan":
            return {
                **common,
                "agent_id": "planner_agent",
                "plan_id": "test-plan",
                "objective": "Analyse sales",
                "rationale": "Run the bounded modelling workflow.",
                "requires_human_approval": False,
                "iteration_budget": 1,
                "tool_call_budget": 4,
                "steps": [
                    {
                        "id": "requirements",
                        "title": "Confirm requirements",
                        "agent_id": "requirement_agent",
                        "skill_id": "requirements.clarification",
                    },
                    {
                        "id": "sources",
                        "title": "Analyse sources",
                        "agent_id": "source_analysis_agent",
                        "skill_id": "sources.evidence-analysis",
                        "depends_on": ["requirements"],
                    },
                    {
                        "id": "model",
                        "title": "Design model",
                        "agent_id": "model_design_agent",
                        "skill_id": "models.dimensional-design",
                        "depends_on": ["sources"],
                    },
                    {
                        "id": "mapping_dq",
                        "title": "Create mappings and DQ",
                        "agent_id": "mapping_dq_agent",
                        "skill_id": "governance.mapping-dq",
                        "depends_on": ["model"],
                    },
                    {
                        "id": "validation",
                        "title": "Validate",
                        "agent_id": "validation_agent",
                        "skill_id": "governance.model-validation",
                        "depends_on": ["mapping_dq"],
                    },
                ],
            }
        if name == "ModellingBrief":
            return {
                **common,
                "agent_id": "requirement_agent",
                "domain": "Sales",
                "objective": "Analyse sales",
                "business_process": "Order to cash",
                "consumption": ["BI"],
                "kpis": ["Net sales"],
                "source_systems": ["SAP"],
                "source_objects": ["VBAK", "VBAP"],
                "requested_outputs": ["Logical model", "Mappings", "DQ rules"],
                "candidate_grain": "One row per sales order line",
                "blocking_questions": (
                    [
                        {
                            "question": "What is the fact grain?",
                            "rationale": "The grain is required.",
                            "blocking": True,
                        }
                    ]
                    if self.blocking
                    else []
                ),
                "can_proceed": not self.blocking,
            }
        if name == "SourceAnalysis":
            return {
                **common,
                "agent_id": "source_analysis_agent",
                "sources": [
                    {
                        "table_name": "VBAP",
                        "role": "Transaction",
                        "column_count": 2,
                        "columns": ["VBELN", "POSNR"],
                        "candidate_keys": ["VBELN + POSNR"],
                        "description": "Sales order items",
                        "evidence": ["Supplied metadata"],
                    }
                ],
                "relationships": [],
                "business_entities": ["Sales order line"],
                "warnings": [],
                "can_proceed": True,
            }
        if name == "LogicalModelProposal":
            return {
                **common,
                "agent_id": "model_design_agent",
                "model_name": "Sales Model",
                "fact_grain": "One row per sales order line",
                "entities": [
                    {
                        "id": "fact_sales",
                        "name": "FactSales",
                        "kind": "fact",
                        "description": "Sales fact",
                        "grain": "One row per sales order line",
                        "attributes": [
                            {
                                "name": "SalesKey",
                                "data_type": "BIGINT",
                                "key_type": "PK",
                                "source_evidence": ["VBAP"],
                            }
                        ],
                    }
                ],
                "relationships": [],
                "measures": ["NetSales"],
                "open_decisions": [],
            }
        if name == "MappingDQProposal":
            return {
                **common,
                "agent_id": "mapping_dq_agent",
                "mappings": [
                    {
                        "source": "VBAP.VBELN",
                        "target": "FactSales.SalesKey",
                        "transformation": "Direct",
                        "transformation_type": "Direct",
                        "confidence": "High",
                        "evidence": ["Supplied metadata"],
                        "status": "Approved",
                        "review_reason": "",
                    }
                ],
                "dq_rules": [
                    {
                        "target": "FactSales.SalesKey",
                        "rule_type": "Not null",
                        "expression": "SalesKey IS NOT NULL",
                        "severity": "Error",
                        "rationale": "Fact key is required",
                        "confidence": "High",
                        "status": "Ready",
                    }
                ],
                "review_items": [],
            }
        if name == "ValidationReport":
            return {
                **common,
                "agent_id": "validation_agent",
                "passed": True,
                "requires_rework": False,
                "rework_target": None,
                "findings": [],
                "summary": "Model is internally consistent.",
            }
        raise AssertionError(f"Unexpected model: {name}")


class FailingStructuredProvider(ScriptedProvider):
    async def generate_structured(
        self,
        messages: list[dict[str, Any]],
        response_model: type[T],
        *,
        temperature: float | None = None,
    ) -> T:
        self.structured_calls.append(response_model.__name__)
        raise RuntimeError("Local structured generation unavailable")


class CrashingOnceProvider(ScriptedProvider):
    def __init__(self) -> None:
        super().__init__()
        self.crashed = False

    async def generate_structured(
        self,
        messages: list[dict[str, Any]],
        response_model: type[T],
        *,
        temperature: float | None = None,
    ) -> T:
        if not self.crashed:
            self.crashed = True
            raise KeyError("unexpected agent failure")
        return await super().generate_structured(
            messages,
            response_model,
            temperature=temperature,
        )


class ApprovalProvider(ScriptedProvider):
    def payload(self, name: str) -> dict[str, Any]:
        payload = super().payload(name)
        if name == "ExecutionPlan":
            source_step = payload["steps"][1]
            source_step["skill_id"] = "sources.external-metadata"
            source_step["required_tools"] = ["mcp.catalog.describe_table"]
            source_step["approval_required"] = True
            payload["requires_human_approval"] = True
            payload["approval_reason"] = "External catalog access requires approval."
        return payload


class WorkflowFakeMCPClient:
    allowlist = {"mcp.catalog.describe_table"}

    async def call_tool(
        self, server_name: str, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        return {"server": server_name, "tool": tool_name, "columns": ["VBELN", "POSNR"]}


async def test_master_orchestrator_runs_all_specialist_agents() -> None:
    provider = ScriptedProvider()
    workflow = WorkflowService(provider)  # type: ignore[arg-type]
    events = [
        event
        async for event in workflow.run(
            project_id="project-1",
            user_message="Build a sales model from VBAP at order-line grain",
            conversation=[{"role": "user", "content": "Build a sales model"}],
        )
    ]

    assert provider.structured_calls == [
        "ExecutionPlan",
        "ModellingBrief",
        "SourceAnalysis",
        "LogicalModelProposal",
        "MappingDQProposal",
        "ValidationReport",
    ]
    completed = events[-1]
    assert completed["event"] == "workflow.completed"
    assert completed["state"]["workflow_stage"] == "completed"
    assert completed["state"]["logical_model"]["model_name"] == "Sales Model"

    tokens = [
        token
        async for token in workflow.stream_response(
            completed["state"], [{"role": "user", "content": "Sales"}]
        )
    ]
    assert "".join(tokens) == "Workflow ready"


async def test_master_orchestrator_stops_for_blocking_questions() -> None:
    provider = ScriptedProvider(blocking=True)
    workflow = WorkflowService(provider)  # type: ignore[arg-type]
    events = [
        event
        async for event in workflow.run(
            project_id="project-2",
            user_message="Build a model",
            conversation=[{"role": "user", "content": "Build a model"}],
        )
    ]

    assert provider.structured_calls == ["ExecutionPlan", "ModellingBrief"]
    assert events[-1]["state"]["workflow_stage"] == "awaiting_clarification"
    assert "logical_model" not in events[-1]["state"]


async def test_all_agents_have_conservative_fallbacks() -> None:
    provider = FailingStructuredProvider()
    workflow = WorkflowService(provider)  # type: ignore[arg-type]
    message = """Build a sales model at one row per sales order line.

Attached source metadata:
--- sales.ddl (100 B) ---
CREATE TABLE VBAP (VBELN STRING, POSNR STRING, PRIMARY KEY (VBELN, POSNR));"""
    events = [
        event
        async for event in workflow.run(
            project_id="project-fallback",
            user_message=message,
            conversation=[{"role": "user", "content": message}],
        )
    ]

    assert provider.structured_calls == [
        "ExecutionPlan",
        "ModellingBrief",
        "SourceAnalysis",
        "LogicalModelProposal",
        "MappingDQProposal",
        "ValidationReport",
    ]
    state = events[-1]["state"]
    assert state["workflow_stage"] in {"completed", "ready_for_review"}
    assert state["source_analysis"]["sources"][0]["table_name"] == "VBAP"
    assert state["logical_model"]["entities"][0]["kind"] == "fact"
    assert state["mapping_dq"]["dq_rules"]
    assert state["modelling_brief"]["execution_mode"] == "fallback"


async def test_workflow_writes_node_checkpoints(tmp_path: Path) -> None:
    checkpoint_path = tmp_path / "workflow.db"
    workflow = WorkflowService(
        ScriptedProvider(),  # type: ignore[arg-type]
        checkpoint_path=checkpoint_path,
    )
    events = [
        event
        async for event in workflow.run(
            project_id="durable-project",
            user_message="Build a sales model from VBAP at one row per order line",
            conversation=[],
        )
    ]

    assert events[-1]["event"] == "workflow.completed"
    with sqlite3.connect(checkpoint_path) as connection:
        checkpoint_count = connection.execute("SELECT COUNT(*) FROM checkpoints").fetchone()
    assert checkpoint_count is not None
    assert checkpoint_count[0] >= 5


async def test_targeted_model_regeneration_skips_unchanged_upstream_agents() -> None:
    provider = ScriptedProvider()
    workflow = WorkflowService(provider)  # type: ignore[arg-type]
    first = [
        event
        async for event in workflow.run(
            project_id="regeneration-project",
            user_message="Build a sales model from VBAP at one row per order line",
            conversation=[],
        )
    ][-1]["state"]
    provider.structured_calls.clear()

    regenerated = [
        event
        async for event in workflow.run(
            project_id="regeneration-project",
            user_message="[regenerate:logical_model] Apply the latest review feedback.",
            conversation=[],
            existing_state=first,
        )
    ]

    assert provider.structured_calls == [
        "ExecutionPlan",
        "LogicalModelProposal",
        "MappingDQProposal",
        "ValidationReport",
    ]
    assert regenerated[-1]["state"]["regeneration_target"] == "logical_model"


async def test_failed_node_resumes_from_durable_checkpoint(tmp_path: Path) -> None:
    provider = CrashingOnceProvider()
    workflow = WorkflowService(  # type: ignore[arg-type]
        provider,
        checkpoint_path=tmp_path / "resume.db",
    )
    with pytest.raises(KeyError):
        _ = [
            event
            async for event in workflow.run(
                project_id="resume-project",
                user_message="Build a sales model at one row per order line",
                conversation=[],
            )
        ]

    resumed = [
        event
        async for event in workflow.run(
            project_id="resume-project",
            user_message="Retry",
            conversation=[],
            resume_from_checkpoint=True,
        )
    ]

    assert resumed[-1]["event"] == "workflow.completed"
    assert resumed[-1]["state"]["logical_model"]["model_name"] == "Sales Model"


async def test_external_tool_plan_interrupts_for_approval_and_resumes(tmp_path: Path) -> None:
    capabilities = CapabilityRegistry()
    executor = ToolExecutor(
        ToolRegistry(WorkflowFakeMCPClient()),  # type: ignore[arg-type]
        capabilities,
    )
    workflow = WorkflowService(  # type: ignore[arg-type]
        ApprovalProvider(),
        checkpoint_path=tmp_path / "approval.db",
        capabilities=capabilities,
        tool_executor=executor,
    )
    interrupted = [
        event
        async for event in workflow.run(
            project_id="approval-project",
            user_message="Build a sales model at one row per order line",
            conversation=[],
        )
    ]
    assert interrupted[-1]["event"] == "workflow.interrupted"
    assert interrupted[-1]["interrupt"]["type"] == "plan_approval"

    resumed = [
        event
        async for event in workflow.run(
            project_id="approval-project",
            user_message="approve plan",
            conversation=[],
            approval_decision="approved",
        )
    ]
    state = resumed[-1]["state"]
    assert resumed[-1]["event"] == "workflow.completed"
    assert state["approval_status"] == "approved"
    assert state["tool_trace"][0]["source"] == "mcp"
