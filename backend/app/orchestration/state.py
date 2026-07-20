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
    mappings: list[dict[str, Any]]
    dq_rules: list[dict[str, Any]]
    validation_findings: list[dict[str, Any]]
    open_decisions: list[dict[str, Any]]
    pending_operations: list[dict[str, Any]]
    workflow_stage: str
    run_status: str
    error: dict[str, Any] | None
