from collections.abc import AsyncIterator
from typing import Any

from pydantic import BaseModel

from app.services.workflows import WorkflowService


class FakeProvider:
    name = "fake"
    model = "fake-model"

    async def health_check(self) -> dict[str, Any]:
        return {"ok": True}

    async def list_models(self) -> list[str]:
        return [self.model]

    async def generate_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> str:
        return "Hello"

    async def generate_structured(
        self,
        messages: list[dict[str, Any]],
        response_model: type[BaseModel],
        *,
        temperature: float | None = None,
    ) -> BaseModel:
        raise NotImplementedError

    async def stream_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> AsyncIterator[str]:
        assert messages[0]["role"] == "system"
        for token in ["Candidate ", "grain"]:
            yield token

    async def invoke_tools(
        self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]
    ) -> dict[str, Any]:
        return {}


async def test_workflow_prepares_graph_and_streams_provider_tokens() -> None:
    workflow = WorkflowService(FakeProvider())  # type: ignore[arg-type]
    await workflow.prepare(
        project_id="project-1",
        user_message="Build a sales model",
        conversation=[{"role": "user", "content": "Build a sales model"}],
    )
    tokens = [token async for token in workflow.stream([{"role": "user", "content": "Sales"}])]
    assert "".join(tokens) == "Candidate grain"
