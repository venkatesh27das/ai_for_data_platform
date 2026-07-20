from datetime import timedelta
from typing import Any

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client


class MCPClient:
    """Short-lived, allow-listed Streamable HTTP MCP client."""

    def __init__(
        self, servers: dict[str, str], allowlist: set[str], timeout_seconds: int = 30
    ) -> None:
        self.servers = servers
        self.allowlist = allowlist
        self.timeout = timedelta(seconds=timeout_seconds)

    async def list_tools(self, server_name: str) -> list[dict[str, Any]]:
        url = self._server_url(server_name)
        async with streamable_http_client(url) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                response = await session.list_tools()
                return [
                    {
                        "name": f"mcp.{server_name}.{tool.name}",
                        "description": tool.description or "MCP tool",
                        "input_schema": tool.inputSchema,
                    }
                    for tool in response.tools
                    if f"mcp.{server_name}.{tool.name}" in self.allowlist
                ]

    async def call_tool(
        self, server_name: str, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        qualified = f"mcp.{server_name}.{tool_name}"
        if qualified not in self.allowlist:
            raise PermissionError(f"MCP tool is not allow-listed: {qualified}")
        url = self._server_url(server_name)
        async with streamable_http_client(url) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                response = await session.call_tool(
                    tool_name,
                    arguments=arguments,
                    read_timeout_seconds=self.timeout,
                )
                return {
                    "is_error": bool(response.isError),
                    "structured_content": response.structuredContent,
                    "content": [item.model_dump(mode="json") for item in response.content],
                }

    def _server_url(self, server_name: str) -> str:
        try:
            return self.servers[server_name]
        except KeyError as exc:
            raise ValueError(f"Unknown MCP server: {server_name}") from exc
