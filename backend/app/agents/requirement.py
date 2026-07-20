import re

from app.agents.base import StructuredAgent
from app.agents.contracts import ClarificationQuestion, ModellingBrief, RequirementAgentInput
from app.agents.fallbacks import fallback_assumption
from app.agents.prompt_loader import load_prompt


class RequirementAgent(StructuredAgent[RequirementAgentInput, ModellingBrief]):
    identifier = "requirement_agent"
    purpose = "Turn a modelling scenario into a structured, decision-ready brief."
    output_model = ModellingBrief

    @property
    def instructions(self) -> str:
        return load_prompt("requirement_agent_v1.md")

    def fallback(self, payload: RequirementAgentInput, error: Exception) -> ModellingBrief:
        message = payload.user_message
        grain_match = re.search(
            r"(?:one|1)\s+(?:row|record)\s+per\s+([^.;\n]+)", message, re.IGNORECASE
        )
        source_objects = sorted(set(re.findall(r"\b[A-Z][A-Z0-9_]{2,9}\b", message)))
        candidate_grain = f"One row per {grain_match.group(1).strip()}" if grain_match else None
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
            blocking_questions=questions,
            can_proceed=bool(candidate_grain),
            confidence=0.55,
            evidence=["Parsed directly from the modeller's message"],
            assumptions=[fallback_assumption(error)],
        )


def find_terms(message: str, candidates: tuple[str, ...]) -> list[str]:
    lowered = message.lower()
    return [candidate for candidate in candidates if candidate.lower() in lowered]
