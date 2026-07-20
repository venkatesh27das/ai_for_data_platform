import json
import math
import re
from typing import Any

from app.db.models import MemoryEntry, MemorySettings, ProjectMemory
from app.llm.base import EmbeddingProvider
from app.repositories.memory import MemoryRepository


class MemoryService:
    def __init__(
        self,
        repository: MemoryRepository,
        embedding_provider: EmbeddingProvider | None = None,
        retrieval_limit: int = 5,
    ) -> None:
        self.repository = repository
        self.embedding_provider = embedding_provider
        self.retrieval_limit = retrieval_limit

    def project_memory(self, project_id: str) -> tuple[ProjectMemory | None, list[MemoryEntry]]:
        return (
            self.repository.get_project_memory(project_id),
            self.repository.list_entries(project_id=project_id, scope="project"),
        )

    def settings(self) -> MemorySettings:
        value = self.repository.settings()
        self.repository.db.commit()
        self.repository.db.refresh(value)
        return value

    def update_settings(self, enabled: bool) -> MemorySettings:
        return self.repository.set_cross_project_enabled(enabled)

    def user_entries(self) -> list[MemoryEntry]:
        return self.repository.list_entries(scope="user")

    async def add_user_entry(self, *, kind: str, content: str) -> MemoryEntry:
        vector = (await self._embed([content]))[0]
        entry = self.repository.add_entry(
            scope="user", kind=kind, content=content, embedding=vector
        )
        self.repository.db.commit()
        self.repository.db.refresh(entry)
        return entry

    def delete_project_memory(self, project_id: str) -> None:
        self.repository.delete_project_memory(project_id)

    def delete_user_entries(self, entry_id: str | None = None) -> int:
        return self.repository.delete_user_entries(entry_id)

    async def update_after_run(
        self,
        *,
        project_id: str,
        project_name: str,
        run_id: str,
        user_message: str,
        assistant_response: str,
        state: dict[str, Any],
    ) -> ProjectMemory:
        existing = self.repository.get_project_memory(project_id)
        structured = build_structured_memory(state, user_message, existing)
        memory = self.repository.upsert_project_memory(project_id, **structured)
        contents = [
            ("request", user_message, {"artifact_type": "conversation"}),
            ("response", assistant_response, {"artifact_type": "conversation"}),
            ("summary", structured["summary"], {"artifact_type": "project_summary"}),
            *evidence_documents(state),
        ]
        missing = [
            (kind, content, metadata)
            for kind, content, metadata in contents
            if content
            and self.repository.entry_for_run(
                run_id, "project", kind, content
            )
            is None
        ]
        vectors = await self._embed([content for _, content, _ in missing])
        for (kind, content, metadata), vector in zip(missing, vectors, strict=True):
            self.repository.add_entry(
                scope="project",
                kind=kind,
                content=content,
                embedding=vector,
                metadata=metadata,
                project_id=project_id,
                source_project_id=project_id,
                source_run_id=run_id,
            )
        if self.repository.settings().cross_project_enabled:
            cross_content = f"Project {project_name}: {structured['summary']}"
            if self.repository.entry_for_run(run_id, "user", "project_summary") is None:
                vector = (await self._embed([cross_content]))[0]
                self.repository.add_entry(
                    scope="user",
                    kind="project_summary",
                    content=cross_content,
                    embedding=vector,
                    source_project_id=project_id,
                    source_run_id=run_id,
                )
        self.repository.db.commit()
        self.repository.db.refresh(memory)
        return memory

    async def retrieve_context(self, project_id: str, query: str) -> dict[str, Any]:
        memory = self.repository.get_project_memory(project_id)
        # Commit the singleton's first-use creation before a potentially long workflow so
        # SQLite never retains a write transaction while the model is running.
        include_user = self.settings().cross_project_enabled
        candidates = self.repository.candidates(project_id, include_user=include_user)
        query_vector = (await self._embed([query]))[0] if candidates else []
        ranked = sorted(
            candidates,
            key=lambda entry: relevance(query, query_vector, entry),
            reverse=True,
        )[: self.retrieval_limit]
        return {
            "project_summary": memory.summary if memory is not None else "",
            "facts": memory.facts if memory is not None else {},
            "decisions": memory.decisions if memory is not None else [],
            "preferences": memory.preferences if memory is not None else {},
            "relevant_memories": [
                {
                    "scope": item.scope,
                    "kind": item.kind,
                    "content": item.content,
                    "metadata": item.entry_metadata,
                }
                for item in ranked
                if relevance(query, query_vector, item) > 0
            ],
            "cross_project_enabled": include_user,
        }

    async def _embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        if self.embedding_provider is None:
            return [[] for _ in texts]
        try:
            return await self.embedding_provider.embed(texts)
        except Exception:
            return [[] for _ in texts]


def build_structured_memory(
    state: dict[str, Any], user_message: str, existing: ProjectMemory | None
) -> dict[str, Any]:
    brief = dictionary(state.get("modelling_brief"))
    model = dictionary(state.get("logical_model"))
    validation = dictionary(state.get("validation_report"))
    facts = dict(existing.facts) if existing is not None else {}
    for key, value in {
        "domain": brief.get("domain"),
        "objective": brief.get("objective"),
        "business_process": brief.get("business_process"),
        "fact_grain": model.get("fact_grain") or brief.get("candidate_grain"),
        "model_name": model.get("model_name"),
        "kpis": brief.get("kpis"),
        "source_systems": brief.get("source_systems"),
        "source_objects": brief.get("source_objects"),
        "latest_request": user_message,
    }.items():
        if value not in (None, "", []):
            facts[key] = value
    decisions = merge_unique(
        existing.decisions if existing is not None else [],
        [
            f"Fact grain: {facts['fact_grain']}" if facts.get("fact_grain") else "",
            f"Logical model: {facts['model_name']}" if facts.get("model_name") else "",
            f"Validation: {validation.get('summary')}" if validation.get("summary") else "",
        ],
    )
    assumptions = merge_unique(
        existing.assumptions if existing is not None else [],
        collect_assumptions(state),
    )
    terminology = dict(existing.terminology) if existing is not None else {}
    for entity in list_of_dicts(model.get("entities")):
        if entity.get("name"):
            terminology[str(entity["name"])] = str(entity.get("kind", "entity"))
    preferences = dict(existing.preferences) if existing is not None else {}
    for key in ("consumption", "requested_outputs"):
        if brief.get(key):
            preferences[key] = brief[key]
    summary = render_summary(facts, decisions, assumptions)
    return {
        "summary": summary,
        "facts": facts,
        "decisions": decisions[-20:],
        "assumptions": assumptions[-20:],
        "terminology": terminology,
        "preferences": preferences,
    }


def render_summary(
    facts: dict[str, Any], decisions: list[str], assumptions: list[str]
) -> str:
    parts = [
        str(facts.get("objective") or "").strip(),
        f"Business process: {facts['business_process']}." if facts.get("business_process") else "",
        f"Confirmed grain: {facts['fact_grain']}." if facts.get("fact_grain") else "",
        f"KPIs: {', '.join(map(str, facts['kpis']))}." if facts.get("kpis") else "",
        f"Sources: {', '.join(map(str, facts['source_objects']))}."
        if facts.get("source_objects")
        else "",
    ]
    if decisions:
        parts.append("Decisions: " + "; ".join(decisions[-3:]) + ".")
    if assumptions:
        parts.append("Assumptions: " + "; ".join(assumptions[-3:]) + ".")
    return " ".join(part for part in parts if part).strip()[:8_000]


def relevance(query: str, query_vector: list[float], entry: MemoryEntry) -> float:
    if query_vector and entry.embedding and len(query_vector) == len(entry.embedding):
        return cosine(query_vector, entry.embedding)
    query_tokens = tokens(query)
    entry_tokens = tokens(entry.content)
    return len(query_tokens & entry_tokens) / max(1, len(query_tokens | entry_tokens))


def cosine(left: list[float], right: list[float]) -> float:
    numerator = sum(a * b for a, b in zip(left, right, strict=True))
    denominator = math.sqrt(sum(a * a for a in left)) * math.sqrt(sum(b * b for b in right))
    return numerator / denominator if denominator else 0.0


def tokens(value: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9]+", value.lower()) if len(token) > 2}


def collect_assumptions(state: dict[str, Any]) -> list[str]:
    output: list[str] = []
    for key in ("modelling_brief", "source_analysis", "logical_model", "mapping_dq"):
        output.extend(map(str, dictionary(state.get(key)).get("assumptions", [])))
    return output


def merge_unique(existing: list[str], incoming: list[str]) -> list[str]:
    return list(dict.fromkeys([*existing, *(item for item in incoming if item)]))


def dictionary(value: object) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def list_of_dicts(value: object) -> list[dict[str, Any]]:
    return [item for item in value if isinstance(item, dict)] if isinstance(value, list) else []


def evidence_documents(
    state: dict[str, Any],
) -> list[tuple[str, str, dict[str, Any]]]:
    documents: list[tuple[str, str, dict[str, Any]]] = []
    for source in list_of_dicts(state.get("sources")):
        name = str(source.get("name") or "source")
        profile = dictionary(source.get("profile"))
        documents.append(
            (
                "source_profile",
                compact_json(
                    {
                        "source": name,
                        "format": source.get("format"),
                        "profile": profile,
                        "content_excerpt": source.get("content_excerpt", ""),
                    }
                ),
                {"source_name": name, "evidence_type": "uploaded_profile"},
            )
        )
    analysis = dictionary(state.get("source_analysis"))
    for source in list_of_dicts(analysis.get("sources")):
        name = str(source.get("table_name") or "table")
        documents.append(
            (
                "source_analysis",
                compact_json(source),
                {
                    "source_name": name,
                    "evidence_type": "analysed_table",
                    "columns": source.get("columns", []),
                },
            )
        )
    artifact_values = {
        "logical_model": state.get("logical_model"),
        "mappings": dictionary(state.get("mapping_dq")).get("mappings"),
        "dq_rules": dictionary(state.get("mapping_dq")).get("dq_rules"),
        "validation": state.get("validation_report"),
    }
    for artifact_type, value in artifact_values.items():
        if value:
            documents.append(
                (
                    "artifact",
                    compact_json({"artifact_type": artifact_type, "payload": value}),
                    {"artifact_type": artifact_type, "evidence_type": "generated_artifact"},
                )
            )
    for tool_name, result in dictionary(state.get("tool_results")).items():
        if str(tool_name).startswith("mcp.") or "catalog" in str(tool_name).lower():
            documents.append(
                (
                    "catalog_evidence",
                    compact_json({"tool": tool_name, "result": result}),
                    {"tool_name": tool_name, "evidence_type": "catalog_tool"},
                )
            )
    return documents


def compact_json(value: object, limit: int = 8_000) -> str:
    return json.dumps(value, sort_keys=True, default=str)[:limit]
