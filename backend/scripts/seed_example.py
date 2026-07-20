"""Seed the durable SAP sales analytics showcase project."""

from typing import Any

from app.db.session import SessionLocal
from app.repositories.artifacts import ArtifactRepository
from app.repositories.messages import MessageRepository
from app.repositories.projects import ProjectRepository

PROJECT_NAME = "SAP Sales Order Analytics — Example"

SCENARIO = (
    "Build a sales order analytics dimensional model from SAP S/4HANA at order-line "
    "grain. Use VBAK, VBAP, KNA1, MARA and T001W. Business users need net sales, "
    "ordered quantity, average selling price, discount amount and distinct order count "
    "by customer, product, plant, sales organisation and order date."
)

ARTIFACTS: list[dict[str, Any]] = [
    {
        "artifact_type": "source_preview",
        "name": "SAP Source Assessment",
        "payload": {
            "tables": [
                {
                    "table_name": "VBAK",
                    "role": "Header",
                    "column_count": 42,
                    "description": "Sales document header and commercial status",
                },
                {
                    "table_name": "VBAP",
                    "role": "Transaction",
                    "column_count": 68,
                    "description": "Sales document item, quantity, material and value",
                },
                {
                    "table_name": "KNA1",
                    "role": "Master data",
                    "column_count": 31,
                    "description": "General customer master attributes",
                },
                {
                    "table_name": "MARA",
                    "role": "Master data",
                    "column_count": 27,
                    "description": "General material master attributes",
                },
                {
                    "table_name": "T001W",
                    "role": "Reference",
                    "column_count": 14,
                    "description": "Plant and valuation-area reference data",
                },
            ]
        },
    },
    {
        "artifact_type": "logical_model",
        "name": "Sales Order Analytics Logical Model",
        "payload": {
            "entities": [
                {
                    "id": "fact_sales_order_line",
                    "name": "FactSalesOrderLine",
                    "kind": "fact",
                    "attributes": [
                        {"name": "SalesOrderLineKey", "data_type": "BIGINT", "key_type": "PK"},
                        {"name": "CustomerKey", "data_type": "BIGINT", "key_type": "FK"},
                        {"name": "ProductKey", "data_type": "BIGINT", "key_type": "FK"},
                        {"name": "PlantKey", "data_type": "BIGINT", "key_type": "FK"},
                        {"name": "OrderDateKey", "data_type": "INTEGER", "key_type": "FK"},
                        {"name": "OrderedQuantity", "data_type": "DECIMAL(18,3)"},
                        {"name": "NetSalesAmount", "data_type": "DECIMAL(18,2)"},
                        {"name": "DiscountAmount", "data_type": "DECIMAL(18,2)"},
                        {"name": "TransactionCurrency", "data_type": "CHAR(3)"},
                        {"name": "IsCancelled", "data_type": "BOOLEAN"},
                    ],
                },
                {
                    "id": "dim_customer",
                    "name": "DimCustomer",
                    "kind": "dimension",
                    "attributes": [
                        {"name": "CustomerKey", "data_type": "BIGINT", "key_type": "PK"},
                        {"name": "CustomerNumber", "data_type": "STRING"},
                        {"name": "CustomerName", "data_type": "STRING"},
                        {"name": "CountryCode", "data_type": "CHAR(2)"},
                        {"name": "CustomerGroup", "data_type": "STRING"},
                    ],
                },
                {
                    "id": "dim_product",
                    "name": "DimProduct",
                    "kind": "dimension",
                    "attributes": [
                        {"name": "ProductKey", "data_type": "BIGINT", "key_type": "PK"},
                        {"name": "MaterialNumber", "data_type": "STRING"},
                        {"name": "MaterialType", "data_type": "STRING"},
                        {"name": "BaseUnit", "data_type": "STRING"},
                        {"name": "ProductHierarchy", "data_type": "STRING"},
                    ],
                },
                {
                    "id": "dim_plant",
                    "name": "DimPlant",
                    "kind": "dimension",
                    "attributes": [
                        {"name": "PlantKey", "data_type": "BIGINT", "key_type": "PK"},
                        {"name": "PlantCode", "data_type": "STRING"},
                        {"name": "PlantName", "data_type": "STRING"},
                        {"name": "CountryCode", "data_type": "CHAR(2)"},
                    ],
                },
                {
                    "id": "dim_date",
                    "name": "DimDate",
                    "kind": "dimension",
                    "attributes": [
                        {"name": "DateKey", "data_type": "INTEGER", "key_type": "PK"},
                        {"name": "FullDate", "data_type": "DATE"},
                        {"name": "MonthName", "data_type": "STRING"},
                        {"name": "Quarter", "data_type": "INTEGER"},
                        {"name": "FiscalYear", "data_type": "INTEGER"},
                    ],
                },
            ],
            "relationships": [
                {
                    "from_entity_id": "fact_sales_order_line",
                    "to_entity_id": "dim_customer",
                    "cardinality": "many-to-one",
                },
                {
                    "from_entity_id": "fact_sales_order_line",
                    "to_entity_id": "dim_product",
                    "cardinality": "many-to-one",
                },
                {
                    "from_entity_id": "fact_sales_order_line",
                    "to_entity_id": "dim_plant",
                    "cardinality": "many-to-one",
                },
                {
                    "from_entity_id": "fact_sales_order_line",
                    "to_entity_id": "dim_date",
                    "cardinality": "many-to-one",
                },
            ],
            "mapping_count": 12,
            "dq_rule_count": 8,
            "review_count": 2,
        },
    },
    {
        "artifact_type": "mappings",
        "name": "Source-to-Target Mappings",
        "payload": {
            "items": [
                {
                    "source": "VBAK.VBELN + VBAP.POSNR",
                    "target": "FactSalesOrderLine.SalesOrderLineKey",
                    "transformation": "Deterministic surrogate-key hash",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "VBAK.KUNNR",
                    "target": "DimCustomer.CustomerNumber",
                    "transformation": "Trim leading zeros",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "KNA1.NAME1",
                    "target": "DimCustomer.CustomerName",
                    "transformation": "Direct",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "VBAP.MATNR",
                    "target": "DimProduct.MaterialNumber",
                    "transformation": "Trim leading zeros",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "MARA.MTART",
                    "target": "DimProduct.MaterialType",
                    "transformation": "Direct",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "VBAP.WERKS",
                    "target": "DimPlant.PlantCode",
                    "transformation": "Direct",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "T001W.NAME1",
                    "target": "DimPlant.PlantName",
                    "transformation": "Direct",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "VBAK.AUDAT",
                    "target": "FactSalesOrderLine.OrderDateKey",
                    "transformation": "Format YYYYMMDD",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "VBAP.KWMENG",
                    "target": "FactSalesOrderLine.OrderedQuantity",
                    "transformation": "Cast DECIMAL(18,3)",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "VBAP.NETWR",
                    "target": "FactSalesOrderLine.NetSalesAmount",
                    "transformation": "Cast DECIMAL(18,2)",
                    "confidence": "High",
                    "status": "Approved",
                },
                {
                    "source": "Pricing conditions",
                    "target": "FactSalesOrderLine.DiscountAmount",
                    "transformation": "Sum discount condition values",
                    "confidence": "Medium",
                    "status": "Needs review",
                },
                {
                    "source": "VBAK.GBSTK + VBAP.ABGRU",
                    "target": "FactSalesOrderLine.IsCancelled",
                    "transformation": "GBSTK='C' AND ABGRU populated",
                    "confidence": "Medium",
                    "status": "Needs review",
                },
            ]
        },
    },
    {
        "artifact_type": "dq_rules",
        "name": "Data Quality Rules",
        "payload": {
            "items": [
                {
                    "target": "FactSalesOrderLine.SalesOrderLineKey",
                    "rule_type": "Unique",
                    "expression": "COUNT(*) = COUNT(DISTINCT SalesOrderLineKey)",
                    "severity": "Error",
                    "status": "Ready",
                },
                {
                    "target": "FactSalesOrderLine.CustomerKey",
                    "rule_type": "Referential integrity",
                    "expression": "CustomerKey exists in DimCustomer",
                    "severity": "Error",
                    "status": "Ready",
                },
                {
                    "target": "FactSalesOrderLine.ProductKey",
                    "rule_type": "Referential integrity",
                    "expression": "ProductKey exists in DimProduct",
                    "severity": "Error",
                    "status": "Ready",
                },
                {
                    "target": "FactSalesOrderLine.OrderedQuantity",
                    "rule_type": "Valid range",
                    "expression": "OrderedQuantity >= 0",
                    "severity": "Warning",
                    "status": "Ready",
                },
                {
                    "target": "FactSalesOrderLine.TransactionCurrency",
                    "rule_type": "Accepted values",
                    "expression": "ISO 4217 currency code",
                    "severity": "Error",
                    "status": "Ready",
                },
                {
                    "target": "FactSalesOrderLine.OrderDateKey",
                    "rule_type": "Date validity",
                    "expression": "Order date is not in the future",
                    "severity": "Warning",
                    "status": "Ready",
                },
                {
                    "target": "DimCustomer.CustomerNumber",
                    "rule_type": "Not null",
                    "expression": "CustomerNumber IS NOT NULL",
                    "severity": "Error",
                    "status": "Ready",
                },
                {
                    "target": "DimProduct.MaterialNumber",
                    "rule_type": "Not null",
                    "expression": "MaterialNumber IS NOT NULL",
                    "severity": "Error",
                    "status": "Ready",
                },
            ]
        },
    },
    {
        "artifact_type": "validation",
        "name": "Model Validation Findings",
        "payload": {
            "findings": [
                {
                    "severity": "High",
                    "category": "Mapping",
                    "message": "Discount conditions need an authoritative condition-type list.",
                    "recommended_action": (
                        "Confirm discount condition types with the SAP pricing owner."
                    ),
                    "requires_human": True,
                },
                {
                    "severity": "High",
                    "category": "Business rule",
                    "message": "Cancelled-order logic may exclude partially rejected lines.",
                    "recommended_action": (
                        "Confirm whether item rejection alone should mark a line cancelled."
                    ),
                    "requires_human": True,
                },
                {
                    "severity": "Medium",
                    "category": "Currency",
                    "message": (
                        "USD reporting amount requires an exchange-rate source and rate type."
                    ),
                    "recommended_action": "Use TCURR with an approved exchange-rate type.",
                    "requires_human": False,
                },
                {
                    "severity": "Low",
                    "category": "Naming",
                    "message": "Entity and attribute naming is internally consistent.",
                    "recommended_action": "No action required.",
                    "requires_human": False,
                },
            ]
        },
    },
]


def main() -> None:
    with SessionLocal() as db:
        projects = ProjectRepository(db)
        project = next((item for item in projects.list() if item.name == PROJECT_NAME), None)
        if project is None:
            project = projects.create(name=PROJECT_NAME, objective=SCENARIO)
        project = projects.update(
            project,
            status="needs_review",
            workflow_stage="validation",
            source_count=5,
            entity_count=5,
            mapping_count=12,
            dq_rule_count=8,
            review_count=2,
        )

        messages = MessageRepository(db)
        if not messages.list_for_project(project.id):
            messages.create(project_id=project.id, role="user", content=SCENARIO)
            messages.create(
                project_id=project.id,
                role="assistant",
                content=(
                    "I identified an order-to-cash analytical process and propose one fact row "
                    "per SAP sales-order line. Before generation: should cancelled lines remain "
                    "available for analysis, and should order count mean distinct VBAK-VBELN?"
                ),
            )
            messages.create(
                project_id=project.id,
                role="user",
                content=(
                    "Keep cancelled lines with a flag. Order count is the distinct sales-order "
                    "number. Use transaction currency and a USD reporting amount."
                ),
            )
            messages.create(
                project_id=project.id,
                role="assistant",
                content=(
                    "The initial model and supporting assets are ready. I created one order-line "
                    "fact, four conformed dimensions, 12 mappings and 8 DQ rules. Two business "
                    "decisions still need review. Open an asset below to inspect it."
                ),
            )

        artifact_repository = ArtifactRepository(db)
        existing_types = {
            artifact.artifact_type for artifact in artifact_repository.list_for_project(project.id)
        }
        for definition in ARTIFACTS:
            if definition["artifact_type"] in existing_types:
                continue
            artifact_repository.create(
                project_id=project.id,
                artifact_type=definition["artifact_type"],
                name=definition["name"],
                version=1,
                status="ready",
                payload=definition["payload"],
            )

        print(project.id)


if __name__ == "__main__":
    main()
