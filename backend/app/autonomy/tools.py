import asyncio
from collections.abc import Awaitable, Callable
from time import perf_counter
from typing import Any

from pydantic import BaseModel, Field

from app.autonomy.capabilities import CapabilityRegistry
from app.autonomy.contracts import ToolExecutionRecord, ToolRequest
from app.autonomy.mcp_client import MCPClient
from app.services.tool_operations import ToolOperationStore


class ToolContext(BaseModel):
    project_id: str
    run_id: str | None = None
    state: dict[str, Any] = Field(default_factory=dict)


ToolHandler = Callable[[dict[str, Any], ToolContext], Awaitable[dict[str, Any]]]


class ToolDefinition(BaseModel):
    name: str
    description: str
    input_schema: dict[str, Any] = Field(default_factory=dict)
    source: str = "builtin"
    handler: ToolHandler

    model_config = {"arbitrary_types_allowed": True}


class ToolRegistry:
    def __init__(self, mcp_client: MCPClient | None = None, *, enabled: bool = True) -> None:
        self._tools: dict[str, ToolDefinition] = {}
        self.mcp_client = mcp_client
        self.enabled = enabled
        self.register(
            ToolDefinition(
                name="source.profile_summary",
                description="Summarize persisted source profiles without inventing statistics.",
                input_schema={"type": "object", "properties": {}},
                handler=source_profile_summary,
            )
        )
        self.register(
            ToolDefinition(
                name="project.workflow_context",
                description="Return the available typed workflow artifacts and their counts.",
                input_schema={"type": "object", "properties": {}},
                handler=workflow_context,
            )
        )

    def register(self, definition: ToolDefinition) -> None:
        if definition.name in self._tools:
            raise ValueError(f"Duplicate tool: {definition.name}")
        self._tools[definition.name] = definition

    def names(self) -> list[str]:
        if not self.enabled:
            return []
        mcp_names = self.mcp_client.allowlist if self.mcp_client is not None else set()
        return sorted([*self._tools, *mcp_names])

    def get(self, name: str) -> ToolDefinition:
        if not self.enabled:
            raise PermissionError("Tool calling is disabled in provider settings")
        if name.startswith("mcp."):
            return self._mcp_definition(name)
        try:
            return self._tools[name]
        except KeyError as exc:
            raise ValueError(f"Unknown tool: {name}") from exc

    async def resolve(self, name: str) -> ToolDefinition:
        definition = self.get(name)
        if not name.startswith("mcp.") or self.mcp_client is None:
            return definition
        _, server_name, _ = name.split(".", 2)
        available = await self.mcp_client.list_tools(server_name)
        metadata = next((item for item in available if item.get("name") == name), None)
        if metadata is None:
            raise ValueError(f"Allow-listed MCP tool is not advertised by its server: {name}")
        return definition.model_copy(
            update={
                "description": str(metadata.get("description") or definition.description),
                "input_schema": metadata.get("input_schema") or {},
            }
        )

    def _mcp_definition(self, name: str) -> ToolDefinition:
        if self.mcp_client is None:
            raise ValueError("No MCP client is configured")
        parts = name.split(".", 2)
        if len(parts) != 3:
            raise ValueError(f"Invalid MCP tool name: {name}")
        _, server_name, tool_name = parts

        async def call(arguments: dict[str, Any], _: ToolContext) -> dict[str, Any]:
            assert self.mcp_client is not None
            return await self.mcp_client.call_tool(server_name, tool_name, arguments)

        return ToolDefinition(
            name=name,
            description=f"Allow-listed MCP tool {tool_name} on {server_name}",
            source="mcp",
            handler=call,
        )


class ToolExecutor:
    def __init__(
        self,
        registry: ToolRegistry,
        capabilities: CapabilityRegistry,
        timeout_seconds: float = 30,
        operation_store: ToolOperationStore | None = None,
    ) -> None:
        self.registry = registry
        self.capabilities = capabilities
        self.timeout_seconds = timeout_seconds
        self.operation_store = operation_store

    async def execute(self, request: ToolRequest, context: ToolContext) -> ToolExecutionRecord:
        started = perf_counter()
        allowed = self.capabilities.allowed_tools(request.skill_id)
        wildcard_allowed = request.tool_name.startswith("mcp.") and "mcp.*" in allowed
        if request.tool_name not in allowed and not wildcard_allowed:
            return ToolExecutionRecord(
                request_id=request.id,
                tool_name=request.tool_name,
                requested_by=request.requested_by,
                skill_id=request.skill_id,
                plan_step_id=request.plan_step_id,
                status="denied",
                arguments=request.arguments,
                error="The selected skill does not allow this tool.",
            )
        fingerprint: str | None = None
        try:
            definition = await self.registry.resolve(request.tool_name)
            validate_tool_arguments(request.arguments, definition.input_schema)
            fingerprint = self._fingerprint(request, context)
            if fingerprint is not None and self.operation_store is not None:
                cached = self.operation_store.completed_result(fingerprint)
                if cached is not None:
                    return ToolExecutionRecord(
                        request_id=request.id,
                        tool_name=request.tool_name,
                        requested_by=request.requested_by,
                        skill_id=request.skill_id,
                        plan_step_id=request.plan_step_id,
                        status="completed",
                        arguments=request.arguments,
                        result=cached,
                        source="mcp" if definition.source == "mcp" else "builtin",
                        cached=True,
                    )
                self.operation_store.mark_pending(
                    fingerprint=fingerprint,
                    project_id=context.project_id,
                    run_id=context.run_id,
                    tool_name=request.tool_name,
                    arguments=request.arguments,
                )
            result = await asyncio.wait_for(
                definition.handler(request.arguments, context),
                timeout=self.timeout_seconds,
            )
            if result.get("is_error") is True:
                raise RuntimeError(mcp_error_message(result))
            if fingerprint is not None and self.operation_store is not None:
                self.operation_store.finish(fingerprint, status="completed", result=result)
            return ToolExecutionRecord(
                request_id=request.id,
                tool_name=request.tool_name,
                requested_by=request.requested_by,
                skill_id=request.skill_id,
                plan_step_id=request.plan_step_id,
                status="completed",
                arguments=request.arguments,
                result=result,
                duration_ms=round((perf_counter() - started) * 1000, 2),
                source="mcp" if definition.source == "mcp" else "builtin",
            )
        except Exception as exc:
            if fingerprint is not None and self.operation_store:
                self.operation_store.finish(
                    fingerprint,
                    status="failed",
                    error=str(exc) or type(exc).__name__,
                )
            return ToolExecutionRecord(
                request_id=request.id,
                tool_name=request.tool_name,
                requested_by=request.requested_by,
                skill_id=request.skill_id,
                plan_step_id=request.plan_step_id,
                status="failed",
                arguments=request.arguments,
                error=str(exc) or type(exc).__name__,
                duration_ms=round((perf_counter() - started) * 1000, 2),
                source="mcp" if request.tool_name.startswith("mcp.") else "builtin",
            )

    def _fingerprint(self, request: ToolRequest, context: ToolContext) -> str | None:
        if self.operation_store is None or request.plan_step_id is None:
            return None
        plan = context.state.get("execution_plan")
        plan_id = str(plan.get("plan_id", "")) if isinstance(plan, dict) else ""
        if not plan_id:
            return None
        return self.operation_store.fingerprint(
            project_id=context.project_id,
            plan_id=plan_id,
            step_id=request.plan_step_id,
            tool_name=request.tool_name,
            arguments=request.arguments,
        )


async def source_profile_summary(_: dict[str, Any], context: ToolContext) -> dict[str, Any]:
    tables: list[dict[str, Any]] = []
    for source in context.state.get("sources", []):
        if not isinstance(source, dict):
            continue
        profile = source.get("profile")
        if not isinstance(profile, dict):
            continue
        for table in profile.get("tables", []):
            if not isinstance(table, dict):
                continue
            columns = table.get("columns", [])
            tables.append(
                {
                    "source": source.get("name"),
                    "table": table.get("name"),
                    "sampled_rows": table.get("row_sample_count", 0),
                    "column_count": len(columns) if isinstance(columns, list) else 0,
                    "columns": columns,
                }
            )
    return {"tables": tables, "table_count": len(tables)}


async def workflow_context(_: dict[str, Any], context: ToolContext) -> dict[str, Any]:
    state = context.state
    return {
        "project_id": context.project_id,
        "available": [
            name
            for name in ("modelling_brief", "source_analysis", "logical_model", "mapping_dq")
            if state.get(name) is not None
        ],
        "workflow_stage": state.get("workflow_stage"),
    }


def validate_tool_arguments(arguments: dict[str, Any], schema: dict[str, Any]) -> None:
    if not schema:
        return
    if schema.get("type") == "object" and not isinstance(arguments, dict):
        raise ValueError("Tool arguments must be an object")
    required = schema.get("required", [])
    if isinstance(required, list):
        missing = [name for name in required if isinstance(name, str) and name not in arguments]
        if missing:
            raise ValueError(f"Missing required tool arguments: {', '.join(missing)}")
    properties = schema.get("properties", {})
    if not isinstance(properties, dict):
        return
    expected_types: dict[str, type[Any] | tuple[type[Any], ...]] = {
        "string": str,
        "integer": int,
        "number": (int, float),
        "boolean": bool,
        "object": dict,
        "array": list,
    }
    for name, value in arguments.items():
        property_schema = properties.get(name)
        if not isinstance(property_schema, dict):
            if schema.get("additionalProperties") is False:
                raise ValueError(f"Unexpected tool argument: {name}")
            continue
        expected = expected_types.get(str(property_schema.get("type")))
        if expected is not None and not isinstance(value, expected):
            raise ValueError(f"Tool argument {name} has an invalid type")


def mcp_error_message(result: dict[str, Any]) -> str:
    content = result.get("content")
    if isinstance(content, list) and content:
        first = content[0]
        if isinstance(first, dict) and first.get("text"):
            return f"MCP tool reported an error: {first['text']}"
    return "MCP tool reported an error"
