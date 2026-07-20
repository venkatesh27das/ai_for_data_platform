from typing import Any, TypedDict


class ModellingGraphState(TypedDict, total=False):
    project_id: str
    thread_id: str
    user_message: str | None
    conversation_messages: list[dict[str, Any]]
    modelling_brief: dict[str, Any] | None
    sources: list[dict[str, Any]]
    source_analysis: dict[str, Any] | None
    logical_model: dict[str, Any] | None
    mapping_dq: dict[str, Any] | None
    mappings: list[dict[str, Any]]
    dq_rules: list[dict[str, Any]]
    validation_findings: list[dict[str, Any]]
    validation_report: dict[str, Any] | None
    open_decisions: list[dict[str, Any]]
    pending_operations: list[dict[str, Any]]
    workflow_stage: str
    run_status: str
    error: dict[str, Any] | None
    agent_trace: list[dict[str, Any]]
    rework_count: int
    rework_target: str | None
    regeneration_target: str | None
    execution_plan: dict[str, Any] | None
    tool_results: dict[str, Any]
    tool_trace: list[dict[str, Any]]
    decision_trace: list[dict[str, Any]]
    supervisor_route: str | None
    approval_status: str | None
    active_step_id: str | None
    next_action: str | None
    tool_steps_completed: list[str]
    replan_count: int
    replanning_reason: str | None
