from app.agents.base import StructuredAgent
from app.agents.contracts import (
    LogicalModelProposal,
    ModelAttribute,
    ModelDesignAgentInput,
    ModelEntity,
    ModelRelationship,
)
from app.agents.fallbacks import fallback_assumption, safe_identifier, snake_identifier
from app.agents.prompt_loader import load_prompt


class ModelDesignAgent(StructuredAgent[ModelDesignAgentInput, LogicalModelProposal]):
    identifier = "model_design_agent"
    purpose = "Design a compact dimensional logical model supported by requirements and evidence."
    output_model = LogicalModelProposal

    @property
    def instructions(self) -> str:
        return load_prompt("model_design_agent_v1.md")

    def fallback(self, payload: ModelDesignAgentInput, error: Exception) -> LogicalModelProposal:
        brief = payload.modelling_brief
        fact_suffix = safe_identifier(
            brief.candidate_grain or brief.business_process, fallback="Event"
        )
        for prefix in ("OneRowPer", "OneRecordPer"):
            if fact_suffix.startswith(prefix):
                fact_suffix = fact_suffix[len(prefix) :]
        fact_name = f"Fact{fact_suffix}"
        fact_id = snake_identifier(fact_name, fallback="fact_event")
        dimensions = dimension_entities(payload)
        attributes = [ModelAttribute(name=f"{fact_suffix}Key", data_type="BIGINT", key_type="PK")]
        relationships: list[ModelRelationship] = []
        for dimension in dimensions:
            dimension_suffix = dimension.name.removeprefix("Dim")
            foreign_key = f"{dimension_suffix}Key"
            attributes.append(ModelAttribute(name=foreign_key, data_type="BIGINT", key_type="FK"))
            relationships.append(
                ModelRelationship(
                    from_entity_id=fact_id,
                    to_entity_id=dimension.id,
                    cardinality="many-to-one",
                    foreign_key=foreign_key,
                    primary_key=foreign_key,
                    evidence=["Dimension inferred from supplied source metadata"],
                )
            )
        for measure in brief.kpis:
            attributes.append(
                ModelAttribute(
                    name=safe_identifier(measure, fallback="Measure"),
                    data_type="DECIMAL(18,2)",
                    source_evidence=[],
                )
            )
        fact = ModelEntity(
            id=fact_id,
            name=fact_name,
            kind="fact",
            description=brief.objective,
            grain=brief.candidate_grain,
            attributes=attributes,
        )
        return LogicalModelProposal(
            model_name=f"{safe_identifier(brief.business_process, fallback='Analytics')} Model",
            fact_grain=brief.candidate_grain or "Grain requires confirmation",
            entities=[fact, *dimensions],
            relationships=relationships,
            measures=brief.kpis,
            open_decisions=[],
            confidence=0.6,
            evidence=payload.source_analysis.evidence,
            assumptions=[*brief.assumptions, fallback_assumption(error)],
        )


def dimension_entities(payload: ModelDesignAgentInput) -> list[ModelEntity]:
    dimensions: list[ModelEntity] = []
    seen: set[str] = set()
    for source in payload.source_analysis.sources:
        if source.role not in {"Master data", "Reference", "Header"}:
            continue
        suffix = dimension_suffix(source.table_name, source.description)
        if suffix in seen:
            continue
        seen.add(suffix)
        key_name = f"{suffix}Key"
        source_columns = source.columns[:5]
        attributes = [ModelAttribute(name=key_name, data_type="BIGINT", key_type="PK")]
        attributes.extend(
            ModelAttribute(
                name=safe_identifier(column, fallback="Attribute"),
                data_type="STRING",
                source_evidence=[f"{source.table_name}.{column}"],
            )
            for column in source_columns
        )
        dimensions.append(
            ModelEntity(
                id=snake_identifier(f"dim_{suffix}", fallback="dim_context"),
                name=f"Dim{suffix}",
                kind="dimension",
                description=source.description,
                attributes=attributes,
            )
        )
    if not dimensions:
        dimensions.append(
            ModelEntity(
                id="dim_context",
                name="DimContext",
                kind="dimension",
                description="Context dimension requiring source confirmation",
                attributes=[ModelAttribute(name="ContextKey", data_type="BIGINT", key_type="PK")],
            )
        )
    return dimensions[:6]


def dimension_suffix(table_name: str, description: str) -> str:
    known = {
        "KNA1": "Customer",
        "MARA": "Product",
        "T001W": "Plant",
        "VBAK": "Order",
    }
    return known.get(table_name.upper()) or safe_identifier(description, fallback=table_name)
