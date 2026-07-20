import re

from app.agents.contracts import (
    LogicalModelProposal,
    ModelAttribute,
    ModelEntity,
    ModelOperation,
    ModelOperationImpact,
    ModelRelationship,
)


def parse_model_operations(message: str) -> list[ModelOperation]:
    operations: list[ModelOperation] = []
    grain = re.search(
        r"(?:change|set|update)\s+(?:the\s+)?grain\s+to\s+([^.;\n]+)",
        message,
        re.IGNORECASE,
    )
    if grain:
        value = grain.group(1).strip()
        operations.append(
            ModelOperation(
                operation="change_grain",
                target="fact",
                value=normalize_grain(value),
                instruction=grain.group(0),
            )
        )
    history = re.search(
        r"(?:make|set|change)\s+(?:the\s+)?([A-Za-z][A-Za-z0-9 _-]*?)\s+"
        r"(?:to\s+|as\s+)?SCD\s*(?:Type\s*)?([012])",
        message,
        re.IGNORECASE,
    )
    if history:
        operations.append(
            ModelOperation(
                operation="set_dimension_history",
                target=history.group(1).strip(),
                value=f"type_{history.group(2)}",
                instruction=history.group(0),
            )
        )
    split = re.search(
        r"(?:split|move|promote)\s+([A-Za-z][A-Za-z0-9 _-]*?)\s+"
        r"(?:out\s+)?(?:into|to|as)\s+(?:a\s+)?(?:new\s+)?dimension",
        message,
        re.IGNORECASE,
    )
    if split:
        name = split.group(1).strip()
        operations.append(
            ModelOperation(
                operation="split_dimension",
                target=name,
                value=dimension_name(name),
                instruction=split.group(0),
            )
        )
    return operations


def apply_model_operations(
    model: LogicalModelProposal, operations: list[ModelOperation]
) -> LogicalModelProposal:
    current = model.model_copy(deep=True)
    decisions = list(current.open_decisions)
    for operation in operations:
        if operation.operation == "change_grain":
            current.fact_grain = operation.value
            for entity in current.entities:
                if entity.kind == "fact":
                    entity.grain = operation.value
            decisions.append(f"Applied grain change: {operation.value}")
        elif operation.operation == "set_dimension_history":
            dimension_entity = find_dimension(current, operation.target)
            if dimension_entity is None:
                raise ValueError(f"Dimension not found for history operation: {operation.target}")
            strategy = operation.value
            if strategy not in {"type_0", "type_1", "type_2"}:
                raise ValueError(f"Unsupported history strategy: {strategy}")
            dimension_entity.history_strategy = strategy  # type: ignore[assignment]
            if strategy == "type_2":
                ensure_attributes(
                    dimension_entity,
                    [
                        ModelAttribute(
                            name="EffectiveFrom",
                            data_type="DATE",
                            source_evidence=["SCD Type 2 modeller operation"],
                        ),
                        ModelAttribute(
                            name="EffectiveTo",
                            data_type="DATE",
                            source_evidence=["SCD Type 2 modeller operation"],
                        ),
                        ModelAttribute(
                            name="IsCurrent",
                            data_type="BOOLEAN",
                            source_evidence=["SCD Type 2 modeller operation"],
                        ),
                    ],
                )
            decisions.append(
                f"Applied {strategy.replace('_', ' ')} to {dimension_entity.name}"
            )
        elif operation.operation == "split_dimension":
            split_attribute_to_dimension(current, operation.target, operation.value)
            decisions.append(f"Split {operation.target} into {operation.value}")
    current.open_decisions = list(dict.fromkeys(decisions))
    current.execution_mode = "deterministic"
    current.evidence = [
        *current.evidence,
        *(f"Modeller instruction: {operation.instruction}" for operation in operations),
    ]
    return LogicalModelProposal.model_validate(current)


def analyse_operation_impact(
    model: LogicalModelProposal, operations: list[ModelOperation]
) -> ModelOperationImpact:
    entities: list[str] = []
    changes: list[str] = []
    risks: list[str] = []
    validation_errors: list[str] = []
    for operation in operations:
        if operation.operation == "change_grain":
            fact = next((item for item in model.entities if item.kind == "fact"), None)
            if fact:
                entities.append(fact.name)
            else:
                validation_errors.append("The logical model has no fact entity to re-grain")
            changes.append(f"Change fact grain from '{model.fact_grain}' to '{operation.value}'")
            risks.append("Existing measures, uniqueness rules, and mappings may change meaning")
        elif operation.operation == "set_dimension_history":
            entity = find_dimension(model, operation.target)
            entities.append(entity.name if entity else operation.target)
            if entity is None:
                validation_errors.append(
                    f"Dimension not found for history operation: {operation.target}"
                )
            changes.append(
                f"Set {entity.name if entity else operation.target} history to "
                f"{operation.value.replace('_', ' ')}"
            )
            risks.append("Dimension keys, temporal joins, and historical row counts may change")
        elif operation.operation == "split_dimension":
            entities.extend([operation.target, operation.value])
            if find_dimension(model, operation.value) is not None:
                validation_errors.append(f"Dimension already exists: {operation.value}")
            changes.append(
                f"Move {operation.target} into the new {operation.value} dimension"
            )
            risks.append("A new foreign key and relationship will affect mappings and DQ rules")
    unique_entities = list(dict.fromkeys(entities))
    unique_risks = list(dict.fromkeys(risks))
    return ModelOperationImpact(
        summary=(
            f"{len(operations)} structural model change(s) affect "
            f"{len(unique_entities)} model entity reference(s) and all downstream artifacts."
        ),
        affected_entities=unique_entities,
        affected_artifacts=["logical_model", "mappings", "dq_rules", "validation"],
        changes=changes,
        risks=unique_risks,
        validation_errors=validation_errors,
        valid=not validation_errors,
        material=bool(operations),
        approval_required=bool(operations) and not validation_errors,
    )


def split_attribute_to_dimension(
    model: LogicalModelProposal, attribute_name: str, dimension: str
) -> None:
    if find_dimension(model, dimension) is not None:
        raise ValueError(f"Dimension already exists: {dimension}")
    normalized_attribute = normalize_name(attribute_name)
    moved: list[ModelAttribute] = []
    for entity in model.entities:
        retained = []
        for attribute in entity.attributes:
            if normalize_name(attribute.name) == normalized_attribute:
                moved.append(attribute)
            else:
                retained.append(attribute)
        entity.attributes = retained
    if not moved:
        moved = [
            ModelAttribute(
                name=pascal_case(attribute_name),
                data_type="STRING",
                source_evidence=["Created from modeller split-dimension instruction"],
            )
        ]
    entity_id = normalize_name(dimension)
    key_name = f"{pascal_case(attribute_name)}Key"
    dimension_entity = ModelEntity(
        id=entity_id,
        name=dimension,
        kind="dimension",
        description=f"Dimension created from {attribute_name}",
        attributes=[
            ModelAttribute(
                name=key_name,
                data_type="INTEGER",
                key_type="PK",
                source_evidence=["Generated surrogate key for split dimension"],
            ),
            *moved,
        ],
    )
    model.entities.append(dimension_entity)
    fact = next((entity for entity in model.entities if entity.kind == "fact"), None)
    if fact is None:
        raise ValueError("The logical model has no fact entity")
    ensure_attributes(
        fact,
        [
            ModelAttribute(
                name=key_name,
                data_type="INTEGER",
                key_type="FK",
                source_evidence=["Generated relationship for split dimension"],
            )
        ],
    )
    model.relationships.append(
        ModelRelationship(
            from_entity_id=fact.id,
            to_entity_id=dimension_entity.id,
            cardinality="many-to-one",
            foreign_key=key_name,
            primary_key=key_name,
            evidence=["Modeller requested a separate dimension"],
        )
    )


def find_dimension(model: LogicalModelProposal, name: str) -> ModelEntity | None:
    target = normalize_name(name.removeprefix("Dim"))
    return next(
        (
            entity
            for entity in model.entities
            if entity.kind == "dimension"
            and normalize_name(entity.name.removeprefix("Dim")) == target
        ),
        None,
    )


def ensure_attributes(entity: ModelEntity, attributes: list[ModelAttribute]) -> None:
    existing = {normalize_name(attribute.name) for attribute in entity.attributes}
    entity.attributes.extend(
        attribute
        for attribute in attributes
        if normalize_name(attribute.name) not in existing
    )


def normalize_grain(value: str) -> str:
    return value if re.match(r"(?i)^one row per ", value) else f"One row per {value}"


def dimension_name(value: str) -> str:
    name = pascal_case(value)
    return name if name.lower().startswith("dim") else f"Dim{name}"


def pascal_case(value: str) -> str:
    return "".join(part.capitalize() for part in re.findall(r"[A-Za-z0-9]+", value))


def normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())
