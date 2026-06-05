from uuid import uuid4

from docintel.domain.canonical_ir import CanonicalDocument, CanonicalPage, DocumentElement
from docintel.services.chunking.layout import LayoutAwareChunker


def test_layout_chunker_keeps_tables_separate_and_preserves_evidence() -> None:
    document = CanonicalDocument(
        document_id=uuid4(),
        file_name="sample.pdf",
        file_type="pdf",
        checksum_sha256="a" * 64,
        pages=[
            CanonicalPage(
                page_number=1,
                parser_route="docling",
                text_quality_score=0.9,
                elements=[
                    DocumentElement(
                        element_id="e1",
                        element_type="heading",
                        text="Commercial Terms",
                        markdown="## Commercial Terms",
                        page_number=1,
                        parser_name="docling",
                    ),
                    DocumentElement(
                        element_id="e2",
                        element_type="paragraph",
                        text="Payment is due within thirty days.",
                        page_number=1,
                        parser_name="docling",
                    ),
                    DocumentElement(
                        element_id="e3",
                        element_type="table",
                        markdown="| Item | Amount |\n|---|---|\n| Support | $100 |",
                        table_data={"rows": [["Item", "Amount"], ["Support", "$100"]]},
                        page_number=1,
                        parser_name="docling",
                    ),
                ],
            )
        ],
    )

    chunks = LayoutAwareChunker(chunk_size_tokens=40, chunk_overlap_tokens=5).build_chunks(document)

    assert [chunk.chunk_type for chunk in chunks] == ["text", "table"]
    assert chunks[0].section_path == ["Commercial Terms"]
    assert chunks[0].source_element_ids == ["e1", "e2"]
    assert chunks[1].source_element_ids == ["e3"]
    assert chunks[1].page_numbers == [1]
