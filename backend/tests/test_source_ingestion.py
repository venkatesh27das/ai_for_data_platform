import io
import json

from openpyxl import Workbook

from app.services.source_ingestion import profile_source


def test_profiles_csv_json_ddl_and_xlsx() -> None:
    csv_profile, _ = profile_source(
        "orders.csv",
        "csv",
        b"order_id,amount,customer_id\n1,12.5,C1\n2,,C2\n",
    )
    csv_table = csv_profile["tables"][0]
    assert csv_table["row_sample_count"] == 2
    assert csv_table["columns"][0]["name"] == "order_id"
    assert csv_table["columns"][0]["data_type"] == "integer"
    assert csv_table["columns"][1]["data_type"] == "number"
    assert csv_table["columns"][1]["null_count"] == 1

    json_profile, _ = profile_source(
        "customers.json",
        "json",
        json.dumps([{"customer_id": "C1", "active": True}]).encode(),
    )
    assert json_profile["tables"][0]["columns"][1]["data_type"] == "boolean"

    ddl_profile, _ = profile_source(
        "sales.ddl",
        "ddl",
        b"CREATE TABLE orders (order_id BIGINT, amount DECIMAL(18,2));",
    )
    assert ddl_profile["tables"][0]["name"] == "orders"

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Products"
    sheet.append(["product_id", "name"])
    sheet.append([1, "Widget"])
    output = io.BytesIO()
    workbook.save(output)
    workbook.close()
    xlsx_profile, _ = profile_source("products.xlsx", "xlsx", output.getvalue())
    assert xlsx_profile["tables"][0]["name"] == "Products"
    assert xlsx_profile["tables"][0]["columns"][0]["data_type"] == "integer"
