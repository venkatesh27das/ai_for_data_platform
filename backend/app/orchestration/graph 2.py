from typing import Any

from langgraph.graph import END, START, StateGraph

from app.orchestration.state import ModellingGraphState


def load_project_state(state: ModellingGraphState) -> dict[str, Any]:
    return {"workflow_stage": "understanding", "run_status": "running"}


def understand_scenario(state: ModellingGraphState) -> dict[str, Any]:
    """Mock requirement-agent node; structured extraction follows in the next iteration."""
    message = state.get("user_message") or ""
    return {
        "modelling_brief": {"objective": message, "assumptions": [], "blocking_questions": []},
        "workflow_stage": "scenario_understood",
    }


def present_response(state: ModellingGraphState) -> dict[str, Any]:
    return {"workflow_stage": "awaiting_input", "run_status": "completed"}


def build_graph() -> Any:
    graph = StateGraph(ModellingGraphState)
    graph.add_node("load_project_state", load_project_state)
    graph.add_node("understand_scenario", understand_scenario)
    graph.add_node("present_response", present_response)
    graph.add_edge(START, "load_project_state")
    graph.add_edge("load_project_state", "understand_scenario")
    graph.add_edge("understand_scenario", "present_response")
    graph.add_edge("present_response", END)
    return graph.compile()


modelling_graph = build_graph()
