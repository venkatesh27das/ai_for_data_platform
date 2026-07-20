from app.agents.base import StructuredAgent
from app.agents.contracts import ValidationAgentInput, ValidationFinding, ValidationReport
from app.agents.fallbacks import fallback_assumption
from app.agents.prompt_loader import load_prompt


class ValidationAgent(StructuredAgent[ValidationAgentInput, ValidationReport]):
    identifier = "validation_agent"
    purpose = "Independently validate model, mappings and DQ rules against supplied evidence."
    output_model = ValidationReport

    @property
    def instructions(self) -> str:
        return load_prompt("validation_agent_v1.md")

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
    severity: str,
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
