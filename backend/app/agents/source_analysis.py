from typing import Literal

from app.agents.base import StructuredAgent
from app.agents.contracts import (
    AnalysedSource,
    SourceAnalysis,
    SourceAnalysisAgentInput,
    SourceColumnAnalysis,
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
    relationships: list[SourceRelationship] = []
    seen: set[tuple[str, str, str]] = set()
    for index, left in enumerate(sources):
        for right in sources[index + 1 :]:
            child, parent = relationship_direction(left, right)
            child_columns = {normalize(column): column for column in child.columns}
            for candidate in parent.candidate_keys:
                parent_keys = [part.strip() for part in candidate.split("+")]
                matched = [child_columns.get(normalize(key)) for key in parent_keys]
                if not matched or any(item is None for item in matched):
                    continue
                child_keys = [str(item) for item in matched]
                identity = (child.table_name, parent.table_name, candidate.casefold())
                if identity in seen:
                    continue
                seen.add(identity)
                components = relationship_score(child, parent, child_keys, parent_keys)
                confidence = round(sum(components.values()), 2)
                child_profile = profile_for(child, child_keys[0])
                relationships.append(
                    SourceRelationship(
                        from_source=child.table_name,
                        to_source=parent.table_name,
                        join_expression=" AND ".join(
                            f"{child.table_name}.{child_key} = {parent.table_name}.{parent_key}"
                            for child_key, parent_key in zip(
                                child_keys, parent_keys, strict=True
                            )
                        ),
                        confidence=confidence,
                        cardinality=infer_cardinality(child, parent, child_keys, parent_keys),
                        nullable_foreign_key=(
                            child_profile.nullable if child_profile is not None else None
                        ),
                        score_components=components,
                        evidence=[
                            f"Matched parent candidate key: {candidate}",
                            f"Role evidence: {child.role} to {parent.role}",
                            "Relationship score combines name, key, role, type, and value overlap",
                        ],
                    )
                )
    return relationships


def relationship_direction(
    left: AnalysedSource, right: AnalysedSource
) -> tuple[AnalysedSource, AnalysedSource]:
    rank = {"Transaction": 4, "Header": 3, "Master data": 2, "Reference": 1, "Unknown": 0}
    return (left, right) if rank[left.role] >= rank[right.role] else (right, left)


def relationship_score(
    child: AnalysedSource,
    parent: AnalysedSource,
    child_keys: list[str],
    parent_keys: list[str],
) -> dict[str, float]:
    type_matches = []
    overlaps = []
    for child_key, parent_key in zip(child_keys, parent_keys, strict=True):
        child_profile = profile_for(child, child_key)
        parent_profile = profile_for(parent, parent_key)
        type_matches.append(
            bool(
                child_profile
                and parent_profile
                and child_profile.data_type == parent_profile.data_type
            )
        )
        overlaps.append(sample_overlap(child_profile, parent_profile))
    return {
        "name_match": 0.35,
        "parent_key": 0.30,
        "role_compatibility": 0.15 if child.role != parent.role else 0.08,
        "type_compatibility": 0.10 if any(type_matches) else 0.05,
        "sample_overlap": round(0.10 * max(overlaps, default=0), 2),
    }


def infer_cardinality(
    child: AnalysedSource,
    parent: AnalysedSource,
    child_keys: list[str],
    parent_keys: list[str],
) -> Literal["many-to-one", "one-to-one", "unknown"]:
    child_unique = all(column_key_score(child, key) >= 0.98 for key in child_keys) and bool(
        child_keys
    )
    parent_candidate_columns = {
        part.strip()
        for candidate in parent.candidate_keys
        for part in candidate.split("+")
    }
    parent_unique = all(
        key in parent_candidate_columns for key in parent_keys
    )
    if child_unique and parent_unique and child.role == parent.role:
        return "one-to-one"
    return "many-to-one" if parent_unique else "unknown"


def profile_for(source: AnalysedSource, column: str) -> SourceColumnAnalysis | None:
    return next(
        (item for item in source.column_profiles if normalize(item.name) == normalize(column)),
        None,
    )


def column_key_score(source: AnalysedSource, column: str) -> float:
    profile = profile_for(source, column)
    return profile.candidate_key_score or 0 if profile is not None else 0


def sample_overlap(
    left: SourceColumnAnalysis | None, right: SourceColumnAnalysis | None
) -> float:
    if left is None or right is None:
        return 0.0
    left_values = {str(item) for item in left.sample_values}
    right_values = {str(item) for item in right.sample_values}
    return len(left_values & right_values) / max(1, len(left_values | right_values))


def normalize(value: str) -> str:
    return "".join(character for character in value.casefold() if character.isalnum())


def humanize(value: str) -> str:
    return value.replace("_", " ").strip().title()
