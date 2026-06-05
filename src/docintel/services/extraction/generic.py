from __future__ import annotations

from collections.abc import Callable, Hashable
from dataclasses import dataclass
from typing import TypeVar

from sqlalchemy.orm import Session

from docintel.config import Settings
from docintel.db.models import Chunk, Document, ProcessingRun
from docintel.db.repositories.documents import DocumentRepository
from docintel.domain.extraction import GenericExtractionResult
from docintel.logging import get_logger
from docintel.services.extraction.deterministic import DeterministicExtractor
from docintel.services.extraction.lmstudio import (
    PROMPT_VERSION,
    LMStudioExtractionUnavailableError,
    LMStudioExtractionValidationError,
    LMStudioStructuredExtractionProvider,
)

logger = get_logger(__name__)
T = TypeVar("T")


@dataclass(frozen=True)
class GenericExtractionServiceResult:
    """Outcome of a generic extraction run."""

    status: str
    message: str
    extraction_run_id: str | None
    result: GenericExtractionResult | None
    model_status: str = "skipped"
    model_error: str | None = None

    @property
    def field_count(self) -> int:
        return len(self.result.fields) if self.result else 0

    @property
    def entity_count(self) -> int:
        return len(self.result.entities) if self.result else 0

    @property
    def relationship_count(self) -> int:
        return len(self.result.relationships) if self.result else 0

    @property
    def event_count(self) -> int:
        return len(self.result.events) if self.result else 0

    @property
    def claim_count(self) -> int:
        return len(self.result.claims) if self.result else 0

    @property
    def obligation_count(self) -> int:
        return len(self.result.obligations) if self.result else 0


class GenericExtractionService:
    """Phase 4 generic structured extraction orchestration."""

    def __init__(self, session: Session, settings: Settings) -> None:
        self.session = session
        self.settings = settings
        self.repository = DocumentRepository(session)
        self.deterministic_extractor = DeterministicExtractor()
        self.model_provider = LMStudioStructuredExtractionProvider(settings)

    async def run(
        self, document: Document, processing_run: ProcessingRun | None = None
    ) -> GenericExtractionServiceResult:
        """Run generic extraction from persisted chunks."""

        chunks = list(self.repository.list_chunks(document.id))
        if not chunks:
            message = "Generic extraction requires chunks. Process the document first."
            return GenericExtractionServiceResult("unavailable", message, None, None)

        extraction_run = self.repository.create_extraction_run(
            document_id=document.id,
            processing_run_id=processing_run.id if processing_run else None,
            extractor_name="generic_extraction_pipeline_v1",
            model_id=(
                None
                if self.settings.lm_studio_llm_model.startswith("<set-your")
                else self.settings.lm_studio_llm_model
            ),
            prompt_version=PROMPT_VERSION,
        )
        if processing_run:
            self.repository.add_event(
                document.id,
                processing_run.id,
                "run_generic_extraction",
                "RUNNING",
                "Running deterministic and model-backed generic extraction.",
            )
        try:
            deterministic_result = self.deterministic_extractor.extract(
                document.id, document.file_name, chunks
            )
            model_result, model_status, model_error = await self._run_model_extraction(
                document, chunks
            )
            result = (
                _merge_results(deterministic_result, model_result)
                if model_result
                else deterministic_result
            )
            result = _filter_confidence(result, self.settings)
            self.repository.persist_extraction_result(result, extraction_run)
            run_status = "PARTIAL" if model_status == "failed" else "SUCCEEDED"
            self.repository.finish_extraction_run(extraction_run, run_status, model_error)
            message = _build_message(result, model_status, model_error)
            if processing_run:
                self.repository.add_event(
                    document.id,
                    processing_run.id,
                    "run_generic_extraction",
                    run_status,
                    message,
                    {
                        "field_count": len(result.fields),
                        "entity_count": len(result.entities),
                        "relationship_count": len(result.relationships),
                        "event_count": len(result.events),
                        "claim_count": len(result.claims),
                        "obligation_count": len(result.obligations),
                        "model_status": model_status,
                        "model_error": model_error,
                    },
                )
            logger.info(
                "generic_extraction_finished",
                document_id=str(document.id),
                extraction_run_id=str(extraction_run.id),
                model_status=model_status,
            )
            return GenericExtractionServiceResult(
                "available",
                message,
                str(extraction_run.id),
                result,
                model_status=model_status,
                model_error=model_error,
            )
        except Exception as exc:
            message = f"Generic extraction failed: {exc}"
            self.repository.finish_extraction_run(extraction_run, "FAILED", message)
            if processing_run:
                self.repository.add_event(
                    document.id,
                    processing_run.id,
                    "run_generic_extraction",
                    "FAILED",
                    message,
                )
            logger.exception(
                "generic_extraction_failed",
                document_id=str(document.id),
                extraction_run_id=str(extraction_run.id),
            )
            return GenericExtractionServiceResult("failed", message, str(extraction_run.id), None)

    async def _run_model_extraction(
        self, document: Document, chunks: list[Chunk]
    ) -> tuple[GenericExtractionResult | None, str, str | None]:
        try:
            result = await self.model_provider.extract(document.id, document.file_name, chunks)
        except LMStudioExtractionUnavailableError as exc:
            return None, "skipped", str(exc)
        except LMStudioExtractionValidationError as exc:
            return None, "failed", str(exc)
        except Exception as exc:
            return None, "failed", f"Unexpected LM Studio extraction failure: {exc}"
        return result, "succeeded", None


def _merge_results(
    deterministic: GenericExtractionResult, model_result: GenericExtractionResult
) -> GenericExtractionResult:
    """Merge deterministic and model results without duplicate generic records."""

    return GenericExtractionResult(
        document_id=deterministic.document_id,
        fields=_dedupe(
            [*deterministic.fields, *model_result.fields],
            lambda item: (item.field_name.casefold(), item.normalized_value or item.value),
        ),
        entities=_dedupe(
            [*deterministic.entities, *model_result.entities],
            lambda item: (item.entity_type.casefold(), item.canonical_name.casefold()),
        ),
        relationships=_dedupe(
            [*deterministic.relationships, *model_result.relationships],
            lambda item: (
                item.relationship_type.casefold(),
                item.source_entity.casefold(),
                item.target_entity.casefold(),
            ),
        ),
        events=_dedupe(
            [*deterministic.events, *model_result.events],
            lambda item: (item.event_type.casefold(), item.name.casefold()),
        ),
        claims=_dedupe(
            [*deterministic.claims, *model_result.claims],
            lambda item: item.claim_text.casefold(),
        ),
        obligations=_dedupe(
            [*deterministic.obligations, *model_result.obligations],
            lambda item: item.obligation_text.casefold(),
        ),
    )


def _dedupe(items: list[T], key_func: Callable[[T], Hashable]) -> list[T]:
    seen: set[Hashable] = set()
    merged: list[T] = []
    for item in items:
        key = key_func(item)
        if key in seen:
            continue
        seen.add(key)
        merged.append(item)
    return merged


def _build_message(
    result: GenericExtractionResult, model_status: str, model_error: str | None
) -> str:
    model_suffix = {
        "succeeded": "Model extraction succeeded.",
        "skipped": "Model extraction skipped.",
        "failed": "Model extraction failed; deterministic results were preserved.",
    }[model_status]
    if model_error and model_status != "succeeded":
        model_suffix = f"{model_suffix} {model_error}"
    return (
        "Generic extraction available: "
        f"{len(result.fields)} fields, {len(result.entities)} entities, "
        f"{len(result.relationships)} relationships, {len(result.events)} events, "
        f"{len(result.claims)} claims, {len(result.obligations)} obligations. "
        f"{model_suffix}"
    )


def _filter_confidence(
    result: GenericExtractionResult, settings: Settings
) -> GenericExtractionResult:
    return GenericExtractionResult(
        document_id=result.document_id,
        fields=[
            item for item in result.fields if item.confidence >= settings.min_extraction_confidence
        ],
        entities=[
            item
            for item in result.entities
            if item.confidence >= settings.min_extraction_confidence
        ],
        relationships=[
            item
            for item in result.relationships
            if item.confidence >= settings.min_relationship_confidence
        ],
        events=[
            item for item in result.events if item.confidence >= settings.min_extraction_confidence
        ],
        claims=[
            item for item in result.claims if item.confidence >= settings.min_extraction_confidence
        ],
        obligations=[
            item
            for item in result.obligations
            if item.confidence >= settings.min_extraction_confidence
        ],
    )
