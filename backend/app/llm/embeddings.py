from typing import Any

import httpx


class OpenAICompatibleEmbeddingProvider:
    def __init__(self, *, base_url: str, api_key: str, model: str, timeout: int = 120) -> None:
        self.name = "lm_studio"
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout = timeout

    async def health_check(self) -> dict[str, Any]:
        try:
            vectors = await self.embed(["health check"])
            return {"ok": bool(vectors and vectors[0]), "provider": self.name, "model": self.model}
        except httpx.HTTPError as exc:
            return {"ok": False, "provider": self.name, "model": self.model, "detail": str(exc)}

    async def embed(self, texts: list[str]) -> list[list[float]]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            models_response = await client.get(
                f"{self.base_url}/models",
                headers={"Authorization": f"Bearer {self.api_key}"},
            )
            models_response.raise_for_status()
            available = [item["id"] for item in models_response.json().get("data", [])]
            model = next(
                (item for item in available if self.model.lower() in item.lower()), self.model
            )
            response = await client.post(
                f"{self.base_url}/embeddings",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"model": model, "input": texts},
            )
            response.raise_for_status()
            ordered = sorted(response.json()["data"], key=lambda item: item["index"])
            return [list(map(float, item["embedding"])) for item in ordered]


class EmbeddingService:
    """Minimal application boundary for future indexing and retrieval."""

    def __init__(self, provider: OpenAICompatibleEmbeddingProvider) -> None:
        self.provider = provider

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return await self.provider.embed(texts)
