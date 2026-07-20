from typing import Any

from app.autonomy.capabilities import CapabilityRegistry
from app.autonomy.contracts import ToolRequest
from app.autonomy.tools import ToolContext, ToolExecutor, ToolRegistry


async def test_skill_allowlist_controls_real_profile_tool_execution() -> None:
    capabilities = CapabilityRegistry()
    executor = ToolExecutor(ToolRegistry(), capabilities)
    context = ToolContext(
        project_id="project-1",
        state={
            "sources": [
                {
                    "name": "orders.csv",
                    "profile": {
                        "tables": [
                            {
                                "name": "orders",
                                "row_sample_count": 2,
                                "columns": [{"name": "order_id"}, {"name": "amount"}],
                            }
                        ]
                    },
                }
            ]
        },
    )
    completed = await executor.execute(
        ToolRequest(
            tool_name="source.profile_summary",
            requested_by="source_analysis_agent",
            skill_id="sources.evidence-analysis",
        ),
        context,
    )
    denied = await executor.execute(
        ToolRequest(
            tool_name="source.profile_summary",
            requested_by="requirement_agent",
            skill_id="requirements.clarification",
        ),
        context,
    )

    assert completed.status == "completed"
    assert completed.result["table_count"] == 1
    assert denied.status == "denied"
    assert capabilities.get("sources.external-metadata").requires_human_approval is True


class FakeMCPClient:
    allowlist = {"mcp.catalog.describe_table"}

    async def call_tool(
        self, server_name: str, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        return {"server": server_name, "tool": tool_name, "arguments": arguments}


async def test_allowlisted_mcp_tool_dispatches_through_executor() -> None:
    capabilities = CapabilityRegistry()
    registry = ToolRegistry(FakeMCPClient())  # type: ignore[arg-type]
    executor = ToolExecutor(registry, capabilities)
    record = await executor.execute(
        ToolRequest(
            tool_name="mcp.catalog.describe_table",
            arguments={"table": "orders"},
            requested_by="source_analysis_agent",
            skill_id="sources.external-metadata",
        ),
        ToolContext(project_id="project-1"),
    )

    assert record.status == "completed"
    assert record.source == "mcp"
    assert record.result["tool"] == "describe_table"
