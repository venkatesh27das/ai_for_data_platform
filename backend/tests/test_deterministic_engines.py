from app.agents.contracts import SourceAnalysisAgentInput, ValidationAgentInput
from app.agents.source_analysis import deterministic_source_analysis
from app.agents.validation import deterministic_structural_validation


def test_profiled_sources_use_deterministic_analysis() -> None:
    payload = SourceAnalysisAgentInput.model_validate(
        {
            "modelling_brief": brief(),
            "uploaded_sources": [
                {
                    "name": "sales.csv",
                    "format": "csv",
                    "profile": {
                        "tables": [
                            {
                                "name": "order_line",
                                "row_sample_count": 10,
                                "columns": [
                                    {"name": "order_line_id"},
                                    {"name": "customer_id"},
                                    {"name": "amount"},
                                ],
                            },
                            {
                                "name": "customer",
                                "row_sample_count": 10,
                                "columns": [
                                    {"name": "customer_id"},
                                    {"name": "customer_name"},
                                ],
                            },
                        ]
                    },
                }
            ],
        }
    )

    result = deterministic_source_analysis(payload)

    assert result is not None
    assert result.execution_mode == "deterministic"
    assert {source.role for source in result.sources} == {"Transaction", "Master data"}
    assert result.relationships[0].join_expression == (
        "order_line.customer_id = customer.customer_id"
    )


def test_ambiguous_source_role_escalates() -> None:
    payload = SourceAnalysisAgentInput.model_validate(
        {
            "modelling_brief": brief(),
            "uploaded_sources": [
                {
                    "name": "opaque.csv",
                    "format": "csv",
                    "profile": {
                        "tables": [
                            {"name": "opaque", "columns": [{"name": "value"}]}
                        ]
                    },
                }
            ],
        }
    )

    assert deterministic_source_analysis(payload) is None


def test_structurally_sound_model_uses_deterministic_validation() -> None:
    payload = ValidationAgentInput.model_validate(validation_payload())

    result = deterministic_structural_validation(payload)

    assert result is not None
    assert result.passed is True
    assert result.execution_mode == "deterministic"


def test_semantic_review_item_escalates_validation() -> None:
    value = validation_payload()
    value["mapping_dq"]["mappings"][0]["status"] = "Needs review"
    value["mapping_dq"]["mappings"][0]["review_reason"] = "Confirm source semantics"

    result = deterministic_structural_validation(ValidationAgentInput.model_validate(value))

    assert result is None


def brief() -> dict[str, object]:
    return {
        "agent_id": "requirement_agent",
        "confidence": 0.95,
        "domain": "Sales",
        "objective": "Analyse sales",
        "business_process": "Order to cash",
        "candidate_grain": "One row per order line",
        "can_proceed": True,
    }


def validation_payload() -> dict[str, object]:
    common = {"confidence": 0.95, "evidence": ["Profiled source"]}
    return {
        "modelling_brief": brief(),
        "source_analysis": {
            **common,
            "agent_id": "source_analysis_agent",
            "can_proceed": True,
            "sources": [],
        },
        "logical_model": {
            **common,
            "agent_id": "model_design_agent",
            "model_name": "Sales",
            "fact_grain": "One row per order line",
            "entities": [
                {
                    "id": "fact_sales",
                    "name": "FactSales",
                    "kind": "fact",
                    "description": "Sales fact",
                    "grain": "One row per order line",
                    "attributes": [
                        {"name": "SalesKey", "data_type": "INTEGER", "key_type": "PK"},
                        {
                            "name": "CustomerKey",
                            "data_type": "INTEGER",
                            "key_type": "FK",
                        },
                    ],
                },
                {
                    "id": "dim_customer",
                    "name": "DimCustomer",
                    "kind": "dimension",
                    "description": "Customer dimension",
                    "attributes": [
                        {
                            "name": "CustomerKey",
                            "data_type": "INTEGER",
                            "key_type": "PK",
                        }
                    ],
                },
            ],
            "relationships": [
                {
                    "from_entity_id": "fact_sales",
                    "to_entity_id": "dim_customer",
                    "cardinality": "many-to-one",
                    "foreign_key": "CustomerKey",
                    "primary_key": "CustomerKey",
                }
            ],
        },
        "mapping_dq": {
            **common,
            "agent_id": "mapping_dq_agent",
            "mappings": [
                {
                    "source": "order_line.customer_id",
                    "target": "FactSales.CustomerKey",
                    "transformation": "Direct",
                    "transformation_type": "Direct",
                    "confidence": "High",
                    "status": "Approved",
                }
            ],
            "dq_rules": [
                {
                    "target": "FactSales.SalesKey",
                    "rule_type": "Not null",
                    "expression": "SalesKey IS NOT NULL",
                    "severity": "Error",
                    "rationale": "Required key",
                    "confidence": "High",
                    "status": "Ready",
                }
            ],
        },
    }
