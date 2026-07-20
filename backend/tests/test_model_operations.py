from app.agents.contracts import LogicalModelProposal, ModelAttribute, ModelEntity
from app.agents.model_operations import (
    analyse_operation_impact,
    apply_model_operations,
    parse_model_operations,
)


def model() -> LogicalModelProposal:
    return LogicalModelProposal(
        model_name="Sales",
        fact_grain="One row per order line",
        entities=[
            ModelEntity(
                id="fact_sales",
                name="FactSales",
                kind="fact",
                description="Sales fact",
                grain="One row per order line",
                attributes=[ModelAttribute(name="SalesKey", data_type="INT", key_type="PK")],
            ),
            ModelEntity(
                id="dim_customer",
                name="DimCustomer",
                kind="dimension",
                description="Customer",
                attributes=[
                    ModelAttribute(name="CustomerKey", data_type="INT", key_type="PK"),
                    ModelAttribute(name="Geography", data_type="STRING"),
                ],
            ),
        ],
        relationships=[],
        confidence=0.9,
    )


def test_natural_language_operations_are_typed() -> None:
    operations = parse_model_operations(
        "Change the grain to invoice line; make Customer SCD Type 2; "
        "split Geography into a dimension."
    )

    assert [item.operation for item in operations] == [
        "change_grain",
        "set_dimension_history",
        "split_dimension",
    ]
    assert operations[0].value == "One row per invoice line"
    assert operations[1].target == "Customer"
    assert operations[2].value == "DimGeography"


def test_typed_operations_apply_validated_model_mutations() -> None:
    operations = parse_model_operations(
        "Change the grain to invoice line; make Customer SCD Type 2; "
        "split Geography into a dimension."
    )
    result = apply_model_operations(model(), operations)

    customer = next(entity for entity in result.entities if entity.name == "DimCustomer")
    geography = next(entity for entity in result.entities if entity.name == "DimGeography")
    fact = next(entity for entity in result.entities if entity.kind == "fact")
    assert result.fact_grain == "One row per invoice line"
    assert fact.grain == "One row per invoice line"
    assert customer.history_strategy == "type_2"
    assert {item.name for item in customer.attributes} >= {
        "EffectiveFrom",
        "EffectiveTo",
        "IsCurrent",
    }
    assert any(attribute.name == "Geography" for attribute in geography.attributes)
    assert any(attribute.name == "GeographyKey" for attribute in fact.attributes)
    assert result.relationships[-1].to_entity_id == geography.id
    assert result.execution_mode == "deterministic"


def test_operation_impact_names_entities_assets_and_risks() -> None:
    operations = parse_model_operations("Make Customer SCD Type 2")
    impact = analyse_operation_impact(model(), operations)

    assert impact.material is True
    assert impact.approval_required is True
    assert impact.affected_entities == ["DimCustomer"]
    assert impact.affected_artifacts == [
        "logical_model",
        "mappings",
        "dq_rules",
        "validation",
    ]
    assert impact.changes == ["Set DimCustomer history to type 2"]
    assert impact.risks


def test_invalid_operation_target_is_rejected_before_mutation() -> None:
    operations = parse_model_operations("Make Supplier SCD Type 2")
    impact = analyse_operation_impact(model(), operations)

    assert impact.valid is False
    assert impact.approval_required is False
    assert impact.validation_errors == [
        "Dimension not found for history operation: Supplier"
    ]
