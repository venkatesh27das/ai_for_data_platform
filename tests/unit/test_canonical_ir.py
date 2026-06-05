from uuid import uuid4

from docintel.domain.canonical_ir import CanonicalDocument, CanonicalPage, DocumentElement


def test_canonical_document_serializes_and_renders_markdown() -> None:
    document = CanonicalDocument(
        document_id=uuid4(),
        file_name="sample.pdf",
        file_type="pdf",
        checksum_sha256="a" * 64,
        pages=[
            CanonicalPage(
                page_number=1,
                parser_route="docling",
                elements=[
                    DocumentElement(
                        element_id="e1",
                        element_type="heading",
                        text="Terms",
                        markdown="## Terms",
                        parser_name="docling",
                    )
                ],
            )
        ],
    )

    payload = document.model_dump(mode="json")

    assert payload["schema_version"] == "1.0.0"
    assert "## Terms" in document.to_markdown()
