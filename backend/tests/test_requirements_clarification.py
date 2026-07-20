from app.agents.contracts import ModellingBrief, RequirementAgentInput
from app.agents.requirement import apply_clarification_policy


def incomplete_brief() -> ModellingBrief:
    return ModellingBrief(
        domain="Sales",
        objective="Analyse fulfilment and sales performance",
        business_process="Order to cash",
        kpis=["Net sales"],
        source_systems=["SAP"],
        source_objects=["VBAK", "VBAP"],
        candidate_grain=None,
        can_proceed=True,
        confidence=0.8,
    )


def test_clarification_policy_detects_all_material_requirement_gaps() -> None:
    result = apply_clarification_policy(
        RequirementAgentInput(user_message="Build a sales model"), incomplete_brief()
    )

    assert result.can_proceed is False
    assert [question.category for question in result.blocking_questions] == [
        "grain",
        "keys",
    ]
    assert result.requirement_coverage.model_dump() == {
        "objective": "confirmed",
        "grain": "missing",
        "keys": "missing",
        "relationships": "missing",
        "history": "missing",
        "kpis": "missing",
    }


def test_structured_answers_advance_to_the_next_clarification_round() -> None:
    result = apply_clarification_policy(
        RequirementAgentInput(
            user_message=(
                "[clarification:grain] sales order line\n"
                "[clarification:keys] VBAK.VBELN and VBAP.VBELN + POSNR"
            )
        ),
        incomplete_brief(),
    )

    assert result.candidate_grain == "One row per sales order line"
    assert result.key_requirements == ["VBAK.VBELN and VBAP.VBELN + POSNR"]
    assert [question.category for question in result.blocking_questions] == [
        "relationships",
        "history",
    ]
