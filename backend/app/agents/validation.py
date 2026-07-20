from typing import Literal

from app.agents.base import StructuredAgent
from app.agents.contracts import ValidationAgentInput, ValidationFinding, ValidationReport
from app.agents.fallbacks import fallback_assumption
from app.agents.prompt_loader import load_prompt


class ValidationAgent(StructuredAgent[ValidationAgentInput, ValidationReport]):
    identifier = "validation_agent"
    purpose = "Independently validate model, mappings and DQ rules against supplied evidence."
    output_model = ValidationReport

    def __init__(self, *args: object, deterministic_fast_path: bool = False) -> None:
        super().__init__(*args)  # type: ignore[arg-type]
        self.deterministic_fast_path = deterministic_fast_path

    @property
    def instructions(self) -> str:
        return load_prompt("validation_agent_v1.md")

    async def run(self, payload: ValidationAgentInput) -> ValidationReport:
        if self.deterministic_fast_path:
            report = deterministic_structural_validation(payload)
            if report is not None:
                return report
        return await super().run(payload)

    def fallback(self, payload: ValidationAgentInput, error: Exception) -> ValidationReport:
        findings: list[ValidationFinding] = []
        facts = [entity for entity in payload.logical_model.entities if entity.kind == "fact"]
        if len(facts) != 1:
            findings.append(
                finding(
                    "High",
                    "Fact design",
                    "The MVP model must contain exactly one fact entity.",
                    "logical_model",
                    "Revise the logical model to one clearly grained fact.",
                    False,
                )
            )
        entity_ids = {entity.id for entity in payload.logical_model.entities}
        disconnected = [
            relationship
            for relationship in payload.logical_model.relationships
            if relationship.from_entity_id not in entity_ids
            or relationship.to_entity_id not in entity_ids
        ]
        if disconnected:
            findings.append(
                finding(
                    "High",
                    "Relationships",
                    "One or more relationships reference an unknown entity.",
                    "logical_model",
                    "Correct the relationship endpoints.",
                    False,
                )
            )
        review_mappings = [
            item for item in payload.mapping_dq.mappings if item.status == "Needs review"
        ]
        if review_mappings:
            findings.append(
                finding(
                    "Medium",
                    "Mapping evidence",
                    f"{len(review_mappings)} mappings need source confirmation.",
                    "mappings",
                    "Confirm the source columns and transformations with the modeller.",
                    True,
                )
            )
        high_findings = [item for item in findings if item.severity == "High"]
        return ValidationReport(
            passed=not high_findings,
            requires_rework=bool(high_findings),
            rework_target="model_design" if high_findings else None,
            findings=findings,
            summary=(
                "Structural validation passed with review items."
                if not high_findings
                else "Structural validation requires model rework."
            ),
            confidence=0.75,
            evidence=["Deterministic checks over typed workflow artifacts"],
            assumptions=[fallback_assumption(error)],
        )


def finding(
    severity: Literal["High", "Medium", "Low"],
    category: str,
    message: str,
    artifact_type: str,
    action: str,
    requires_human: bool,
) -> ValidationFinding:
    return ValidationFinding(
        severity=severity,
        category=category,
        message=message,
        affected_artifact_type=artifact_type,
        evidence=["Typed artifact structure"],
        recommended_action=action,
        requires_human=requires_human,
    )


def deterministic_structural_validation(
    payload: ValidationAgentInput,
) -> ValidationReport | None:
    """Validate referential structure locally; defer semantic review to the LLM."""
    ambiguous = (
        bool(payload.logical_model.open_decisions)
        or bool(payload.mapping_dq.review_items)
        or any(
            item.status != "Approved" or item.confidence != "High"
            for item in payload.mapping_dq.mappings
        )
        or any(
            item.status != "Ready" or item.confidence != "High"
            for item in payload.mapping_dq.dq_rules
        )
    )
    if ambiguous:
        return None

    findings: list[ValidationFinding] = []
    entities = payload.logical_model.entities
    facts = [entity for entity in entities if entity.kind == "fact"]
    if len(facts) != 1:
        findings.append(
            finding(
                "High",
                "Fact design",
                "The MVP model must contain exactly one fact entity.",
                "logical_model",
                "Revise the model to one clearly grained fact.",
                False,
            )
        )
    elif not payload.logical_model.fact_grain.strip() or not (facts[0].grain or "").strip():
        findings.append(
            finding(
                "High",
                "Fact grain",
                "The fact entity and model must declare a grain.",
                "logical_model",
                "Declare one precise business event per fact row.",
                False,
            )
        )

    entity_ids = [entity.id for entity in entities]
    entity_names = [entity.name.casefold() for entity in entities]
    if len(entity_ids) != len(set(entity_ids)) or len(entity_names) != len(set(entity_names)):
        findings.append(
            finding(
                "High",
                "Entity identity",
                "Entity identifiers and names must be unique.",
                "logical_model",
                "Assign a unique identifier and name to each entity.",
                False,
            )
        )

    attribute_index: set[str] = set()
    by_id = {entity.id: entity for entity in entities}
    for entity in entities:
        names = [attribute.name.casefold() for attribute in entity.attributes]
        if not names or len(names) != len(set(names)):
            findings.append(
                finding(
                    "High",
                    "Entity attributes",
                    f"{entity.name} has no attributes or contains duplicate attribute names.",
                    "logical_model",
                    "Define a unique set of attributes for the entity.",
                    False,
                )
            )
        if not any(attribute.key_type in {"PK", "PK,FK"} for attribute in entity.attributes):
            findings.append(
                finding(
                    "High",
                    "Entity key",
                    f"{entity.name} has no primary key.",
                    "logical_model",
                    "Define a primary key backed by source or declared design evidence.",
                    False,
                )
            )
        attribute_index.update(
            f"{entity.name}.{item.name}".casefold() for item in entity.attributes
        )

    for relationship in payload.logical_model.relationships:
        left = by_id.get(relationship.from_entity_id)
        right = by_id.get(relationship.to_entity_id)
        valid_left = left is not None and any(
            item.name.casefold() == relationship.foreign_key.casefold()
            for item in left.attributes
        )
        valid_right = right is not None and any(
            item.name.casefold() == relationship.primary_key.casefold()
            and item.key_type in {"PK", "PK,FK"}
            for item in right.attributes
        )
        if (
            left is None
            or right is None
            or left.id == right.id
            or not valid_left
            or not valid_right
        ):
            findings.append(
                finding(
                    "High",
                    "Relationships",
                    "A relationship has an invalid endpoint, foreign key, or primary key.",
                    "logical_model",
                    "Correct relationship endpoints and key references.",
                    False,
                )
            )

    invalid_mappings = [
        item.target
        for item in payload.mapping_dq.mappings
        if item.target.casefold() not in attribute_index
    ]
    invalid_rules = [
        item.target
        for item in payload.mapping_dq.dq_rules
        if item.target.casefold() not in attribute_index
    ]
    if invalid_mappings or invalid_rules:
        findings.append(
            finding(
                "High",
                "Target references",
                "Mappings or data-quality rules reference attributes absent from the model.",
                "mappings",
                "Align all targets to existing Entity.Attribute identifiers.",
                False,
            )
        )

    model_problem = any(item.affected_artifact_type == "logical_model" for item in findings)
    return ValidationReport(
        passed=not findings,
        requires_rework=bool(findings),
        rework_target=("model_design" if model_problem else "mapping_dq") if findings else None,
        findings=findings,
        summary=(
            "Deterministic structural validation passed."
            if not findings
            else "Deterministic structural validation found repairable integrity defects."
        ),
        confidence=0.98,
        evidence=["Deterministic referential checks over typed workflow artifacts"],
        assumptions=[],
        execution_mode="deterministic",
    )
