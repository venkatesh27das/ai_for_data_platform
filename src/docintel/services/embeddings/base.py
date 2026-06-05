from __future__ import annotations

from typing import Protocol


class EmbeddingProvider(Protocol):
    """Embedding provider interface."""

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Embed document texts."""

    async def embed_query(self, text: str) -> list[float]:
        """Embed a search query."""
