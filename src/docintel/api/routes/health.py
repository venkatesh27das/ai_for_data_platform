from typing import Literal, cast

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from docintel.config import Settings
from docintel.db.session import create_db_engine

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    """Basic liveness response."""

    status: Literal["ok"]
    app_env: str


class ReadyResponse(BaseModel):
    """Readiness response with dependency status."""

    status: Literal["ready", "not_ready"]
    database: Literal["ok", "error"]
    details: str | None = None


def _settings_from_request(request: Request) -> Settings:
    return cast(Settings, request.app.state.settings)


def _check_database(settings: Settings) -> None:
    engine = create_db_engine(settings)
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    finally:
        engine.dispose()


@router.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    """Return process liveness."""

    settings = _settings_from_request(request)
    return HealthResponse(status="ok", app_env=settings.app_env)


@router.get("/ready", response_model=ReadyResponse)
def ready(request: Request) -> ReadyResponse | JSONResponse:
    """Return dependency readiness."""

    settings = _settings_from_request(request)
    try:
        _check_database(settings)
    except SQLAlchemyError as exc:
        response = ReadyResponse(status="not_ready", database="error", details=str(exc))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=response.model_dump()
        )
    return ReadyResponse(status="ready", database="ok")
