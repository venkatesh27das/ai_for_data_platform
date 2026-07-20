from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import artifacts, autonomy, conversations, health, memory, projects, settings, sources
from app.config import get_settings
from app.runtime import application_runtime
from app.services.workflow_runner import recover_incomplete_runs


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    get_settings().data_dir.mkdir(parents=True, exist_ok=True)
    await application_runtime.start()
    await recover_incomplete_runs(application_runtime)
    try:
        yield
    finally:
        await application_runtime.stop()


app = FastAPI(title="AI Data Modelling Assistant API", version="0.1.0", lifespan=lifespan)
config = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({config.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(artifacts.router, prefix="/api")
app.include_router(sources.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(autonomy.router, prefix="/api")
app.include_router(memory.router, prefix="/api")
