import asyncio
import logging
from time import perf_counter
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.autonomy.factory import build_autonomy_runtime
from app.config import Settings, get_settings
from app.db.models import Artifact, Project, WorkflowRun
from app.db.session import SessionLocal
from app.llm.embeddings import OpenAICompatibleEmbeddingProvider
from app.llm.registry import ProviderRegistry
from app.repositories.memory import MemoryRepository
from app.repositories.messages import MessageRepository
from app.repositories.projects import ProjectRepository
from app.repositories.sources import SourceRepository
from app.repositories.workflow_runs import WorkflowRunRepository
from app.runtime import ApplicationRuntime
from app.services.agent_cache import AgentResultCache
from app.services.memory import MemoryService
from app.services.provider_settings import ProviderConfigurationService
from app.services.workflow_persistence import WorkflowPersistenceService
from app.services.workflows import WorkflowService, agent_progress_label

TERMINAL_RUN_STATUSES = {"completed", "failed", "interrupted", "cancelled", "conflict"}
logger = logging.getLogger(__name__)


async def recover_incomplete_runs(runtime: ApplicationRuntime) -> None:
    with SessionLocal() as db:
        runs = list(
            db.scalars(
                select(WorkflowRun).where(WorkflowRun.status.in_({"queued", "running"}))
            )
        )
        if runs:
            db.execute(
                update(Project)
                .where(Project.active_run_id.in_([run.id for run in runs]))
                .values(active_run_id=None)
            )
            db.commit()
    for run in runs:
        if run.id in runtime.tasks:
            continue
        task = asyncio.create_task(execute_workflow_run(run.id, runtime))
        runtime.track_task(run.id, task)


async def execute_workflow_run(run_id: str, runtime: ApplicationRuntime) -> None:
    started = perf_counter()
    with SessionLocal() as db:
        run = WorkflowRunRepository(db).get(run_id)
        if run is None:
            return
        project_id = run.project_id
    try:
        async with runtime.project_lock(project_id):
            with SessionLocal() as db:
                runs = WorkflowRunRepository(db)
                run = runs.get(run_id)
                if run is None:
                    return
                if not runs.acquire_project_lease(run.project_id, run.id):
                    runs.append_event(
                        run,
                        "error",
                        {"detail": "Another workflow run is already active for this project."},
                    )
                    runs.finish(run, status="conflict")
                    return
            await _execute_leased_run(run_id, runtime, started)
    except asyncio.CancelledError:
        _cancel_run(run_id, started)
        raise
    except Exception as exc:
        _fail_run(run_id, exc, started)


async def _execute_leased_run(
    run_id: str, runtime: ApplicationRuntime, started: float
) -> None:
    settings = get_settings()
    with SessionLocal() as db:
        runs = WorkflowRunRepository(db)
        run = runs.get(run_id)
        if run is None:
            return
        projects = ProjectRepository(db)
        project = projects.get(run.project_id)
        if project is None:
            runs.finish(run, status="failed", error="Project not found")
            return
        recovering = run.status == "running"
        runs.mark_running(run)
        runs.append_event(run, "run.started", {"run_id": run.id, "status": "running"})
        existing_state = dict(project.workflow_state)
        resume_from_checkpoint = project.status == "failed" or recovering
        awaiting_approval = project.workflow_stage == "awaiting_approval"
        approval_decision = (
            parse_approval_decision(run.request_content) if awaiting_approval else None
        )
        MessageRepository(db).create(
            project_id=project.id,
            role="user",
            content=run.request_content,
            workflow_run_id=run.id,
        )
        projects.update(project, status="in_progress", workflow_stage="understanding")
        history = [
            {"role": message.role, "content": message.content}
            for message in MessageRepository(db).list_for_project(project.id)
            if message.role in {"user", "assistant"}
        ]
        sources = [
            {
                "name": source.name,
                "format": source.format,
                "content_excerpt": source.content_excerpt,
                "profile": source.profile,
            }
            for source in SourceRepository(db).list_for_project(project.id)
        ]
        config = ProviderConfigurationService(db, settings).get_model()
        memory_context = (
            await memory_service(db, settings).retrieve_context(
                project.id, run.request_content
            )
            if settings.memory_enabled
            else {}
        )
        provider = ProviderRegistry(
            settings,
            client=runtime.http_client,
            guard=runtime.provider_guard,
        ).get(
            config.provider,
            base_url=config.base_url,
            model=config.model,
            api_key=config.api_key,
        )
        workflow = WorkflowService(
            provider,
            settings.agent_request_timeout,
            None,
            *build_autonomy_runtime(settings, tool_calling_enabled=config.tool_calling),
            checkpointer=runtime.checkpointer,
            planner_fast_path=settings.planner_fast_path,
            presenter_fast_path=settings.presenter_fast_path,
            recent_message_limit=settings.workflow_recent_message_limit,
            message_char_limit=settings.workflow_message_char_limit,
            source_excerpt_limit=settings.workflow_source_excerpt_limit,
            result_cache=(
                AgentResultCache(settings.agent_result_cache_ttl_seconds)
                if settings.agent_result_cache_enabled
                else None
            ),
            deterministic_source_analysis=settings.deterministic_source_analysis,
            deterministic_structural_validation=(
                settings.deterministic_structural_validation
            ),
        )
        final_state: dict[str, Any] = {}
        interrupted = False
        runs.append_event(run, "progress", {"label": "Understanding your modelling scenario"})
        async for workflow_event in workflow.run(
            project_id=project.id,
            user_message=run.request_content,
            conversation=history,
            existing_state=existing_state,
            sources=sources,
            resume_from_checkpoint=resume_from_checkpoint,
            approval_decision=approval_decision,
            run_id=run.id,
            memory_context=memory_context,
        ):
            event_name = str(workflow_event.get("event"))
            if event_name in {"agent.started", "agent.completed", "tool.started", "tool.completed"}:
                payload: dict[str, object] = {
                    "agent_id": workflow_event.get("agent_id"),
                    "confidence": workflow_event.get("confidence"),
                    "execution_mode": workflow_event.get("execution_mode"),
                    "label": agent_progress_label(workflow_event),
                }
                runs.append_event(run, event_name, payload)
                runs.append_event(run, "progress", payload)
            elif event_name == "workflow.completed":
                value = workflow_event.get("state")
                if isinstance(value, dict):
                    final_state = value
            elif event_name == "workflow.interrupted":
                value = workflow_event.get("state")
                if isinstance(value, dict):
                    final_state = value
                final_state["workflow_stage"] = "awaiting_approval"
                final_state["run_status"] = "interrupted"
                interrupted = True
                interrupt = workflow_event.get("interrupt", {})
                runs.append_event(
                    run,
                    "approval.required",
                    interrupt if isinstance(interrupt, dict) else {},
                )

        if interrupted:
            response = (
                "I prepared a bounded execution plan that requires approval before using "
                "the selected external capability."
            )
            _finalize_result(
                run_id=run.id,
                project_id=project.id,
                state=final_state,
                response=response,
                status="interrupted",
                duration_ms=elapsed_ms(started),
            )
            return

        runs.append_event(run, "progress", {"label": "Presenting the orchestrator result"})
        response_chunks: list[str] = []
        pending = ""
        async for token in workflow.stream_response(final_state, history):
            response_chunks.append(token)
            pending += token
            if len(pending) >= 80:
                runs.append_event(run, "token", {"content": pending})
                pending = ""
        if pending:
            runs.append_event(run, "token", {"content": pending})
        response = "".join(response_chunks)
        _finalize_result(
            run_id=run.id,
            project_id=project.id,
            state=final_state,
            response=response,
            status="completed",
            duration_ms=elapsed_ms(started),
        )
        if settings.memory_enabled:
            await _remember_completed_run(
                run_id=run.id,
                project_id=project.id,
                state=final_state,
                user_message=run.request_content,
                response=response,
                settings=settings,
            )


def _finalize_result(
    *,
    run_id: str,
    project_id: str,
    state: dict[str, Any],
    response: str,
    status: str,
    duration_ms: float,
) -> int:
    """Atomically publish all durable outputs for one workflow run.

    Progress and token events intentionally commit independently. The project state,
    generated artifact versions, assistant message, terminal event, run status, and
    project lease are one transaction so recovery sees either all outputs or none.
    """
    with SessionLocal() as db:
        runs = WorkflowRunRepository(db)
        run = runs.get(run_id)
        if run is None:
            return 0
        if run.status in TERMINAL_RUN_STATUSES:
            return len(
                list(
                    db.scalars(
                        select(Artifact).where(Artifact.generated_by_run_id == run_id)
                    )
                )
            )
        project = ProjectRepository(db).get(project_id)
        artifacts: list[Artifact] = []
        if project is not None:
            artifacts = WorkflowPersistenceService(db).persist(
                project, state, run_id=run_id, commit=False
            )
        MessageRepository(db).create(
            project_id=project_id,
            role="assistant",
            content=response,
            workflow_run_id=run_id,
            commit=False,
        )
        runs.append_event(
            run,
            "done",
            {
                "content": response,
                "artifact_count": len(artifacts),
                "workflow_stage": state.get("workflow_stage"),
                "run_id": run.id,
                "duration_ms": duration_ms,
            },
            commit=False,
        )
        runs.finish(
            run,
            status=status,
            response_content=response,
            duration_ms=duration_ms,
            commit=False,
        )
        db.commit()
        return len(artifacts)


def _fail_run(run_id: str, exc: Exception, started: float) -> None:
    reason = str(exc) or type(exc).__name__
    detail = f"The provider could not complete this request: {reason}"
    with SessionLocal() as db:
        runs = WorkflowRunRepository(db)
        run = runs.get(run_id)
        if run is None:
            return
        if run.status in TERMINAL_RUN_STATUSES:
            return
        runs.append_event(
            run, "error", {"detail": detail, "run_id": run.id}, commit=False
        )
        project = ProjectRepository(db).get(run.project_id)
        if project is not None:
            ProjectRepository(db).update(
                project, status="failed", workflow_stage="error", commit=False
            )
        MessageRepository(db).create(
            project_id=run.project_id,
            role="assistant",
            content=detail,
            workflow_run_id=run.id,
            commit=False,
        )
        runs.finish(
            run,
            status="failed",
            error=reason,
            duration_ms=elapsed_ms(started),
            commit=False,
        )
        db.commit()


def _cancel_run(run_id: str, started: float) -> None:
    with SessionLocal() as db:
        runs = WorkflowRunRepository(db)
        run = runs.get(run_id)
        if run is None:
            return
        if run.status in TERMINAL_RUN_STATUSES:
            return
        runs.append_event(run, "run.cancelled", {"run_id": run.id}, commit=False)
        project = ProjectRepository(db).get(run.project_id)
        if project is not None:
            ProjectRepository(db).update(
                project, status="in_progress", workflow_stage="cancelled", commit=False
            )
        runs.finish(
            run, status="cancelled", duration_ms=elapsed_ms(started), commit=False
        )
        db.commit()


async def _remember_completed_run(
    *,
    run_id: str,
    project_id: str,
    state: dict[str, Any],
    user_message: str,
    response: str,
    settings: Settings,
) -> None:
    try:
        with SessionLocal() as db:
            project = ProjectRepository(db).get(project_id)
            if project is None:
                return
            await memory_service(db, settings).update_after_run(
                project_id=project_id,
                project_name=project.name,
                run_id=run_id,
                user_message=user_message,
                assistant_response=response,
                state=state,
            )
    except Exception:
        logger.warning("Memory update failed for workflow run %s", run_id, exc_info=True)


def memory_service(db: Session, settings: Settings) -> MemoryService:
    provider = OpenAICompatibleEmbeddingProvider(
        base_url=settings.lm_studio_base_url,
        api_key=settings.lm_studio_api_key,
        model=settings.embedding_model,
        timeout=settings.memory_embedding_timeout,
    )
    return MemoryService(
        MemoryRepository(db), provider, settings.memory_retrieval_limit
    )


def parse_approval_decision(content: str) -> str:
    normalized = content.strip().lower()
    return "approved" if normalized in {"approve", "approved", "approve plan"} else "denied"


def elapsed_ms(started: float) -> float:
    return round((perf_counter() - started) * 1000, 2)
