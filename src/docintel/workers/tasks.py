from __future__ import annotations

import asyncio
from uuid import UUID

from celery import chain
from sqlalchemy.orm import Session

from docintel.config import Settings
from docintel.db.models import Document, ProcessingRun
from docintel.db.repositories.documents import DocumentRepository
from docintel.db.session import session_scope
from docintel.services.processing import DocumentProcessingService
from docintel.workers.celery_app import celery_app

StageContext = dict[str, object]


@celery_app.task(name="docintel.ping")  # type: ignore[untyped-decorator]
def ping() -> str:
    """Return a simple worker health value."""

    return "pong"


def enqueue_document_processing(document_id: UUID, processing_run_id: UUID) -> str:
    """Enqueue the explicit document processing task chain."""

    workflow = chain(
        parse_document.s(str(document_id), str(processing_run_id)),
        project_vectors.s(),
        run_extraction.s(),
        project_graph.s(),
        finalize_processing.s(),
    )
    result = workflow.apply_async()
    return str(result.id)


@celery_app.task(name="docintel.parse_document")  # type: ignore[untyped-decorator]
def parse_document(document_id: str, processing_run_id: str) -> StageContext:
    """Parse a document and persist canonical artifacts."""

    context = _base_context(document_id, processing_run_id)
    settings = Settings()
    with session_scope(settings) as session:
        repository = DocumentRepository(session)
        document = repository.get(UUID(document_id))
        run = repository.get_processing_run(UUID(processing_run_id))
        if document is None or run is None:
            return _failed(context, "document or processing run not found")
        service = DocumentProcessingService(session, settings)
        repository.mark_processing_run_running(document, run)
        repository.add_event(
            document.id,
            run.id,
            "parse_document",
            "RUNNING",
            "Celery worker started Docling parse.",
        )
        try:
            _canonical, stage_data = asyncio.run(service.parse_and_persist(document, run))
        except Exception as exc:
            return _failed(context, exc)
        context.update(stage_data)
        return context


@celery_app.task(name="docintel.project_vectors")  # type: ignore[untyped-decorator]
def project_vectors(context: StageContext) -> StageContext:
    """Build layout-aware chunks and project Qdrant vectors."""

    if context.get("failure"):
        return context
    settings = Settings()
    with session_scope(settings) as session:
        service, document, run = _load_stage(session, settings, context)
        if service is None or document is None or run is None:
            return _failed(context, "document or processing run not found")
        try:
            result = asyncio.run(service.project_vectors(document, run))
        except Exception as exc:
            return _failed(context, exc)
        context.update(service.vector_stage_data(result))
        return context


@celery_app.task(name="docintel.run_extraction")  # type: ignore[untyped-decorator]
def run_extraction(context: StageContext) -> StageContext:
    """Run generic deterministic and model-backed extraction."""

    if context.get("failure"):
        return context
    settings = Settings()
    with session_scope(settings) as session:
        service, document, run = _load_stage(session, settings, context)
        if service is None or document is None or run is None:
            return _failed(context, "document or processing run not found")
        try:
            result = asyncio.run(service.run_extraction(document, run))
        except Exception as exc:
            return _failed(context, exc)
        context.update(service.extraction_stage_data(result))
        return context


@celery_app.task(name="docintel.project_graph")  # type: ignore[untyped-decorator]
def project_graph(context: StageContext) -> StageContext:
    """Resolve entities and project the serving graph."""

    if context.get("failure"):
        return context
    settings = Settings()
    with session_scope(settings) as session:
        service, document, run = _load_stage(session, settings, context)
        if service is None or document is None or run is None:
            return _failed(context, "document or processing run not found")
        try:
            result = service.project_graph(document, run)
        except Exception as exc:
            return _failed(context, exc)
        context.update(service.graph_stage_data(result))
        return context


@celery_app.task(name="docintel.finalize_processing")  # type: ignore[untyped-decorator]
def finalize_processing(context: StageContext) -> StageContext:
    """Finalize processing status and persisted quality metrics."""

    settings = Settings()
    with session_scope(settings) as session:
        service, document, run = _load_stage(session, settings, context)
        if service is None or document is None or run is None:
            return _failed(context, "document or processing run not found")
        failure = context.get("failure")
        if failure:
            result = service.fail(document, run, str(failure))
        else:
            result = service.finalize(document, run, context)
        context["status"] = result.run.status
        context["message"] = result.message
        return context


def _base_context(document_id: str, processing_run_id: str) -> StageContext:
    return {
        "document_id": document_id,
        "processing_run_id": processing_run_id,
    }


def _failed(context: StageContext, error: Exception | str) -> StageContext:
    context["failure"] = str(error)
    return context


def _load_stage(
    session: Session,
    settings: Settings,
    context: StageContext,
) -> tuple[
    DocumentProcessingService | None,
    Document | None,
    ProcessingRun | None,
]:
    repository = DocumentRepository(session)
    document_id = UUID(str(context["document_id"]))
    processing_run_id = UUID(str(context["processing_run_id"]))
    document = repository.get(document_id)
    run = repository.get_processing_run(processing_run_id)
    if document is None or run is None:
        return None, None, None
    return DocumentProcessingService(session, settings), document, run
