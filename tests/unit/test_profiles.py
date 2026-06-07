from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import select

from docintel.db.models import (
    Document,
    ExtractedFieldRecord,
    ExtractionRun,
    ReviewTask,
)
from docintel.domain.ontology import ExtractionProfileDefinition
from docintel.services.ontology.profiles import load_core_ontology, load_starter_profiles


def _draft_profile() -> dict[str, object]:
    return {
        "profile_key": "research_report_v1",
        "version": "1.0.0",
        "name": "Research Report",
        "description": "Structured research report metadata.",
        "supported_document_classes": ["research_report"],
        "fields": [
            {
                "name": "study_title",
                "field_type": "string",
                "required": True,
                "description": "Study title",
            }
        ],
        "entities": [],
        "relationships": [],
        "typed_output_tables": [
            {
                "table_name": "research_studies",
                "description": "Normalized study metadata",
                "fields": [
                    {
                        "name": "study_title",
                        "field_type": "string",
                        "required": True,
                        "description": "Study title",
                    }
                ],
            }
        ],
        "validation_rules": {"require_evidence": True},
        "minimum_confidence": 0.75,
    }


def test_bundled_profiles_and_ontology_validate() -> None:
    profiles = load_starter_profiles()
    assert {profile.profile_key for profile in profiles} == {
        "contract_v1",
        "invoice_v1",
        "policy_document_v1",
    }
    assert all(profile.typed_output_tables for profile in profiles)
    ontology = load_core_ontology()
    assert ontology.ontology_key == "core"
    assert len(ontology.entity_types) == 18
    assert len(ontology.relationship_types) == 18


def test_profile_definition_rejects_unsafe_table_name() -> None:
    payload = _draft_profile()
    payload["typed_output_tables"] = [
        {
            "table_name": "Research Studies",
            "description": "Invalid table",
            "fields": [],
        }
    ]
    with pytest.raises(ValidationError):
        ExtractionProfileDefinition.model_validate(payload)


def test_profile_api_review_does_not_auto_activate(client: TestClient, test_session) -> None:
    sync = client.post("/api/v1/extraction-profiles/sync-starters")
    assert sync.status_code == 200
    assert {item["profile_key"] for item in sync.json()} == {
        "contract_v1",
        "invoice_v1",
        "policy_document_v1",
    }
    assert all(item["active_version"] == "1.0.0" for item in sync.json())

    ontology = client.get("/api/v1/ontologies")
    assert ontology.status_code == 200
    assert ontology.json()[0]["status"] == "ACTIVE"

    create = client.post(
        "/api/v1/extraction-profiles/proposals",
        json={
            "definition": _draft_profile(),
            "rationale": "A recurring research document class needs stable typed output.",
            "sample_evidence": [
                {
                    "document_id": str(UUID(int=1)),
                    "page_number": 1,
                    "source_text": "Study title: Local Retrieval Evaluation",
                }
            ],
        },
    )
    assert create.status_code == 201
    proposal = create.json()
    assert proposal["status"] == "PROPOSED"

    task = test_session.scalar(
        select(ReviewTask).where(ReviewTask.target_id == UUID(proposal["id"]))
    )
    assert task is not None
    assert task.status == "PENDING"

    approve = client.post(
        f"/api/v1/extraction-profiles/proposals/{proposal['id']}/review",
        json={
            "decision": "APPROVED",
            "reviewed_by": "local-admin",
            "review_notes": "Definition and sample evidence reviewed.",
        },
    )
    assert approve.status_code == 200
    assert approve.json()["status"] == "APPROVED"

    profiles = client.get("/api/v1/extraction-profiles")
    research = next(item for item in profiles.json() if item["profile_key"] == "research_report_v1")
    assert research["active_version"] is None
    assert research["versions"] == ["1.0.0"]

    inactive = client.get("/api/v1/extraction-profiles/research_report_v1")
    assert inactive.status_code == 404

    activate = client.post("/api/v1/extraction-profiles/research_report_v1/versions/1.0.0/activate")
    assert activate.status_code == 200
    assert activate.json()["active_version"] == "1.0.0"

    active = client.get("/api/v1/extraction-profiles/research_report_v1")
    assert active.status_code == 200
    assert active.json()["typed_output_tables"][0]["table_name"] == "research_studies"

    document = Document(
        file_name="study.pdf",
        file_type="pdf",
        checksum_sha256="b" * 64,
        storage_uri="data/uploads/study.pdf",
        size_bytes=10,
        status="SUCCEEDED",
    )
    test_session.add(document)
    test_session.flush()
    extraction_run = ExtractionRun(
        document_id=document.id,
        status="SUCCEEDED",
        extractor_name="test",
    )
    test_session.add(extraction_run)
    test_session.flush()
    test_session.add(
        ExtractedFieldRecord(
            document_id=document.id,
            extraction_run_id=extraction_run.id,
            field_name="study_title",
            field_type="string",
            value="Local Retrieval Evaluation",
            normalized_value=None,
            confidence=0.93,
            source_evidence_json=[
                {
                    "document_id": str(document.id),
                    "page_number": 1,
                    "source_text": "Study title: Local Retrieval Evaluation",
                }
            ],
            extractor_name="test",
        )
    )
    test_session.commit()

    materialize = client.post(
        f"/api/v1/documents/{document.id}/profiles/research_report_v1/materialize"
    )
    assert materialize.status_code == 200
    assert materialize.json()[0]["status"] == "VALID"
    assert materialize.json()[0]["values"]["study_title"] == "Local Retrieval Evaluation"

    typed_outputs = client.get(f"/api/v1/documents/{document.id}/typed-outputs")
    assert typed_outputs.status_code == 200
    assert typed_outputs.json()[0]["confidence"] == 0.93
