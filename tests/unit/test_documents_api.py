from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient

from docintel.domain.canonical_ir import CanonicalDocument, CanonicalPage, DocumentElement


def _sample_pdf_bytes() -> bytes:
    return (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Count 0 >> endobj\n"
        b"%%EOF\n"
    )


def test_upload_pdf_lists_and_marks_duplicate(client: TestClient) -> None:
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("sample.pdf", _sample_pdf_bytes(), "application/pdf")},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["duplicate"] is False
    document = payload["document"]
    assert document["file_name"] == "sample.pdf"
    assert document["file_type"] == "pdf"
    assert document["status"] == "PENDING"
    assert UUID(document["id"])
    assert Path(document["storage_uri"]).exists()

    duplicate = client.post(
        "/api/v1/documents/upload",
        files={"file": ("same-content.pdf", _sample_pdf_bytes(), "application/pdf")},
    )
    assert duplicate.status_code == 201
    assert duplicate.json()["duplicate"] is True
    assert duplicate.json()["document"]["id"] == document["id"]

    listed = client.get("/api/v1/documents")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_process_builds_canonical_artifacts(client: TestClient, monkeypatch) -> None:
    async def fake_parse(self, file_path: str, document_id: str) -> CanonicalDocument:
        _ = self, file_path
        return CanonicalDocument(
            document_id=UUID(document_id),
            file_name="sample.pdf",
            file_type="pdf",
            checksum_sha256="a" * 64,
            pages=[
                CanonicalPage(
                    page_number=1,
                    parser_route="docling",
                    text_quality_score=1.0,
                    elements=[
                        DocumentElement(
                            element_id="e000001",
                            element_type="title",
                            text="Sample",
                            markdown="# Sample",
                            page_number=1,
                            parser_name="docling",
                        ),
                        DocumentElement(
                            element_id="e000002",
                            element_type="paragraph",
                            text=(
                                "Contact support@example.com by March 12, 2026. "
                                "The team must pay $1,200.00 for SLA-2026-A."
                            ),
                            markdown=(
                                "Contact support@example.com by March 12, 2026. "
                                "The team must pay $1,200.00 for SLA-2026-A."
                            ),
                            page_number=1,
                            parser_name="docling",
                        ),
                        DocumentElement(
                            element_id="e000003",
                            element_type="table",
                            markdown="| A | B |\n|---|---|\n| 1 | 2 |",
                            table_data={"rows": [["A", "B"], ["1", "2"]]},
                            page_number=1,
                            parser_name="docling",
                        ),
                    ],
                )
            ],
            metadata={"parser_native_json": '{"ok": true}', "docling_markdown": "# Sample"},
        )

    monkeypatch.setattr("docintel.services.parsing.docling_parser.DoclingParser.parse", fake_parse)

    async def fake_embed_documents(self, texts: list[str]) -> list[list[float]]:
        _ = self
        return [[0.1, 0.2, 0.3] for _text in texts]

    monkeypatch.setattr(
        "docintel.services.embeddings.lmstudio.LMStudioEmbeddingProvider.embed_documents",
        fake_embed_documents,
    )

    async def fake_upsert_points(self, points) -> None:
        _ = self, points

    monkeypatch.setattr(
        "docintel.services.vector_store.qdrant.QdrantVectorStore.upsert_points",
        fake_upsert_points,
    )
    upload = client.post(
        "/api/v1/documents/upload",
        files={"file": ("sample.pdf", _sample_pdf_bytes(), "application/pdf")},
    )
    document_id = upload.json()["document"]["id"]

    process = client.post(f"/api/v1/documents/{document_id}/process")
    assert process.status_code == 200
    assert process.json()["status"] == "SUCCEEDED"
    assert process.json()["document"]["status"] == "SUCCEEDED"
    assert process.json()["processing_run_id"]

    status = client.get(f"/api/v1/documents/{document_id}/status")
    assert status.status_code == 200
    assert "canonical_ir" in status.json()["available_projections"]
    assert "chunks" in status.json()["available_projections"]
    assert "vector_store" in status.json()["available_projections"]
    assert len(status.json()["events"]) >= 3

    artifacts = client.get(f"/api/v1/documents/{document_id}/artifacts")
    assert artifacts.status_code == 200
    artifact_payload = artifacts.json()
    assert artifact_payload["status"] == "available"
    artifact_types = {artifact["artifact_type"] for artifact in artifact_payload["artifacts"]}
    assert {
        "canonical_json",
        "markdown",
        "parser_native_json",
        "table_markdown",
        "table_json",
    } <= artifact_types

    chunks = client.get(f"/api/v1/documents/{document_id}/chunks")
    assert chunks.status_code == 200
    assert chunks.json()["status"] == "available"
    assert len(chunks.json()["chunks"]) == 2

    extractions = client.get(f"/api/v1/documents/{document_id}/extractions")
    assert extractions.status_code == 200
    extraction_payload = extractions.json()
    assert extraction_payload["status"] == "available"
    assert len(extraction_payload["fields"]) >= 4
    assert len(extraction_payload["entities"]) >= 4
    assert len(extraction_payload["relationships"]) >= 4
    assert extraction_payload["obligations"]

    status_after_extraction = client.get(f"/api/v1/documents/{document_id}/status")
    assert "structured_extraction" in status_after_extraction.json()["available_projections"]
    assert "graph" in status_after_extraction.json()["available_projections"]

    graph = client.get(f"/api/v1/documents/{document_id}/graph")
    assert graph.status_code == 200
    graph_payload = graph.json()
    assert graph_payload["status"] in {"available", "partial"}
    assert len(graph_payload["nodes"]) >= 2
    assert len(graph_payload["edges"]) >= 1

    quality = client.get(f"/api/v1/documents/{document_id}/quality-scores")
    assert quality.status_code == 200
    quality_by_name = {item["metric_name"]: item for item in quality.json()}
    assert quality_by_name["text_quality"]["score"] == 1.0
    assert quality_by_name["overall"]["status"] == "PASSED"


def test_process_can_enqueue_celery_pipeline(
    client: TestClient, test_settings, monkeypatch
) -> None:
    test_settings.processing_mode = "celery"
    monkeypatch.setattr(
        "docintel.workers.tasks.enqueue_document_processing",
        lambda document_id, processing_run_id: "job-123",
    )
    upload = client.post(
        "/api/v1/documents/upload",
        files={"file": ("sample.pdf", _sample_pdf_bytes(), "application/pdf")},
    )
    document_id = upload.json()["document"]["id"]

    response = client.post(f"/api/v1/documents/{document_id}/process")

    assert response.status_code == 200
    assert response.json()["status"] == "PENDING"
    assert response.json()["document"]["status"] == "PENDING"
    assert response.json()["processing_job_id"] == "job-123"
    assert response.json()["processing_run_id"]


def test_rejects_invalid_file_type(client: TestClient) -> None:
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 400
