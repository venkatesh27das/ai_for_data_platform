from __future__ import annotations

import httpx

from docintel.config import Settings
from docintel.services.embeddings.base import EmbeddingProvider


class LMStudioEmbeddingProvider(EmbeddingProvider):
    """Embedding provider using LM Studio's OpenAI-compatible endpoint."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of document texts."""

        return await self._embed(texts)

    async def embed_query(self, text: str) -> list[float]:
        """Embed one search query."""

        embeddings = await self._embed([text])
        return embeddings[0]

    async def _embed(self, inputs: list[str]) -> list[list[float]]:
        model = self.settings.lm_studio_embedding_model
        if model.startswith("<set-your"):
            raise RuntimeError("LM_STUDIO_EMBEDDING_MODEL is not configured")
        headers = {"Authorization": f"Bearer {self.settings.lm_studio_api_key}"}
        async with httpx.AsyncClient(
            timeout=self.settings.lm_studio_request_timeout_seconds
        ) as client:
            response = await client.post(
                f"{self.settings.lm_studio_base_url.rstrip('/')}/embeddings",
                headers=headers,
                json={"model": model, "input": inputs},
            )
            response.raise_for_status()
        payload = response.json()
        data = payload.get("data")
        if not isinstance(data, list):
            raise RuntimeError("LM Studio embeddings response did not include data")
        embeddings: list[list[float]] = []
        for item in data:
            embedding = item.get("embedding") if isinstance(item, dict) else None
            if not isinstance(embedding, list):
                raise RuntimeError("LM Studio embedding item did not include an embedding")
            embeddings.append([float(value) for value in embedding])
        if len(embeddings) != len(inputs):
            raise RuntimeError("LM Studio returned a mismatched number of embeddings")
        return embeddings
