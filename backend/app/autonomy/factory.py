import json

from app.autonomy.capabilities import CapabilityRegistry
from app.autonomy.mcp_client import MCPClient
from app.autonomy.tools import ToolExecutor, ToolRegistry
from app.config import Settings


def build_autonomy_runtime(
    settings: Settings,
    *,
    tool_calling_enabled: bool = True,
) -> tuple[CapabilityRegistry, ToolExecutor]:
    servers = parse_string_map(settings.mcp_servers_json)
    allowlist = {item.strip() for item in settings.mcp_tool_allowlist.split(",") if item.strip()}
    mcp_client = MCPClient(servers, allowlist, settings.mcp_request_timeout) if servers else None
    capabilities = CapabilityRegistry()
    registry = ToolRegistry(mcp_client, enabled=tool_calling_enabled)
    return capabilities, ToolExecutor(
        registry,
        capabilities,
        timeout_seconds=settings.tool_request_timeout,
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
