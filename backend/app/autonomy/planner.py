from pathlib import Path

from app.agents.base import StructuredAgent
from app.agents.fallbacks import fallback_assumption
from app.autonomy.contracts import ExecutionPlan, PlannedToolCall, PlanningInput, PlanStep


class PlannerAgent(StructuredAgent[PlanningInput, ExecutionPlan]):
    identifier = "planner_agent"
    purpose = "Create a bounded, capability-aware execution plan and approval policy."
    output_model = ExecutionPlan

    @property
    def instructions(self) -> str:
        return (
            (Path(__file__).with_name("prompts") / "planner_agent_v1.md")
            .read_text(encoding="utf-8")
            .strip()
        )

    def fallback(self, payload: PlanningInput, error: Exception) -> ExecutionPlan:
        return self.deterministic_plan(payload).model_copy(
            update={
                "execution_mode": "fallback",
                "fallback_reason": str(error) or type(error).__name__,
                "assumptions": [fallback_assumption(error)],
            }
        )

    def deterministic_plan(self, payload: PlanningInput) -> ExecutionPlan:
        steps = default_steps(
            has_sources=bool(payload.existing_state.get("sources")),
            profile_tool_available="source.profile_summary" in payload.available_tools,
        )
        return ExecutionPlan(
            objective=payload.user_message.split("\n", 1)[0][:500],
            steps=steps,
            rationale="Use the bounded standard modelling workflow with evidence-first analysis.",
            requires_human_approval=False,
            iteration_budget=1,
            tool_call_budget=4,
            confidence=0.75,
            evidence=["Available skill manifests and current project state"],
            execution_mode="deterministic",
        )


def default_steps(*, has_sources: bool, profile_tool_available: bool = True) -> list[PlanStep]:
    return [
        PlanStep(
            id="requirements",
            title="Confirm modelling requirements and grain",
            agent_id="requirement_agent",
            skill_id="requirements.clarification",
            completion_criteria=["Objective and fact grain are explicit"],
        ),
        PlanStep(
            id="sources",
            title="Analyse supplied source evidence",
            agent_id="source_analysis_agent",
            skill_id="sources.evidence-analysis",
            depends_on=["requirements"],
            tool_calls=(
                [
                    PlannedToolCall(
                        tool_name="source.profile_summary",
                        rationale="Use the persisted profile rather than re-reading source files.",
                        parallel_safe=True,
                    )
                ]
                if has_sources and profile_tool_available
                else []
            ),
            completion_criteria=["Source roles and relevant columns are evidence-backed"],
        ),
        PlanStep(
            id="model",
            title="Design the logical dimensional model",
            agent_id="model_design_agent",
            skill_id="models.dimensional-design",
            depends_on=["sources"],
            completion_criteria=["Fact grain, entities, keys and relationships are consistent"],
        ),
        PlanStep(
            id="mapping_dq",
            title="Generate mappings and data-quality rules",
            agent_id="mapping_dq_agent",
            skill_id="governance.mapping-dq",
            depends_on=["model"],
            completion_criteria=["Every target is mapped or marked for review"],
        ),
        PlanStep(
            id="validation",
            title="Validate the complete proposal",
            agent_id="validation_agent",
            skill_id="governance.model-validation",
            depends_on=["mapping_dq"],
            completion_criteria=["No unresolved high-severity structural finding remains"],
        ),
    ]
