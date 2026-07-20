from collections.abc import AsyncIterator
from typing import Any, Protocol, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class LLMProvider(Protocol):
    name: str
    model: str

    async def health_check(self) -> dict[str, Any]: ...
    async def list_models(self) -> list[str]: ...
    async def generate_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> str: ...
    async def generate_structured(
        self,
        messages: list[dict[str, Any]],
        response_model: type[T],
        *,
        temperature: float | None = None,
    ) -> T: ...
    def stream_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> AsyncIterator[str]: ...
    async def invoke_tools(
        self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]
    ) -> dict[str, Any]: ...


class EmbeddingProvider(Protocol):
    name: str
    model: str

    async def health_check(self) -> dict[str, Any]: ...
    async def embed(self, texts: list[str]) -> list[list[float]]: ...
