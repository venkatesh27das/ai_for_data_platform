import re

from app.agents.base import StructuredAgent
from app.agents.contracts import DQRule, MappingDQAgentInput, MappingDQProposal, MappingItem
from app.agents.fallbacks import fallback_assumption
from app.agents.prompt_loader import load_prompt


class MappingDQAgent(StructuredAgent[MappingDQAgentInput, MappingDQProposal]):
    identifier = "mapping_dq_agent"
    purpose = "Create evidence-backed mappings and executable starter data-quality rules."
    output_model = MappingDQProposal

    @property
    def instructions(self) -> str:
        return load_prompt("mapping_dq_agent_v1.md")

    def fallback(self, payload: MappingDQAgentInput, error: Exception) -> MappingDQProposal:
        source_columns = {
            normalize(column): f"{source.table_name}.{column}"
            for source in payload.source_analysis.sources
            for column in source.columns
        }
        mappings: list[MappingItem] = []
        rules: list[DQRule] = []
        review_items: list[str] = []
        for entity in payload.logical_model.entities:
            for attribute in entity.attributes:
                target = f"{entity.name}.{attribute.name}"
                source = source_columns.get(normalize(attribute.name))
                if source:
                    mappings.append(
                        MappingItem(
                            source=source,
                            target=target,
                            transformation="Direct",
                            transformation_type="Direct",
                            confidence="High",
                            evidence=[f"Matching supplied source column {source}"],
                            status="Approved",
                        )
                    )
                else:
                    mappings.append(
                        MappingItem(
                            source="Not supplied",
                            target=target,
                            transformation="Manual mapping required",
                            transformation_type="Manual",
                            confidence="Low",
                            evidence=[],
                            status="Needs review",
                            review_reason="No matching source column was supplied.",
                        )
                    )
                    review_items.append(target)
                if attribute.key_type == "PK":
                    rules.extend(
                        [
                            dq_rule(target, "Not null", f"{attribute.name} IS NOT NULL"),
                            dq_rule(target, "Unique", f"{attribute.name} IS UNIQUE"),
                        ]
                    )
                elif attribute.key_type == "FK":
                    rules.append(
                        dq_rule(
                            target,
                            "Referential integrity",
                            f"{attribute.name} resolves to its dimension key",
                        )
                    )
        return MappingDQProposal(
            mappings=mappings,
            dq_rules=rules,
            review_items=review_items,
            confidence=0.5,
            evidence=payload.source_analysis.evidence,
            assumptions=[fallback_assumption(error)],
        )


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower()).removesuffix("key")


def dq_rule(target: str, rule_type: str, expression: str) -> DQRule:
    return DQRule(
        target=target,
        rule_type=rule_type,
        expression=expression,
        severity="Error",
        rationale="Key integrity is required for a reliable dimensional model.",
        confidence="High",
        status="Ready",
    )
