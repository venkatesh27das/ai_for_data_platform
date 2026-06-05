import asyncio
import json
from uuid import uuid4

import httpx

from docintel.config import Settings
from docintel.db.models import Chunk
from docintel.services.extraction.deterministic import DeterministicExtractor
from docintel.services.extraction.lmstudio import (
    EXTRACTOR_NAME,
    LMStudioStructuredExtractionProvider,
)


def test_deterministic_extractor_finds_common_fields_and_evidence() -> None:
    document_id = uuid4()
    chunk = Chunk(
        document_id=document_id,
        processing_run_id=uuid4(),
        chunk_id="chunk-001",
        chunk_type="text",
        text=(
            "Acme Corp must notify support@example.com by March 12, 2026. "
            "The annual fee is $12,500.00 and uptime target is 99.9%. "
            "Reference ID SLA-2026-A."
        ),
        markdown=None,
        section_path_json=["Service Terms"],
        page_numbers_json=[3],
        source_element_ids_json=["e000042"],
        quality_score=1.0,
        metadata_json={},
    )

    result = DeterministicExtractor().extract(document_id, "contract.pdf", [chunk])

    assert {field.field_name for field in result.fields} >= {
        "email",
        "currency_amount",
        "percentage",
        "date",
        "identifier",
    }
    assert any(entity.entity_type == "Email" for entity in result.entities)
    assert any(
        relationship.relationship_type == "MENTIONS" for relationship in result.relationships
    )
    assert len(result.obligations) == 1
    assert result.fields[0].evidence[0].page_number == 3
    assert result.fields[0].evidence[0].element_id == "e000042"


def test_lmstudio_extraction_provider_validates_structured_response(monkeypatch) -> None:
    document_id = uuid4()
    chunk = Chunk(
        document_id=document_id,
        processing_run_id=uuid4(),
        chunk_id="chunk-001",
        chunk_type="text",
        text="Acme Corp signed the agreement on March 12, 2026.",
        markdown=None,
        section_path_json=["Agreement"],
        page_numbers_json=[1],
        source_element_ids_json=["e000001"],
        quality_score=1.0,
        metadata_json={},
    )
    model_payload = {
        "document_id": str(document_id),
        "fields": [
            {
                "field_name": "effective_date",
                "field_type": "date",
                "value": "March 12, 2026",
                "normalized_value": "2026-03-12",
                "confidence": 0.91,
                "evidence": [
                    {
                        "document_id": str(document_id),
                        "page_number": 1,
                        "element_id": "e000001",
                        "source_text": "signed the agreement on March 12, 2026",
                    }
                ],
                "extractor_name": EXTRACTOR_NAME,
            }
        ],
        "entities": [],
        "relationships": [],
        "events": [],
        "claims": [],
        "obligations": [],
    }

    class FakeResponse:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict[str, object]:
            return {"choices": [{"message": {"content": json.dumps(model_payload)}}]}

    class FakeAsyncClient:
        def __init__(self, timeout: int) -> None:
            self.timeout = timeout

        async def __aenter__(self) -> "FakeAsyncClient":
            return self

        async def __aexit__(self, *args: object) -> None:
            return None

        async def post(
            self,
            url: str,
            headers: dict[str, str],
            json: dict[str, object],
        ) -> FakeResponse:
            assert url.endswith("/chat/completions")
            assert headers["Authorization"] == "Bearer lm-studio"
            assert json["response_format"]
            return FakeResponse()

    monkeypatch.setattr(httpx, "AsyncClient", FakeAsyncClient)
    settings = Settings(lm_studio_llm_model="gemma-local")

    result = asyncio.run(
        LMStudioStructuredExtractionProvider(settings).extract(
            document_id, "agreement.pdf", [chunk]
        )
    )

    assert result.document_id == document_id
    assert result.fields[0].field_name == "effective_date"
    assert result.fields[0].extractor_name == EXTRACTOR_NAME
    assert result.fields[0].evidence[0].document_id == document_id
