from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/search", tags=["search"])


class VectorSearchRequest(BaseModel):
    """Vector search request shape for the UI."""

    query: str
    limit: int = 10


class SearchUnavailableResponse(BaseModel):
    """Search placeholder response for future vector/graph phases."""

    status: str
    required_phase: str
    message: str
    results: list[dict[str, object]]


@router.post("/vector", response_model=SearchUnavailableResponse)
def vector_search(_: VectorSearchRequest) -> SearchUnavailableResponse:
    """Return a clear placeholder until Qdrant indexing exists."""

    return SearchUnavailableResponse(
        status="unavailable",
        required_phase="Phase 3",
        message=(
            "Vector search is not available until chunking, embeddings, and Qdrant upsert "
            "are implemented."
        ),
        results=[],
    )


@router.post("/graph", response_model=SearchUnavailableResponse)
def graph_search(_: VectorSearchRequest) -> SearchUnavailableResponse:
    """Return a clear placeholder until Neo4j projection exists."""

    return SearchUnavailableResponse(
        status="unavailable",
        required_phase="Phase 5",
        message=(
            "Graph search is not available until entity resolution and Neo4j projection are "
            "implemented."
        ),
        results=[],
    )
