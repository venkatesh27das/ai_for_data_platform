from collections import defaultdict

from app.agents.base import StructuredAgent
from app.agents.contracts import (
    AnalysedSource,
    SourceAnalysis,
    SourceAnalysisAgentInput,
    SourceRelationship,
)
from app.agents.fallbacks import fallback_assumption, named_sources, parse_ddl_sources
from app.agents.prompt_loader import load_prompt


class SourceAnalysisAgent(StructuredAgent[SourceAnalysisAgentInput, SourceAnalysis]):
    identifier = "source_analysis_agent"
    purpose = "Interpret supplied source metadata without inventing profiling evidence."
    allowed_tools = ("metadata_excerpt",)
    output_model = SourceAnalysis

    def __init__(self, *args: object, deterministic_fast_path: bool = False) -> None:
        super().__init__(*args)  # type: ignore[arg-type]
        self.deterministic_fast_path = deterministic_fast_path

    @property
    def instructions(self) -> str:
        return load_prompt("source_analysis_agent_v1.md")

    async def run(self, payload: SourceAnalysisAgentInput) -> SourceAnalysis:
        if self.deterministic_fast_path:
            result = deterministic_source_analysis(payload)
            if result is not None:
                return result
        return await super().run(payload)

    def fallback(self, payload: SourceAnalysisAgentInput, error: Exception) -> SourceAnalysis:
        sources = parse_ddl_sources(payload.uploaded_sources)
        warnings: list[str] = []
        if not sources:
            sources = named_sources(payload.modelling_brief)
            warnings.append("Column-level metadata was not supplied; mappings require review.")
        return SourceAnalysis(
            sources=sources,
            relationships=[],
            business_entities=[payload.modelling_brief.business_process],
            warnings=warnings,
            can_proceed=bool(sources),
            confidence=0.7 if any(source.columns for source in sources) else 0.35,
            evidence=[item for source in sources for item in source.evidence],
            assumptions=[fallback_assumption(error)],
        )


def deterministic_source_analysis(
    payload: SourceAnalysisAgentInput,
) -> SourceAnalysis | None:
    """Return an evidence-only result when profiles make source roles unambiguous."""
    sources = parse_ddl_sources(payload.uploaded_sources)
    if not sources or any(not source.columns or source.role == "Unknown" for source in sources):
        return None
    relationships = infer_profile_relationships(sources)
    return SourceAnalysis(
        sources=sources,
        relationships=relationships,
        business_entities=[humanize(source.table_name) for source in sources],
        warnings=(
            []
            if relationships or len(sources) == 1
            else ["No relationship was asserted because no exact profiled key match was found."]
        ),
        can_proceed=True,
        confidence=0.92,
        evidence=[item for source in sources for item in source.evidence],
        assumptions=[],
        execution_mode="deterministic",
    )


def infer_profile_relationships(sources: list[AnalysedSource]) -> list[SourceRelationship]:
    owners: dict[str, list[AnalysedSource]] = defaultdict(list)
    for source in sources:
        for key in source.candidate_keys:
            if "+" not in key:
                owners[key.casefold()].append(source)
    relationships: list[SourceRelationship] = []
    seen: set[tuple[str, str, str]] = set()
    for key, matched in owners.items():
        for index, left in enumerate(matched):
            for right in matched[index + 1 :]:
                pair = (left.table_name, right.table_name, key)
                if pair in seen:
                    continue
                seen.add(pair)
                display_key = next(
                    column for column in left.columns if column.casefold() == key
                )
                relationships.append(
                    SourceRelationship(
                        from_source=left.table_name,
                        to_source=right.table_name,
                        join_expression=(
                            f"{left.table_name}.{display_key} = "
                            f"{right.table_name}.{display_key}"
                        ),
                        confidence=0.9,
                        evidence=[f"Exact candidate-key name match: {display_key}"],
                    )
                )
    return relationships


def humanize(value: str) -> str:
    return value.replace("_", " ").strip().title()
