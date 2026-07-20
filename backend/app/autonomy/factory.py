import json

from app.autonomy.capabilities import CapabilityRegistry
from app.autonomy.mcp_client import MCPClient
from app.autonomy.tools import ToolExecutor, ToolRegistry
from app.config import Settings
from app.services.tool_operations import ToolOperationStore


def build_autonomy_runtime(
    settings: Settings,
    *,
    tool_calling_enabled: bool = True,
) -> tuple[CapabilityRegistry, ToolExecutor]:
    servers = parse_string_map(settings.mcp_servers_json)
    allowlist = {item.strip() for item in settings.mcp_tool_allowlist.split(",") if item.strip()}
    mcp_client = (
        MCPClient(
            servers,
            allowlist,
            settings.mcp_request_timeout,
            settings.mcp_schema_cache_ttl_seconds,
        )
        if servers
        else None
    )
    capabilities = CapabilityRegistry()
    registry = ToolRegistry(mcp_client, enabled=tool_calling_enabled)
    return capabilities, ToolExecutor(
        registry,
        capabilities,
        timeout_seconds=settings.tool_request_timeout,
        operation_store=ToolOperationStore(),
    )


def parse_string_map(value: str) -> dict[str, str]:
    if not value.strip():
        return {}
    parsed = json.loads(value)
    if not isinstance(parsed, dict) or not all(
        isinstance(key, str) and isinstance(item, str) for key, item in parsed.items()
    ):
        raise ValueError("MCP_SERVERS_JSON must be a JSON object of server names to URLs")
    return parsed
