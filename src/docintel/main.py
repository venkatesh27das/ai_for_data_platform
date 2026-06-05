from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

from docintel import __version__
from docintel.api.routes import api_router
from docintel.config import Settings
from docintel.logging import configure_logging, get_logger


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create and configure the FastAPI application."""

    app_settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        configure_logging(app_settings.log_level)
        app_settings.ensure_local_directories()
        app.state.settings = app_settings
        logger = get_logger("docintel.app", app_env=app_settings.app_env)
        logger.info("application_started")
        yield
        logger.info("application_stopped")

    app = FastAPI(
        title="Local Document Intelligence",
        version=__version__,
        description="Local-first document intelligence API.",
        lifespan=lifespan,
    )
    app.state.settings = app_settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(OperationalError)
    async def database_operational_error_handler(
        _request: object, exc: OperationalError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=503,
            content={
                "detail": "Database is unavailable. Start PostgreSQL and run migrations.",
                "error": str(exc),
            },
        )

    app.include_router(api_router)
    return app
