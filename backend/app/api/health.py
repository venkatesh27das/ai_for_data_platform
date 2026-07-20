from fastapi import APIRouter

from app.runtime import runtime_snapshot

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def ready() -> dict[str, object]:
    snapshot = runtime_snapshot()
    available = bool(snapshot["http_client_ready"] and snapshot["checkpointer_ready"])
    return {"status": "ready" if available else "starting", **snapshot}
