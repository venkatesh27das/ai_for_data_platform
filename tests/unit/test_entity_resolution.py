from docintel.db.models import Document, EntityRecord, ExtractionRun
from docintel.services.entity_resolution.exact_match import ExactMatchEntityResolver


def test_exact_match_entity_resolver_marks_canonical_and_resolved(test_session) -> None:
    document = Document(
        file_name="sample.pdf",
        file_type="pdf",
        checksum_sha256="a" * 64,
        storage_uri="data/uploads/sample.pdf",
        size_bytes=10,
        status="SUCCEEDED",
    )
    test_session.add(document)
    test_session.flush()
    run = ExtractionRun(
        document_id=document.id,
        status="SUCCEEDED",
        extractor_name="test",
    )
    test_session.add(run)
    test_session.flush()
    first = EntityRecord(
        document_id=document.id,
        extraction_run_id=run.id,
        entity_type="Organization",
        canonical_name="Acme Corp",
        normalized_key="acme corp",
        confidence=0.95,
        source_evidence_json=[],
        extractor_name="test",
    )
    duplicate = EntityRecord(
        document_id=document.id,
        extraction_run_id=run.id,
        entity_type="Organization",
        canonical_name=" acme corp ",
        normalized_key="acme corp",
        confidence=0.90,
        source_evidence_json=[],
        extractor_name="test",
    )
    test_session.add_all([first, duplicate])
    test_session.commit()

    result = ExactMatchEntityResolver(test_session).resolve_document(document)

    assert result.canonical_count == 1
    assert result.resolved_count == 1
    test_session.refresh(first)
    test_session.refresh(duplicate)
    assert first.resolution_status == "CANONICAL"
    assert first.canonical_entity_id == first.id
    assert duplicate.resolution_status == "RESOLVED"
    assert duplicate.canonical_entity_id == first.id
