from __future__ import annotations

import json
from pathlib import Path
from uuid import UUID

import httpx
from pydantic import ValidationError

from docintel.config import Settings
from docintel.db.models import Chunk
from docintel.domain.extraction import GenericExtractionResult

PROMPT_VERSION = "generic_extraction_v1"
EXTRACTOR_NAME = "lm_studio_structured_output_v1"
MAX_MODEL_CHUNKS = 24
MAX_CHUNK_CHARS = 2400


class LMStudioExtractionUnavailableError(RuntimeError):
    """Raised when the local LM Studio extraction model is not configured or reachable."""


class LMStudioExtractionValidationError(RuntimeError):
    """Raised when model output fails schema validation."""


class LMStudioStructuredExtractionProvider:
    """Generic structured extraction provider using LM Studio chat completions."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def extract(
        self, document_id: UUID, file_name: str, chunks: list[Chunk]
    ) -> GenericExtractionResult:
        """Extract generic structured records from chunks with JSON schema validation."""

        model = self.settings.lm_studio_llm_model
        if model.startswith("<set-your"):
            raise LMStudioExtractionUnavailableError("LM_STUDIO_LLM_MODEL is not configured")

        payload = self._request_payload(document_id, file_name, chunks, model)
        headers = {"Authorization": f"Bearer {self.settings.lm_studio_api_key}"}
        try:
            async with httpx.AsyncClient(
                timeout=self.settings.lm_studio_request_timeout_seconds
            ) as client:
                response = await client.post(
                    f"{self.settings.lm_studio_base_url.rstrip('/')}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise LMStudioExtractionUnavailableError(
                f"LM Studio structured extraction request failed: {exc}"
            ) from exc

        content = _extract_message_content(response.json())
        try:
            result = GenericExtractionResult.model_validate_json(content)
        except (ValidationError, ValueError) as exc:
            raise LMStudioExtractionValidationError(
                f"LM Studio returned invalid structured extraction JSON: {exc}"
            ) from exc
        return _normalize_model_result(result, document_id)

    def _request_payload(
        self, document_id: UUID, file_name: str, chunks: list[Chunk], model: str
    ) -> dict[str, object]:
        prompt = _load_prompt()
        chunk_payload = [
            {
                "chunk_id": chunk.chunk_id,
                "chunk_type": chunk.chunk_type,
                "page_numbers": chunk.page_numbers_json,
                "source_element_ids": chunk.source_element_ids_json,
                "section_path": chunk.section_path_json,
                "text": chunk.text[:MAX_CHUNK_CHARS],
            }
            for chunk in chunks[:MAX_MODEL_CHUNKS]
        ]
        user_payload = {
            "document_id": str(document_id),
            "file_name": file_name,
            "chunks": chunk_payload,
            "instructions": (
                "Return only items supported by the supplied chunks. "
                "Every item must include evidence with document_id, page_number, "
                "element_id when available, and a concise source_text quote."
            ),
        }
        return {
            "model": model,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
            ],
            "temperature": 0,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "generic_extraction_result",
                    "strict": False,
                    "schema": GenericExtractionResult.model_json_schema(),
                },
            },
        }


def _extract_message_content(payload: dict[str, object]) -> str:
    choices = payload.get("choices")
    if not isinstance(choices, list) or not choices:
        raise LMStudioExtractionValidationError("LM Studio response did not include choices")
    first = choices[0]
    if not isinstance(first, dict):
        raise LMStudioExtractionValidationError("LM Studio response choice was not an object")
    message = first.get("message")
    if not isinstance(message, dict):
        raise LMStudioExtractionValidationError("LM Studio response did not include a message")
    content = message.get("content")
    if not isinstance(content, str) or not content.strip():
        raise LMStudioExtractionValidationError("LM Studio response message was empty")
    return content


def _normalize_model_result(
    result: GenericExtractionResult, document_id: UUID
) -> GenericExtractionResult:
    """Force model-scoped metadata to match the registered document and extractor."""

    for collection in (
        result.fields,
        result.entities,
        result.relationships,
        result.events,
        result.claims,
        result.obligations,
    ):
        for item in collection:
            item.extractor_name = EXTRACTOR_NAME
            for evidence in item.evidence:
                evidence.document_id = document_id
    result.document_id = document_id
    return result


def _load_prompt() -> str:
    path = Path(__file__).parents[2] / "prompts" / "generic_extraction.md"
    return path.read_text(encoding="utf-8")
