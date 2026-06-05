from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from docintel.api.dependencies import get_db_session, get_settings
from docintel.config import Settings
from docintel.services.graph.projection import DocumentGraphProjectionService
from docintel.services.vector_projection import DocumentVectorProjectionService

router = APIRouter(prefix="/api/v1/search", tags=["search"])


class VectorSearchRequest(BaseModel):
    """Vector search request shape for the UI."""

    query: str
    limit: int = 10


class SearchUnavailableResponse(BaseModel):
    """Search placeholder response for future vector/graph phases."""

    status: str
    required_phase: str | None = None
    message: str
    results: list[dict[str, object]]


@router.post("/vector", response_model=SearchUnavailableResponse)
async def vector_search(
    request: VectorSearchRequest,
    settings: Annotated[Settings, Depends(get_settings)],
    session: Annotated[Session, Depends(get_db_session)],
) -> SearchUnavailableResponse:
    """Search chunk vectors in Qdrant."""

    result = await DocumentVectorProjectionService(session, settings).search(
        request.query, request.limit
    )
    return SearchUnavailableResponse(
        status=result.status,
        required_phase=None if result.status == "available" else "Phase 3",
        message=result.message,
        results=result.results,
    )


@router.post("/graph", response_model=SearchUnavailableResponse)
def graph_search(
    request: VectorSearchRequest,
    settings: Annotated[Settings, Depends(get_settings)],
    session: Annotated[Session, Depends(get_db_session)],
) -> SearchUnavailableResponse:
    """Search local resolved graph nodes."""

    result = DocumentGraphProjectionService(session, settings).search(request.query, request.limit)
    return SearchUnavailableResponse(
        status=result.status,
        required_phase=None,
        message=result.message,
        results=result.nodes,
    )
