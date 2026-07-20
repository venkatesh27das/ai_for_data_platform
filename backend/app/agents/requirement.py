import re
from typing import Literal

from app.agents.base import StructuredAgent
from app.agents.contracts import (
    ClarificationQuestion,
    ModellingBrief,
    RequirementAgentInput,
    RequirementCoverage,
)
from app.agents.fallbacks import fallback_assumption
from app.agents.prompt_loader import load_prompt


class RequirementAgent(StructuredAgent[RequirementAgentInput, ModellingBrief]):
    identifier = "requirement_agent"
    purpose = "Turn a modelling scenario into a structured, decision-ready brief."
    output_model = ModellingBrief

    @property
    def instructions(self) -> str:
        return load_prompt("requirement_agent_v1.md")

    async def run(self, payload: RequirementAgentInput) -> ModellingBrief:
        brief = await super().run(payload)
        return apply_clarification_policy(payload, brief)

    def fallback(self, payload: RequirementAgentInput, error: Exception) -> ModellingBrief:
        message = payload.user_message
        grain_match = re.search(
            r"(?:one|1)\s+(?:row|record)\s+per\s+([^.;\n]+)", message, re.IGNORECASE
        )
        source_objects = sorted(set(re.findall(r"\b[A-Z][A-Z0-9_]{2,9}\b", message)))
        candidate_grain = f"One row per {grain_match.group(1).strip()}" if grain_match else None
        history_requirement = infer_history_requirement(message)
        questions = (
            []
            if candidate_grain
            else [
                ClarificationQuestion(
                    question="What should one row in the fact table represent?",
                    rationale="A dimensional model requires an explicit fact grain.",
                    blocking=True,
                )
            ]
        )
        return ModellingBrief(
            domain="Data analytics",
            objective=message.split("\n", 1)[0][:500],
            business_process="Analytical process described by the modeller",
            consumption=[],
            kpis=find_terms(
                message,
                ("net sales", "ordered quantity", "discount amount", "order count"),
            ),
            source_systems=find_terms(message, ("SAP S/4HANA", "SAP", "Salesforce")),
            source_objects=source_objects,
            requested_outputs=find_terms(
                message,
                ("logical model", "mappings", "data quality rules", "validation findings"),
            ),
            candidate_grain=candidate_grain,
            key_requirements=list(payload.existing_brief.get("key_requirements", []))
            if payload.existing_brief
            else [],
            relationship_requirements=list(
                payload.existing_brief.get("relationship_requirements", [])
            )
            if payload.existing_brief
            else [],
            history_requirement=history_requirement
            or (payload.existing_brief or {}).get("history_requirement"),
            kpi_definitions=dict((payload.existing_brief or {}).get("kpi_definitions", {})),
            blocking_questions=questions,
            can_proceed=bool(candidate_grain),
            confidence=0.55,
            evidence=["Parsed directly from the modeller's message"],
            assumptions=[fallback_assumption(error)],
        )


def find_terms(message: str, candidates: tuple[str, ...]) -> list[str]:
    lowered = message.lower()
    return [candidate for candidate in candidates if candidate.lower() in lowered]


ClarificationCategory = Literal[
    "objective", "grain", "keys", "relationships", "history", "kpis", "other"
]


def apply_clarification_policy(
    payload: RequirementAgentInput, brief: ModellingBrief
) -> ModellingBrief:
    """Make clarification deterministic even when a provider omits coverage fields."""
    updates = marker_updates(payload.user_message)
    values = brief.model_dump()
    if "objective" in updates:
        values["objective"] = updates["objective"]
    if "grain" in updates:
        values["candidate_grain"] = normalize_grain(updates["grain"])
    if "keys" in updates:
        values["key_requirements"] = [updates["keys"]]
    if "relationships" in updates:
        values["relationship_requirements"] = [updates["relationships"]]
    if "history" in updates:
        values["history_requirement"] = updates["history"]
    if "kpis" in updates:
        values["kpi_definitions"] = {"modeller_guidance": updates["kpis"]}

    objective = str(values.get("objective") or "").strip()
    grain = str(values.get("candidate_grain") or "").strip()
    keys = [str(item) for item in values.get("key_requirements", []) if str(item).strip()]
    relationships = [
        str(item)
        for item in values.get("relationship_requirements", [])
        if str(item).strip()
    ]
    history = str(values.get("history_requirement") or "").strip()
    kpis = [str(item) for item in values.get("kpis", []) if str(item).strip()]
    definitions = {
        str(key): str(value)
        for key, value in dict(values.get("kpi_definitions", {})).items()
        if str(value).strip()
    }
    has_sources = bool(values.get("source_objects") or payload.uploaded_file_names)
    uploaded_sources = bool(payload.uploaded_file_names)
    coverage = RequirementCoverage(
        objective="confirmed" if len(objective) >= 8 else "missing",
        grain="confirmed" if grain else "missing",
        keys=(
            "confirmed"
            if keys
            else "pending_source"
            if uploaded_sources or not has_sources
            else "missing"
        ),
        relationships=(
            "confirmed"
            if relationships
            else "pending_source"
            if uploaded_sources or not has_sources
            else "missing"
        ),
        history="confirmed" if history else "missing",
        kpis="not_applicable" if not kpis else "confirmed" if definitions else "missing",
    )
    required = required_questions(coverage)
    provider_questions = [
        normalize_question(item)
        for item in brief.blocking_questions
        if item.category == "other"
    ]
    questions = [*required, *provider_questions][:2]
    values.update(
        {
            "objective": objective,
            "candidate_grain": grain or None,
            "key_requirements": keys,
            "relationship_requirements": relationships,
            "history_requirement": history or None,
            "kpi_definitions": definitions,
            "requirement_coverage": coverage,
            "blocking_questions": questions,
            "can_proceed": not required,
        }
    )
    return ModellingBrief.model_validate(values)


def required_questions(coverage: RequirementCoverage) -> list[ClarificationQuestion]:
    definitions: list[tuple[ClarificationCategory, str, str, list[str]]] = [
        (
            "objective",
            "What business decision or analytical outcome should this model support?",
            "A clear objective is required to evaluate the model design.",
            [],
        ),
        (
            "grain",
            "What should one row in the fact table represent?",
            "Measures and relationships depend on an explicit fact grain.",
            [],
        ),
        (
            "keys",
            "Which business or source keys identify the main records?",
            "Known keys reduce ambiguous joins and duplicate facts.",
            ["Infer from source metadata", "I will provide the keys"],
        ),
        (
            "relationships",
            "How do the named source objects relate or join to each other?",
            "Source relationships are needed to support model relationships with evidence.",
            ["Infer from source metadata", "I will provide the joins"],
        ),
        (
            "history",
            "Should dimensions show current state only or retain attribute history?",
            "History requirements determine dimensional keys and SCD behaviour.",
            ["Current state only", "Track history (SCD Type 2)", "Let AI recommend"],
        ),
        (
            "kpis",
            "How should the requested KPIs be calculated and filtered?",
            "KPI definitions are needed to design defensible measures and mappings.",
            ["Use standard business definitions", "I will provide definitions"],
        ),
    ]
    return [
        ClarificationQuestion(
            id=f"requirement-{category}",
            category=category,
            question=question,
            rationale=rationale,
            options=options,
        )
        for category, question, rationale, options in definitions
        if getattr(coverage, category) == "missing"
    ]


def normalize_question(question: ClarificationQuestion) -> ClarificationQuestion:
    return question.model_copy(
        update={"id": question.id or "requirement-other", "blocking": True}
    )


def marker_updates(message: str) -> dict[str, str]:
    matches = re.findall(
        r"\[clarification:(objective|grain|keys|relationships|history|kpis)\]\s*"
        r"(.*?)(?=\s*\[clarification:|$)",
        message,
        re.IGNORECASE | re.DOTALL,
    )
    return {category.lower(): answer.strip() for category, answer in matches if answer.strip()}


def normalize_grain(value: str) -> str:
    return value if re.match(r"(?i)^one row per ", value) else f"One row per {value}"


def infer_history_requirement(message: str) -> str | None:
    lowered = message.lower()
    if "scd type 2" in lowered or "retain history" in lowered or "track history" in lowered:
        return "Track history (SCD Type 2)"
    if "current state" in lowered or "current-state" in lowered or "no history" in lowered:
        return "Current state only"
    return None
