import json
from pathlib import Path
from uuid import UUID

import typer

from docintel.config import Settings
from docintel.db.repositories.documents import DocumentRepository
from docintel.db.session import session_scope
from docintel.services.extraction.generic import GenericExtractionService
from docintel.services.ingestion.files import UploadValidationError, store_upload
from docintel.services.processing import DocumentProcessingService

app = typer.Typer(help="Local document intelligence development CLI.")


@app.command()
def health() -> None:
    """Print local application configuration health."""

    settings = Settings()
    settings.ensure_local_directories()
    typer.echo(json.dumps({"status": "ok", "app_env": settings.app_env}))


@app.command()
def ingest(file_path: Path) -> None:
    """Register a PDF or DOCX upload in the local document registry."""

    settings = Settings()
    settings.ensure_local_directories()
    if not file_path.exists():
        raise typer.BadParameter(f"{file_path} does not exist")
    try:
        stored = store_upload(file_path.read_bytes(), file_path.name, settings)
    except UploadValidationError as exc:
        raise typer.BadParameter(str(exc)) from exc
    with session_scope(settings) as session:
        repository = DocumentRepository(session)
        existing = repository.get_by_checksum(stored.checksum_sha256)
        document = existing or repository.create_from_upload(stored)
        typer.echo(
            json.dumps(
                {
                    "document_id": str(document.id),
                    "duplicate": existing is not None,
                    "file_name": document.file_name,
                    "status": document.status,
                },
                indent=2,
            )
        )


@app.command()
def process(document_id: UUID) -> None:
    """Run Phase 1/2 processing for a registered document."""

    import asyncio

    settings = Settings()
    settings.ensure_local_directories()
    with session_scope(settings) as session:
        repository = DocumentRepository(session)
        document = repository.get(document_id)
        if document is None:
            raise typer.BadParameter("document not found")
        result = asyncio.run(DocumentProcessingService(session, settings).process(document))
        typer.echo(
            json.dumps(
                {
                    "document_id": str(result.document.id),
                    "processing_run_id": str(result.run.id),
                    "status": result.run.status,
                    "message": result.message,
                },
                indent=2,
            )
        )


@app.command()
def status(document_id: UUID) -> None:
    """Print document status and processing trace."""

    settings = Settings()
    with session_scope(settings) as session:
        repository = DocumentRepository(session)
        document = repository.get(document_id)
        if document is None:
            raise typer.BadParameter("document not found")
        events = repository.list_events(document_id)
        latest_run = repository.latest_processing_run(document_id)
        typer.echo(
            json.dumps(
                {
                    "document_id": str(document.id),
                    "status": document.status,
                    "latest_run_id": str(latest_run.id) if latest_run else None,
                    "events": [
                        {
                            "stage": event.stage,
                            "status": event.status,
                            "message": event.message,
                            "created_at": event.created_at.isoformat(),
                        }
                        for event in events
                    ],
                },
                indent=2,
            )
        )


@app.command()
def artifacts(document_id: UUID) -> None:
    """Print generated artifact records for a document."""

    settings = Settings()
    with session_scope(settings) as session:
        repository = DocumentRepository(session)
        if repository.get(document_id) is None:
            raise typer.BadParameter("document not found")
        typer.echo(
            json.dumps(
                [
                    {
                        "artifact_type": artifact.artifact_type,
                        "uri": artifact.uri,
                        "media_type": artifact.media_type,
                        "metadata": artifact.metadata_json,
                    }
                    for artifact in repository.list_artifacts(document_id)
                ],
                indent=2,
            )
        )


@app.command()
def extract(document_id: UUID) -> None:
    """Run generic structured extraction for a processed document."""

    import asyncio

    settings = Settings()
    with session_scope(settings) as session:
        repository = DocumentRepository(session)
        document = repository.get(document_id)
        if document is None:
            raise typer.BadParameter("document not found")
        result = asyncio.run(GenericExtractionService(session, settings).run(document))
        typer.echo(
            json.dumps(
                {
                    "document_id": str(document.id),
                    "status": result.status,
                    "message": result.message,
                    "extraction_run_id": result.extraction_run_id,
                    "field_count": result.field_count,
                    "entity_count": result.entity_count,
                    "relationship_count": result.relationship_count,
                    "obligation_count": result.obligation_count,
                },
                indent=2,
            )
        )


@app.command("rebuild-vectors")
def rebuild_vectors(document_id: UUID | None = None) -> None:
    """Build chunks and rebuild Qdrant vectors for one or all processed documents."""

    import asyncio

    from docintel.services.vector_projection import DocumentVectorProjectionService

    settings = Settings()
    with session_scope(settings) as session:
        repository = DocumentRepository(session)
        documents = [repository.get(document_id)] if document_id else list(repository.list())
        results: list[dict[str, object]] = []
        for document in documents:
            if document is None:
                continue
            result = asyncio.run(
                DocumentVectorProjectionService(session, settings).rebuild_document_vectors(
                    document
                )
            )
            results.append(
                {
                    "document_id": str(document.id),
                    "status": result.status,
                    "chunk_count": result.chunk_count,
                    "indexed_count": result.indexed_count,
                    "message": result.message,
                }
            )
        typer.echo(json.dumps(results, indent=2))


@app.command("vector-search")
def vector_search(query: str, limit: int = 8) -> None:
    """Search chunk vectors in Qdrant."""

    import asyncio

    from docintel.services.vector_projection import DocumentVectorProjectionService

    settings = Settings()
    with session_scope(settings) as session:
        result = asyncio.run(
            DocumentVectorProjectionService(session, settings).search(query, limit)
        )
        typer.echo(
            json.dumps(
                {"status": result.status, "message": result.message, "results": result.results},
                indent=2,
            )
        )


@app.command("rebuild-graph")
def rebuild_graph(document_id: UUID | None = None) -> None:
    """Resolve entities and rebuild graph projection for one or all documents."""

    from docintel.services.graph.projection import DocumentGraphProjectionService

    settings = Settings()
    with session_scope(settings) as session:
        repository = DocumentRepository(session)
        documents = [repository.get(document_id)] if document_id else list(repository.list())
        results: list[dict[str, object]] = []
        for document in documents:
            if document is None:
                continue
            result = DocumentGraphProjectionService(session, settings).rebuild_document_graph(
                document
            )
            results.append(
                {
                    "document_id": str(document.id),
                    "status": result.status,
                    "message": result.message,
                    "projection_run_id": result.projection_run_id,
                    "node_count": len(result.nodes),
                    "edge_count": len(result.edges),
                }
            )
        typer.echo(json.dumps(results, indent=2))


@app.command("graph-search")
def graph_search(query: str, limit: int = 8) -> None:
    """Search resolved graph nodes locally."""

    from docintel.services.graph.projection import DocumentGraphProjectionService

    settings = Settings()
    with session_scope(settings) as session:
        result = DocumentGraphProjectionService(session, settings).search(query, limit)
        typer.echo(
            json.dumps(
                {"status": result.status, "message": result.message, "results": result.nodes},
                indent=2,
            )
        )


@app.command("profile-sync")
def profile_sync() -> None:
    """Synchronize bundled starter profiles and the core ontology."""

    from docintel.services.ontology.profiles import ExtractionProfileService

    settings = Settings()
    with session_scope(settings) as session:
        summaries = ExtractionProfileService(session).synchronize_starters()
        typer.echo(json.dumps([summary.__dict__ for summary in summaries], indent=2))


@app.command("profile-list")
def profile_list() -> None:
    """List approved extraction profiles and active versions."""

    from docintel.services.ontology.profiles import ExtractionProfileService

    settings = Settings()
    with session_scope(settings) as session:
        summaries = ExtractionProfileService(session).list_profiles()
        typer.echo(json.dumps([summary.__dict__ for summary in summaries], indent=2))


@app.command("profile-show")
def profile_show(profile_key: str, version: str | None = None) -> None:
    """Print one active or explicitly selected profile definition."""

    from docintel.services.ontology.profiles import (
        ExtractionProfileService,
        ProfileNotFoundError,
    )

    settings = Settings()
    with session_scope(settings) as session:
        try:
            definition = ExtractionProfileService(session).get_profile_definition(
                profile_key, version
            )
        except ProfileNotFoundError as exc:
            raise typer.BadParameter(str(exc)) from exc
        typer.echo(definition.model_dump_json(indent=2))


@app.command("profile-propose")
def profile_propose(definition_path: Path, rationale: str, evidence_path: Path) -> None:
    """Submit a JSON profile definition and JSON evidence list for review."""

    from docintel.domain.ontology import ExtractionProfileDefinition
    from docintel.services.ontology.profiles import ExtractionProfileService

    definition = ExtractionProfileDefinition.model_validate_json(
        definition_path.read_text(encoding="utf-8")
    )
    evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    if not isinstance(evidence, list):
        raise typer.BadParameter("evidence file must contain a JSON list")
    settings = Settings()
    with session_scope(settings) as session:
        proposal = ExtractionProfileService(session).submit_proposal(
            definition, rationale, evidence
        )
        typer.echo(
            json.dumps({"proposal_id": str(proposal.id), "status": proposal.status}, indent=2)
        )


@app.command("profile-review")
def profile_review(
    proposal_id: UUID,
    decision: str,
    reviewed_by: str,
    review_notes: str | None = None,
) -> None:
    """Approve or reject a draft profile proposal."""

    from docintel.services.ontology.profiles import ExtractionProfileService

    settings = Settings()
    with session_scope(settings) as session:
        proposal = ExtractionProfileService(session).review_proposal(
            proposal_id, decision.upper(), reviewed_by, review_notes
        )
        typer.echo(
            json.dumps(
                {
                    "proposal_id": str(proposal.id),
                    "status": proposal.status,
                    "active": False,
                },
                indent=2,
            )
        )


@app.command("profile-activate")
def profile_activate(profile_key: str, version: str) -> None:
    """Activate one approved profile version."""

    from docintel.services.ontology.profiles import ExtractionProfileService

    settings = Settings()
    with session_scope(settings) as session:
        summary = ExtractionProfileService(session).activate(profile_key, version)
        typer.echo(json.dumps(summary.__dict__, indent=2))


@app.command("profile-materialize")
def profile_materialize(document_id: UUID, profile_key: str) -> None:
    """Materialize typed rows for a document using an active profile."""

    from docintel.services.ontology.typed_outputs import TypedOutputService

    settings = Settings()
    with session_scope(settings) as session:
        outputs = TypedOutputService(session).materialize(document_id, profile_key)
        typer.echo(json.dumps([output.__dict__ for output in outputs], indent=2, default=str))
