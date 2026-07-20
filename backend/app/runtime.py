import asyncio
from collections import defaultdict
from time import monotonic
from typing import Any

import aiosqlite
import httpx
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from app.config import get_settings


class ProviderGuard:
    def __init__(self, max_concurrency: int, failure_threshold: int, reset_seconds: float) -> None:
        self.semaphore = asyncio.Semaphore(max_concurrency)
        self.failure_threshold = failure_threshold
        self.reset_seconds = reset_seconds
        self.failures: dict[str, int] = defaultdict(int)
        self.opened_at: dict[str, float] = {}

    def ensure_available(self, key: str) -> None:
        opened = self.opened_at.get(key)
        if opened is None:
            return
        if monotonic() - opened >= self.reset_seconds:
            self.opened_at.pop(key, None)
            self.failures[key] = 0
            return
        raise RuntimeError(f"Provider circuit is temporarily open for {key}")

    def success(self, key: str) -> None:
        self.failures[key] = 0
        self.opened_at.pop(key, None)

    def failure(self, key: str) -> None:
        self.failures[key] += 1
        if self.failures[key] >= self.failure_threshold:
            self.opened_at[key] = monotonic()


class ApplicationRuntime:
    def __init__(self) -> None:
        self.http_client: httpx.AsyncClient | None = None
        self.checkpoint_connection: aiosqlite.Connection | None = None
        self.checkpointer: AsyncSqliteSaver | None = None
        self.project_locks: dict[str, asyncio.Lock] = {}
        self.tasks: dict[str, asyncio.Task[None]] = {}
        self._start_lock = asyncio.Lock()
        settings = get_settings()
        self.provider_guard = ProviderGuard(
            settings.llm_max_concurrency,
            settings.llm_circuit_failure_threshold,
            settings.llm_circuit_reset_seconds,
        )

    async def start(self) -> None:
        async with self._start_lock:
            if self.http_client is not None:
                return
            settings = get_settings()
            self.http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(settings.llm_request_timeout),
                limits=httpx.Limits(
                    max_connections=settings.http_max_connections,
                    max_keepalive_connections=settings.http_max_keepalive_connections,
                    keepalive_expiry=30,
                ),
            )
            settings.workflow_checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
            self.checkpoint_connection = await aiosqlite.connect(
                settings.workflow_checkpoint_path
            )
            await self.checkpoint_connection.execute("PRAGMA journal_mode=WAL")
            await self.checkpoint_connection.execute("PRAGMA busy_timeout=5000")
            await self.checkpoint_connection.execute("PRAGMA synchronous=NORMAL")
            self.checkpointer = AsyncSqliteSaver(self.checkpoint_connection)
            await self.checkpointer.setup()

    async def stop(self) -> None:
        active = [task for task in self.tasks.values() if not task.done()]
        if active:
            await asyncio.gather(*active, return_exceptions=True)
        if self.http_client is not None:
            await self.http_client.aclose()
        if self.checkpoint_connection is not None:
            await self.checkpoint_connection.close()
        self.http_client = None
        self.checkpoint_connection = None
        self.checkpointer = None

    def project_lock(self, project_id: str) -> asyncio.Lock:
        lock = self.project_locks.get(project_id)
        if lock is None:
            lock = asyncio.Lock()
            self.project_locks[project_id] = lock
        return lock

    def track_task(self, run_id: str, task: asyncio.Task[None]) -> None:
        self.tasks[run_id] = task
        task.add_done_callback(lambda _: self.tasks.pop(run_id, None))


application_runtime = ApplicationRuntime()


async def ensure_runtime() -> ApplicationRuntime:
    await application_runtime.start()
    return application_runtime


def runtime_snapshot() -> dict[str, Any]:
    return {
        "active_runs": len(application_runtime.tasks),
        "http_client_ready": application_runtime.http_client is not None,
        "checkpointer_ready": application_runtime.checkpointer is not None,
    }
