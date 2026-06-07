from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import cast
from uuid import UUID

from sqlalchemy.orm import Session

from docintel.config import Settings
from docintel.db.models import Document, ProcessingRun
from docintel.db.repositories.documents import DocumentRepository
from docintel.domain.canonical_ir import CanonicalDocument
from docintel.logging import get_logger
from docintel.services.extraction.generic import (
    GenericExtractionService,
    GenericExtractionServiceResult,
)
from docintel.services.graph.projection import (
    DocumentGraphProjectionService,
    GraphProjectionResult,
)
from docintel.services.ingestion.files import storage_path_for_document
from docintel.services.parsing.docling_parser import DoclingParser
from docintel.services.parsing.ocr_fallback import OcrFallbackService
from docintel.services.parsing.router import CompositeParserRouter
from docintel.services.vector_projection import (
    DocumentVectorProjectionService,
    VectorProjectionResult,
)

logger = get_logger(__name__)


@dataclass(frozen=True)
class ProcessingResult:
    """Outcome of a synchronous document processing request."""

    document: Document
    run: ProcessingRun
    canonical: CanonicalDocument | None
    message: str


class DocumentProcessingService:
    """Shared synchronous and Celery-stage document processing orchestration."""

    def __init__(self, session: Session, settings: Settings) -> None:
        self.session = session
        self.settings = settings
        self.repository = DocumentRepository(session)

    async def process(self, document: Document) -> ProcessingResult:
        """Run all processing stages synchronously."""

        run = self.start(document)
        stage_data: dict[str, object] = {}
        canonical: CanonicalDocument | None = None
        self.repository.add_event(
            document.id, run.id, "parse_document", "RUNNING", "Starting Docling parse."
        )
        logger.info(
            "processing_started", document_id=str(document.id), processing_run_id=str(run.id)
        )
        try:
            canonical, parse_data = await self.parse_and_persist(document, run)
            stage_data.update(parse_data)
            vector_result = await self.project_vectors(document, run, canonical)
            stage_data.update(self.vector_stage_data(vector_result))
            extraction_result = await self.run_extraction(document, run)
            stage_data.update(self.extraction_stage_data(extraction_result))
            graph_result = self.project_graph(document, run)
            stage_data.update(self.graph_stage_data(graph_result))
            return self.finalize(document, run, stage_data, canonical)
        except Exception as exc:
            return self.fail(document, run, exc)

    def start(self, document: Document, status: str = "RUNNING") -> ProcessingRun:
        """Create a persisted processing run for sync or queued execution."""

        return self.repository.create_processing_run(document, status)

    async def parse_and_persist(
        self, document: Document, run: ProcessingRun
    ) -> tuple[CanonicalDocument, dict[str, object]]:
        """Parse, normalize, and persist canonical artifacts."""

        canonical = await self._parse(document, run)
        self.repository.add_event(
            document.id,
            run.id,
            "persist_artifacts",
            "RUNNING",
            "Persisting canonical and parser artifacts.",
        )
        artifacts = self._persist_artifacts(canonical, run)
        self.repository.persist_canonical_document(canonical, run.id)
        return canonical, {
            "artifact_count": len(artifacts),
            "warnings": canonical.warnings,
            "page_quality_scores": [
                page.text_quality_score
                for page in canonical.pages
                if page.text_quality_score is not None
            ],
            "page_count": len(canonical.pages),
            "element_count": sum(len(page.elements) for page in canonical.pages),
        }

    async def project_vectors(
        self,
        document: Document,
        run: ProcessingRun,
        canonical: CanonicalDocument | None = None,
    ) -> VectorProjectionResult:
        """Build chunks and project vectors from canonical IR."""

        loaded = canonical or self.load_canonical(document.id, run.id)
        if loaded is None:
            raise RuntimeError("canonical artifact is unavailable for vector projection")
        return await DocumentVectorProjectionService(
            self.session, self.settings
        ).project_from_canonical(document, run, loaded)

    async def run_extraction(
        self, document: Document, run: ProcessingRun
    ) -> GenericExtractionServiceResult:
        """Run generic structured extraction."""

        return await GenericExtractionService(self.session, self.settings).run(document, run)

    def project_graph(self, document: Document, run: ProcessingRun) -> GraphProjectionResult:
        """Resolve entities and project graph records."""

        return DocumentGraphProjectionService(self.session, self.settings).rebuild_document_graph(
            document, run
        )

    def finalize(
        self,
        document: Document,
        run: ProcessingRun,
        stage_data: dict[str, object],
        canonical: CanonicalDocument | None = None,
    ) -> ProcessingResult:
        """Persist quality metrics and finalize a successful or partial run."""

        warnings = _string_list(stage_data.get("warnings"))
        vector_status = str(stage_data.get("vector_status", "unavailable"))
        extraction_status = str(stage_data.get("extraction_status", "failed"))
        graph_status = str(stage_data.get("graph_status", "unavailable"))
        final_status = (
            "PARTIAL"
            if (
                warnings
                or vector_status != "available"
                or extraction_status == "failed"
                or graph_status not in {"available", "partial"}
            )
            else "SUCCEEDED"
        )
        message = self._stage_message(final_status, stage_data)
        self._persist_quality_scores(document, run, stage_data)
        self.repository.add_event(
            document.id,
            run.id,
            "finalize_quality_report",
            final_status,
            message,
            stage_data,
        )
        run = self.repository.finish_processing_run(document, run, final_status)
        logger.info(
            "processing_finished",
            document_id=str(document.id),
            processing_run_id=str(run.id),
            status=final_status,
        )
        return ProcessingResult(
            document=document,
            run=run,
            canonical=canonical or self.load_canonical(document.id, run.id),
            message=message,
        )

    def fail(
        self, document: Document, run: ProcessingRun, error: Exception | str
    ) -> ProcessingResult:
        """Finalize a failed run without losing the processing trace."""

        message = f"Document processing failed: {error}"
        self.repository.add_event(document.id, run.id, "processing_pipeline", "FAILED", message)
        run = self.repository.finish_processing_run(document, run, "FAILED", message)
        logger.error(
            "processing_failed",
            document_id=str(document.id),
            processing_run_id=str(run.id),
            error=str(error),
        )
        return ProcessingResult(document=document, run=run, canonical=None, message=message)

    def load_canonical(
        self, document_id: UUID, processing_run_id: UUID | None = None
    ) -> CanonicalDocument | None:
        """Load persisted canonical IR for a document or processing run."""

        artifact = next(
            (
                item
                for item in self.repository.list_artifacts(document_id)
                if item.artifact_type == "canonical_json"
                and (processing_run_id is None or item.processing_run_id == processing_run_id)
            ),
            None,
        )
        if artifact is None:
            return None
        path = Path(artifact.uri)
        if not path.exists():
            return None
        return CanonicalDocument.model_validate_json(path.read_text(encoding="utf-8"))

    @staticmethod
    def vector_stage_data(result: VectorProjectionResult) -> dict[str, object]:
        return {
            "vector_status": result.status,
            "chunk_count": result.chunk_count,
            "indexed_count": result.indexed_count,
            "vector_message": result.message,
        }

    @staticmethod
    def extraction_stage_data(
        result: GenericExtractionServiceResult,
    ) -> dict[str, object]:
        return {
            "extraction_status": result.status,
            "field_count": result.field_count,
            "entity_count": result.entity_count,
            "relationship_count": result.relationship_count,
            "event_count": result.event_count,
            "claim_count": result.claim_count,
            "obligation_count": result.obligation_count,
            "extraction_message": result.message,
        }

    @staticmethod
    def graph_stage_data(result: GraphProjectionResult) -> dict[str, object]:
        return {
            "graph_status": result.status,
            "graph_node_count": len(result.nodes),
            "graph_edge_count": len(result.edges),
            "graph_message": result.message,
        }

    def _persist_quality_scores(
        self,
        document: Document,
        run: ProcessingRun,
        stage_data: dict[str, object],
    ) -> None:
        page_scores = _float_list(stage_data.get("page_quality_scores"))
        text_quality = sum(page_scores) / len(page_scores) if page_scores else 0.0
        vector_score = 1.0 if stage_data.get("vector_status") == "available" else 0.0
        extraction_score = 1.0 if stage_data.get("extraction_status") == "available" else 0.0
        graph_score = 1.0 if stage_data.get("graph_status") in {"available", "partial"} else 0.0
        overall = (text_quality + vector_score + extraction_score + graph_score) / 4
        self.repository.replace_quality_scores(
            document.id,
            run.id,
            [
                (
                    "text_quality",
                    text_quality,
                    self.settings.min_text_quality_score,
                    (
                        "PASSED"
                        if text_quality >= self.settings.min_text_quality_score
                        else "REQUIRES_REVIEW"
                    ),
                    {"page_scores": page_scores},
                ),
                (
                    "vector_projection",
                    vector_score,
                    1.0,
                    "PASSED" if vector_score == 1.0 else "RETRYABLE",
                    {"message": stage_data.get("vector_message")},
                ),
                (
                    "structured_extraction",
                    extraction_score,
                    1.0,
                    "PASSED" if extraction_score == 1.0 else "RETRYABLE",
                    {"message": stage_data.get("extraction_message")},
                ),
                (
                    "graph_projection",
                    graph_score,
                    1.0,
                    "PASSED" if graph_score == 1.0 else "RETRYABLE",
                    {"message": stage_data.get("graph_message")},
                ),
                (
                    "overall",
                    overall,
                    0.75,
                    "PASSED" if overall >= 0.75 else "REQUIRES_REVIEW",
                    {"warning_count": len(_string_list(stage_data.get("warnings")))},
                ),
            ],
        )

    def _stage_message(self, status: str, stage_data: dict[str, object]) -> str:
        warning_suffix = " with warnings" if stage_data.get("warnings") else ""
        return (
            f"Processing {status.lower()}{warning_suffix}: parsed "
            f"{stage_data.get('page_count', 0)} pages, "
            f"{stage_data.get('element_count', 0)} elements, wrote "
            f"{stage_data.get('artifact_count', 0)} artifacts, built "
            f"{stage_data.get('chunk_count', 0)} chunks, and indexed "
            f"{stage_data.get('indexed_count', 0)} vectors. Extracted "
            f"{stage_data.get('field_count', 0)} fields, "
            f"{stage_data.get('entity_count', 0)} entities, and "
            f"{stage_data.get('relationship_count', 0)} relationships. Built "
            f"{stage_data.get('graph_node_count', 0)} graph nodes and "
            f"{stage_data.get('graph_edge_count', 0)} graph edges."
        )

    async def _parse(self, document: Document, run: ProcessingRun) -> CanonicalDocument:
        file_path = storage_path_for_document(document.id, document.storage_uri)
        parser = DoclingParser(
            file_name=document.file_name,
            file_type=document.file_type,
            checksum_sha256=document.checksum_sha256,
        )
        router = CompositeParserRouter([parser])
        selected = router.select(str(file_path))
        canonical = await selected.parse(str(file_path), str(document.id))
        self.repository.add_event(
            document.id,
            run.id,
            "parse_document",
            "SUCCEEDED",
            f"Parsed with {selected.name}.",
            {
                "page_count": len(canonical.pages),
                "element_count": sum(len(page.elements) for page in canonical.pages),
            },
        )
        ocr_result = await OcrFallbackService(self.settings).apply(canonical, file_path)
        if ocr_result.status != "not_required":
            self.repository.add_event(
                document.id,
                run.id,
                "ocr_fallback",
                "SUCCEEDED" if ocr_result.status == "applied" else "RETRYABLE",
                ocr_result.message,
                {
                    "ocr_status": ocr_result.status,
                    "ocr_provider": self.settings.ocr_provider,
                    "ocr_required_pages": ocr_result.required_pages,
                    "olmocr_enabled": self.settings.olmocr_enabled,
                },
            )
        return ocr_result.canonical

    def _persist_artifacts(self, canonical: CanonicalDocument, run: ProcessingRun) -> list[Path]:
        artifact_dir = self.settings.artifacts_dir / str(canonical.document_id) / str(run.id)
        artifact_dir.mkdir(parents=True, exist_ok=True)

        native_json = canonical.metadata.pop("parser_native_json", None)
        docling_markdown = canonical.metadata.pop("docling_markdown", None)
        canonical_json_path = artifact_dir / "canonical.json"
        markdown_path = artifact_dir / "document.md"
        parser_native_path = artifact_dir / "docling_native.json"

        canonical_json_path.write_text(canonical.model_dump_json(indent=2), encoding="utf-8")
        markdown_path.write_text(
            docling_markdown if isinstance(docling_markdown, str) else canonical.to_markdown(),
            encoding="utf-8",
        )
        if isinstance(native_json, str):
            parser_native_path.write_text(native_json, encoding="utf-8")
        else:
            parser_native_path.write_text("{}", encoding="utf-8")

        persisted = [
            self._record_artifact(
                canonical.document_id,
                run.id,
                "canonical_json",
                canonical_json_path,
                "application/json",
            ),
            self._record_artifact(
                canonical.document_id,
                run.id,
                "markdown",
                markdown_path,
                "text/markdown",
            ),
            self._record_artifact(
                canonical.document_id,
                run.id,
                "parser_native_json",
                parser_native_path,
                "application/json",
            ),
        ]
        persisted.extend(self._persist_table_artifacts(canonical, run, artifact_dir))
        return persisted

    def _persist_table_artifacts(
        self, canonical: CanonicalDocument, run: ProcessingRun, artifact_dir: Path
    ) -> list[Path]:
        paths: list[Path] = []
        table_index = 0
        for page in canonical.pages:
            for element in page.elements:
                if element.element_type != "table":
                    continue
                table_index += 1
                table_path = artifact_dir / f"table_{table_index:03d}.md"
                table_payload_path = artifact_dir / f"table_{table_index:03d}.json"
                table_path.write_text(element.markdown or "", encoding="utf-8")
                table_payload_path.write_text(
                    json.dumps(element.table_data or {}, indent=2), encoding="utf-8"
                )
                paths.append(
                    self._record_artifact(
                        canonical.document_id,
                        run.id,
                        "table_markdown",
                        table_path,
                        "text/markdown",
                        {"element_id": element.element_id, "page_number": page.page_number},
                    )
                )
                paths.append(
                    self._record_artifact(
                        canonical.document_id,
                        run.id,
                        "table_json",
                        table_payload_path,
                        "application/json",
                        {"element_id": element.element_id, "page_number": page.page_number},
                    )
                )
        return paths

    def _record_artifact(
        self,
        document_id: UUID,
        processing_run_id: UUID,
        artifact_type: str,
        path: Path,
        media_type: str,
        metadata: dict[str, object] | None = None,
    ) -> Path:
        self.repository.persist_artifact(
            document_id=document_id,
            processing_run_id=processing_run_id,
            artifact_type=artifact_type,
            uri=str(path),
            media_type=media_type,
            metadata=metadata,
        )
        return path


def _string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item) for item in cast(list[object], value)]


def _float_list(value: object) -> list[float]:
    if not isinstance(value, list):
        return []
    scores: list[float] = []
    for item in cast(list[object], value):
        if isinstance(item, int | float):
            scores.append(float(item))
    return scores
