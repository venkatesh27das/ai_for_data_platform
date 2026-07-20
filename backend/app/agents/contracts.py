from typing import Any, Literal

from pydantic import BaseModel, Field


class AgentResult(BaseModel):
    agent_id: str
    agent_version: str = "1.0"
    confidence: float = Field(ge=0, le=1)
    evidence: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    execution_mode: Literal["llm", "fallback", "deterministic", "cached"] = "llm"
    fallback_reason: str | None = None


class ClarificationQuestion(BaseModel):
    id: str = "clarification"
    category: Literal[
        "objective", "grain", "keys", "relationships", "history", "kpis", "other"
    ] = "other"
    question: str
    rationale: str
    blocking: bool = True
    options: list[str] = Field(default_factory=list)


class RequirementCoverage(BaseModel):
    objective: Literal["confirmed", "missing"] = "missing"
    grain: Literal["confirmed", "missing"] = "missing"
    keys: Literal["confirmed", "missing", "pending_source", "not_applicable"] = (
        "pending_source"
    )
    relationships: Literal[
        "confirmed", "missing", "pending_source", "not_applicable"
    ] = "pending_source"
    history: Literal["confirmed", "missing"] = "missing"
    kpis: Literal["confirmed", "missing", "not_applicable"] = "not_applicable"


class RequirementAgentInput(BaseModel):
    user_message: str
    recent_conversation: list[dict[str, Any]] = Field(default_factory=list)
    existing_brief: dict[str, Any] | None = None
    uploaded_file_names: list[str] = Field(default_factory=list)


class ModellingBrief(AgentResult):
    agent_id: str = "requirement_agent"
    domain: str
    objective: str
    business_process: str
    consumption: list[str] = Field(default_factory=list)
    kpis: list[str] = Field(default_factory=list)
    source_systems: list[str] = Field(default_factory=list)
    source_objects: list[str] = Field(default_factory=list)
    requested_outputs: list[str] = Field(default_factory=list)
    candidate_grain: str | None = None
    key_requirements: list[str] = Field(default_factory=list)
    relationship_requirements: list[str] = Field(default_factory=list)
    history_requirement: str | None = None
    kpi_definitions: dict[str, str] = Field(default_factory=dict)
    requirement_coverage: RequirementCoverage = Field(default_factory=RequirementCoverage)
    blocking_questions: list[ClarificationQuestion] = Field(default_factory=list)
    can_proceed: bool


class SourceMetadata(BaseModel):
    name: str
    content_excerpt: str = ""
    format: str = "unknown"
    profile: dict[str, Any] = Field(default_factory=dict)


class SourceColumnAnalysis(BaseModel):
    name: str
    data_type: str = "unknown"
    nullable: bool | None = None
    null_percentage: float | None = Field(default=None, ge=0, le=100)
    distinct_percentage: float | None = Field(default=None, ge=0, le=100)
    candidate_key_score: float | None = Field(default=None, ge=0, le=1)
    key_role: Literal["PK", "FK", "business_key", "none"] = "none"
    references: str | None = None
    sample_values: list[str | int | float | bool] = Field(default_factory=list)


class SourceAnalysisAgentInput(BaseModel):
    modelling_brief: ModellingBrief
    uploaded_sources: list[SourceMetadata] = Field(default_factory=list)
    prior_analysis: dict[str, Any] | None = None
    tool_results: dict[str, Any] = Field(default_factory=dict)


class AnalysedSource(BaseModel):
    table_name: str
    role: Literal["Transaction", "Header", "Master data", "Reference", "Unknown"]
    column_count: int = Field(default=0, ge=0)
    columns: list[str] = Field(default_factory=list)
    candidate_keys: list[str] = Field(default_factory=list)
    business_keys: list[str] = Field(default_factory=list)
    column_profiles: list[SourceColumnAnalysis] = Field(default_factory=list)
    history_recommendation: Literal[
        "type_1", "type_2", "not_applicable", "needs_review"
    ] = "needs_review"
    history_evidence: list[str] = Field(default_factory=list)
    description: str
    evidence: list[str] = Field(default_factory=list)


class SourceRelationship(BaseModel):
    from_source: str
    to_source: str
    join_expression: str
    confidence: float = Field(ge=0, le=1)
    cardinality: Literal["many-to-one", "one-to-many", "one-to-one", "unknown"] = (
        "unknown"
    )
    nullable_foreign_key: bool | None = None
    score_components: dict[str, float] = Field(default_factory=dict)
    evidence: list[str] = Field(default_factory=list)


class SourceAnalysis(AgentResult):
    agent_id: str = "source_analysis_agent"
    sources: list[AnalysedSource] = Field(default_factory=list)
    relationships: list[SourceRelationship] = Field(default_factory=list)
    business_entities: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    can_proceed: bool


class ModelDesignAgentInput(BaseModel):
    modelling_brief: ModellingBrief
    source_analysis: SourceAnalysis
    existing_model: dict[str, Any] | None = None
    validation_findings: list[dict[str, Any]] = Field(default_factory=list)


class ModelAttribute(BaseModel):
    name: str
    data_type: str
    key_type: Literal["PK", "FK", "PK,FK"] | None = None
    source_evidence: list[str] = Field(default_factory=list)


class ModelEntity(BaseModel):
    id: str
    name: str
    kind: Literal["fact", "dimension"]
    description: str
    grain: str | None = None
    history_strategy: Literal["type_0", "type_1", "type_2"] | None = None
    attributes: list[ModelAttribute]


class ModelRelationship(BaseModel):
    from_entity_id: str
    to_entity_id: str
    cardinality: Literal["many-to-one", "one-to-many", "one-to-one"]
    foreign_key: str
    primary_key: str
    evidence: list[str] = Field(default_factory=list)


class LogicalModelProposal(AgentResult):
    agent_id: str = "model_design_agent"
    model_name: str
    fact_grain: str
    entities: list[ModelEntity]
    relationships: list[ModelRelationship]
    measures: list[str] = Field(default_factory=list)
    open_decisions: list[str] = Field(default_factory=list)


class ModelOperation(BaseModel):
    operation: Literal["change_grain", "set_dimension_history", "split_dimension"]
    target: str
    value: str
    instruction: str
    confidence: float = Field(default=1.0, ge=0, le=1)


class ModelOperationImpact(BaseModel):
    summary: str
    affected_entities: list[str] = Field(default_factory=list)
    affected_artifacts: list[
        Literal["logical_model", "mappings", "dq_rules", "validation"]
    ] = Field(default_factory=list)
    changes: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    validation_errors: list[str] = Field(default_factory=list)
    valid: bool = True
    material: bool
    approval_required: bool


class MappingDQAgentInput(BaseModel):
    modelling_brief: ModellingBrief
    source_analysis: SourceAnalysis
    logical_model: LogicalModelProposal
    validation_findings: list[dict[str, Any]] = Field(default_factory=list)


class MappingItem(BaseModel):
    source: str
    target: str
    transformation: str
    transformation_type: Literal[
        "Direct",
        "Rename",
        "Data-type conversion",
        "Concatenate",
        "Lookup placeholder",
        "Calculated",
        "Default",
        "Manual",
        "Unsupported",
    ]
    confidence: Literal["High", "Medium", "Low"]
    evidence: list[str] = Field(default_factory=list)
    status: Literal["Approved", "Needs review", "Unsupported"]
    review_reason: str = ""


class DQRule(BaseModel):
    target: str
    rule_type: Literal[
        "Not null",
        "Unique",
        "Referential integrity",
        "Accepted values",
        "Valid range",
        "Positive value",
        "Date validity",
        "Freshness placeholder",
    ]
    expression: str
    severity: Literal["Error", "Warning", "Info"]
    rationale: str
    confidence: Literal["High", "Medium", "Low"]
    status: Literal["Ready", "Needs review"]


class MappingDQProposal(AgentResult):
    agent_id: str = "mapping_dq_agent"
    mappings: list[MappingItem] = Field(default_factory=list)
    dq_rules: list[DQRule] = Field(default_factory=list)
    review_items: list[str] = Field(default_factory=list)


class ValidationAgentInput(BaseModel):
    modelling_brief: ModellingBrief
    source_analysis: SourceAnalysis
    logical_model: LogicalModelProposal
    mapping_dq: MappingDQProposal


class ValidationFinding(BaseModel):
    severity: Literal["High", "Medium", "Low"]
    category: str
    message: str
    affected_artifact_type: str
    affected_artifact_id: str | None = None
    evidence: list[str] = Field(default_factory=list)
    recommended_action: str
    requires_human: bool


class ValidationReport(AgentResult):
    agent_id: str = "validation_agent"
    passed: bool
    requires_rework: bool
    rework_target: Literal["model_design", "mapping_dq"] | None = None
    findings: list[ValidationFinding] = Field(default_factory=list)
    summary: str
