from __future__ import annotations

from dataclasses import dataclass
from typing import cast

import httpx

from docintel.config import Settings


@dataclass(frozen=True)
class VectorPoint:
    """Qdrant point payload."""

    point_id: str
    vector: list[float]
    payload: dict[str, object]


@dataclass(frozen=True)
class VectorSearchHit:
    """Search hit from Qdrant."""

    point_id: str
    score: float
    payload: dict[str, object]


class QdrantVectorStore:
    """Qdrant REST adapter for chunk vectors."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.base_url = settings.qdrant_url.rstrip("/")
        self.collection_name = settings.qdrant_collection_document_chunks

    async def ensure_collection(self, vector_size: int) -> None:
        """Create the configured collection when it does not exist."""

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{self.base_url}/collections/{self.collection_name}")
            if response.status_code == 200:
                return
            if response.status_code != 404:
                response.raise_for_status()
            create = await client.put(
                f"{self.base_url}/collections/{self.collection_name}",
                json={"vectors": {"size": vector_size, "distance": "Cosine"}},
            )
            create.raise_for_status()

    async def upsert_points(self, points: list[VectorPoint]) -> None:
        """Upsert vector points into Qdrant."""

        if not points:
            return
        await self.ensure_collection(len(points[0].vector))
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.put(
                f"{self.base_url}/collections/{self.collection_name}/points",
                params={"wait": "true"},
                json={
                    "points": [
                        {"id": point.point_id, "vector": point.vector, "payload": point.payload}
                        for point in points
                    ]
                },
            )
            response.raise_for_status()

    async def search(self, vector: list[float], limit: int) -> list[VectorSearchHit]:
        """Search Qdrant for nearest chunk vectors."""

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{self.base_url}/collections/{self.collection_name}/points/search",
                json={"vector": vector, "limit": limit, "with_payload": True},
            )
            response.raise_for_status()
        payload = response.json()
        result = payload.get("result", [])
        if not isinstance(result, list):
            return []
        hits: list[VectorSearchHit] = []
        for item in result:
            if not isinstance(item, dict):
                continue
            item_payload = item.get("payload") if isinstance(item.get("payload"), dict) else {}
            hits.append(
                VectorSearchHit(
                    point_id=str(item.get("id")),
                    score=float(item.get("score", 0.0)),
                    payload=cast(dict[str, object], item_payload),
                )
            )
        return hits
