from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_project_service
from app.autonomy.contracts import SkillManifest
from app.autonomy.factory import build_autonomy_runtime
from app.config import Settings, get_settings
from app.services.projects import ProjectService

router = APIRouter(tags=["autonomy"])


@router.get("/autonomy/skills", response_model=list[SkillManifest])
def list_skills(settings: Annotated[Settings, Depends(get_settings)]) -> list[SkillManifest]:
    capabilities, _ = build_autonomy_runtime(settings)
    return capabilities.all()


@router.get("/autonomy/tools")
def list_tools(settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, Any]:
    _, executor = build_autonomy_runtime(settings)
    return {
        "tools": executor.registry.names(),
        "mcp_configured": executor.registry.mcp_client is not None,
    }


@router.post("/autonomy/mcp/{server_name}/test")
async def test_mcp_server(
    server_name: str,
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, Any]:
    _, executor = build_autonomy_runtime(settings)
    client = executor.registry.mcp_client
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No MCP servers are configured.",
        )
    try:
        tools = await client.list_tools(server_name)
        return {"ok": True, "server": server_name, "tools": tools}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc) or type(exc).__name__,
        ) from exc


@router.get("/projects/{project_id}/execution")
def get_execution_state(
    project_id: str,
    projects: Annotated[ProjectService, Depends(get_project_service)],
) -> dict[str, Any]:
    state = projects.get(project_id).workflow_state
    brief = state.get("modelling_brief")
    clarification_questions = (
        brief.get("blocking_questions", []) if isinstance(brief, dict) else []
    )
    return {
        "plan": state.get("execution_plan"),
        "tool_trace": state.get("tool_trace", []),
        "decision_trace": state.get("decision_trace", []),
        "approval_status": state.get("approval_status"),
        "run_status": state.get("run_status"),
        "workflow_stage": state.get("workflow_stage"),
        "clarification_questions": clarification_questions
        if state.get("workflow_stage") == "awaiting_clarification"
        else [],
        "requirement_coverage": brief.get("requirement_coverage", {})
        if isinstance(brief, dict)
        else {},
        "operation_impact": state.get("operation_impact"),
    }
