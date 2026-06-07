from docintel.db.models import Document, EntityRecord, ExtractionRun
from docintel.db.repositories.documents import DocumentRepository


def test_quality_scores_and_resolution_candidates_persist(test_session) -> None:
    document = Document(
        file_name="sample.pdf",
        file_type="pdf",
        checksum_sha256="c" * 64,
        storage_uri="data/uploads/sample.pdf",
        size_bytes=10,
        status="RUNNING",
    )
    test_session.add(document)
    test_session.commit()
    repository = DocumentRepository(test_session)
    processing_run = repository.create_processing_run(document)
    scores = repository.replace_quality_scores(
        document.id,
        processing_run.id,
        [("overall", 0.8, 0.75, "PASSED", {"source": "test"})],
    )
    assert scores[0].score == 0.8
    assert repository.list_quality_scores(document.id)[0].status == "PASSED"

    extraction_run = ExtractionRun(
        document_id=document.id,
        status="SUCCEEDED",
        extractor_name="test",
    )
    test_session.add(extraction_run)
    test_session.flush()
    source = EntityRecord(
        document_id=document.id,
        extraction_run_id=extraction_run.id,
        entity_type="Organization",
        canonical_name="Acme",
        normalized_key="acme",
        confidence=0.9,
        source_evidence_json=[],
        extractor_name="test",
    )
    candidate = EntityRecord(
        document_id=document.id,
        extraction_run_id=extraction_run.id,
        entity_type="Organization",
        canonical_name="Acme Inc",
        normalized_key="acme inc",
        confidence=0.85,
        source_evidence_json=[],
        extractor_name="test",
    )
    test_session.add_all([source, candidate])
    test_session.commit()

    records = repository.replace_resolution_candidates(
        source.id,
        [(candidate.id, "fuzzy", 0.82, "PROPOSED", {"reason": "name similarity"})],
    )

    assert records[0].candidate_entity_id == candidate.id
    assert records[0].similarity_score == 0.82
