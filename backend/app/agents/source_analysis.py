from app.agents.base import StructuredAgent
from app.agents.contracts import SourceAnalysis, SourceAnalysisAgentInput
from app.agents.fallbacks import fallback_assumption, named_sources, parse_ddl_sources
from app.agents.prompt_loader import load_prompt


class SourceAnalysisAgent(StructuredAgent[SourceAnalysisAgentInput, SourceAnalysis]):
    identifier = "source_analysis_agent"
    purpose = "Interpret supplied source metadata without inventing profiling evidence."
    allowed_tools = ("metadata_excerpt",)
    output_model = SourceAnalysis

    @property
    def instructions(self) -> str:
        return load_prompt("source_analysis_agent_v1.md")

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
