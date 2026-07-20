from datetime import UTC, datetime
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field

from app.agents.contracts import AgentResult


class SkillManifest(BaseModel):
    id: str
    version: str
    name: str
    description: str
    agent_id: str
    capabilities: list[str]
    allowed_tools: list[str] = Field(default_factory=list)
    requires_human_approval: bool = False


class PlanStep(BaseModel):
    id: str
    title: str
    agent_id: str
    skill_id: str
    depends_on: list[str] = Field(default_factory=list)
    required_tools: list[str] = Field(default_factory=list)
    completion_criteria: list[str] = Field(default_factory=list)
    status: Literal["pending", "running", "completed", "blocked", "failed"] = "pending"
    approval_required: bool = False


class ExecutionPlan(AgentResult):
    agent_id: str = "planner_agent"
    plan_id: str = Field(default_factory=lambda: str(uuid4()))
    objective: str
    steps: list[PlanStep]
    rationale: str
    requires_human_approval: bool = False
    approval_reason: str | None = None
    iteration_budget: int = Field(default=2, ge=0, le=5)
    tool_call_budget: int = Field(default=8, ge=0, le=30)


class PlanningInput(BaseModel):
    user_message: str
    existing_state: dict[str, Any] = Field(default_factory=dict)
    available_skills: list[SkillManifest] = Field(default_factory=list)
    available_tools: list[str] = Field(default_factory=list)
    validation_findings: list[dict[str, Any]] = Field(default_factory=list)


class ToolRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    tool_name: str
    arguments: dict[str, Any] = Field(default_factory=dict)
    requested_by: str
    skill_id: str


class ToolExecutionRecord(BaseModel):
    request_id: str
    tool_name: str
    requested_by: str
    skill_id: str
    status: Literal["completed", "failed", "denied"]
    arguments: dict[str, Any] = Field(default_factory=dict)
    result: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None
    duration_ms: float = 0
    source: Literal["builtin", "mcp"] = "builtin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class DecisionRecord(BaseModel):
    decision: str
    reason: str
    selected_route: str
    plan_id: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
