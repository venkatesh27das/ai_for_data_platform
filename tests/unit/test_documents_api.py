from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient


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


def test_process_sets_honest_placeholder_status(client: TestClient) -> None:
    upload = client.post(
        "/api/v1/documents/upload",
        files={"file": ("sample.pdf", _sample_pdf_bytes(), "application/pdf")},
    )
    document_id = upload.json()["document"]["id"]

    process = client.post(f"/api/v1/documents/{document_id}/process")
    assert process.status_code == 200
    assert process.json()["status"] == "not_implemented"
    assert process.json()["document"]["status"] == "REQUIRES_REVIEW"

    status = client.get(f"/api/v1/documents/{document_id}/status")
    assert status.status_code == 200
    assert "vector_store" in status.json()["unavailable_projections"]

    extractions = client.get(f"/api/v1/documents/{document_id}/extractions")
    assert extractions.status_code == 200
    assert extractions.json()["required_phase"] == "Phase 4"


def test_rejects_invalid_file_type(client: TestClient) -> None:
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 400
