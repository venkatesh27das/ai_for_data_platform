from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from uuid import UUID

from sqlalchemy.orm import Session

from docintel.config import Settings
from docintel.db.models import Document, ProcessingRun
from docintel.db.repositories.documents import DocumentRepository
from docintel.domain.canonical_ir import CanonicalDocument
from docintel.logging import get_logger
from docintel.services.ingestion.files import storage_path_for_document
from docintel.services.parsing.docling_parser import DoclingParser
from docintel.services.parsing.olmocr_parser import OlmocrParser
from docintel.services.parsing.router import CompositeParserRouter

logger = get_logger(__name__)


@dataclass(frozen=True)
class ProcessingResult:
    """Outcome of a synchronous document processing request."""

    document: Document
    run: ProcessingRun
    canonical: CanonicalDocument | None
    message: str


class DocumentProcessingService:
    """Phase 1/2 processing orchestration for registered documents."""

    def __init__(self, session: Session, settings: Settings) -> None:
        self.session = session
        self.settings = settings
        self.repository = DocumentRepository(session)

    async def process(self, document: Document) -> ProcessingResult:
        """Parse a registered document and persist canonical artifacts."""

        run = self.repository.create_processing_run(document)
        self.repository.add_event(
            document.id, run.id, "parse_document", "RUNNING", "Starting Docling parse."
        )
        logger.info(
            "processing_started", document_id=str(document.id), processing_run_id=str(run.id)
        )
        try:
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
            final_status = "PARTIAL" if canonical.warnings else "SUCCEEDED"
            message = self._success_message(final_status, canonical, len(artifacts))
            self.repository.add_event(
                document.id,
                run.id,
                "finalize_quality_report",
                final_status,
                message,
                {"warnings": canonical.warnings, "artifact_count": len(artifacts)},
            )
            run = self.repository.finish_processing_run(document, run, final_status)
            logger.info(
                "processing_finished",
                document_id=str(document.id),
                processing_run_id=str(run.id),
                status=final_status,
            )
            return ProcessingResult(
                document=document, run=run, canonical=canonical, message=message
            )
        except Exception as exc:
            message = f"Document processing failed: {exc}"
            self.repository.add_event(document.id, run.id, "parse_document", "FAILED", message)
            run = self.repository.finish_processing_run(document, run, "FAILED", message)
            logger.exception(
                "processing_failed", document_id=str(document.id), processing_run_id=str(run.id)
            )
            return ProcessingResult(document=document, run=run, canonical=None, message=message)

    async def _parse(self, document: Document, run: ProcessingRun) -> CanonicalDocument:
        file_path = storage_path_for_document(document.id, document.storage_uri)
        parser = DoclingParser(
            file_name=document.file_name,
            file_type=document.file_type,
            checksum_sha256=document.checksum_sha256,
        )
        router = CompositeParserRouter([parser, OlmocrParser()])
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
        return canonical

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

    def _success_message(
        self, status: str, canonical: CanonicalDocument, artifact_count: int
    ) -> str:
        element_count = sum(len(page.elements) for page in canonical.pages)
        warning_suffix = " with warnings" if canonical.warnings else ""
        return (
            f"Processing {status.lower()}{warning_suffix}: parsed {len(canonical.pages)} pages, "
            f"{element_count} elements, and wrote {artifact_count} artifacts."
        )
