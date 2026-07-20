from collections.abc import AsyncIterator
from typing import Any, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class AnthropicProvider:
    """Contract placeholder; Claude transport is intentionally deferred from the first slice."""

    name = "anthropic"

    def __init__(self, *, api_key: str, model: str) -> None:
        self.api_key = api_key
        self.model = model

    async def health_check(self) -> dict[str, Any]:
        return {
            "ok": False,
            "provider": self.name,
            "model": self.model,
            "models": [],
            "detail": "Adapter not enabled yet",
        }

    async def list_models(self) -> list[str]:
        return []

    async def generate_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> str:
        raise NotImplementedError("Anthropic transport is planned for a later iteration")

    async def generate_structured(
        self,
        messages: list[dict[str, Any]],
        response_model: type[T],
        *,
        temperature: float | None = None,
    ) -> T:
        raise NotImplementedError("Anthropic transport is planned for a later iteration")

    async def stream_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> AsyncIterator[str]:
        raise NotImplementedError("Anthropic transport is planned for a later iteration")
        yield ""  # pragma: no cover

    async def invoke_tools(
        self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]
    ) -> dict[str, Any]:
        raise NotImplementedError("Anthropic transport is planned for a later iteration")
