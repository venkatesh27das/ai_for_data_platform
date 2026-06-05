from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from uuid import NAMESPACE_URL, UUID, uuid5

from sqlalchemy.orm import Session

from docintel.config import Settings
from docintel.db.models import Chunk, Document, ProcessingRun
from docintel.db.repositories.documents import DocumentRepository
from docintel.domain.canonical_ir import CanonicalDocument
from docintel.services.chunking.layout import LayoutAwareChunker
from docintel.services.embeddings.base import EmbeddingProvider
from docintel.services.embeddings.lmstudio import LMStudioEmbeddingProvider
from docintel.services.vector_store.qdrant import QdrantVectorStore, VectorPoint, VectorSearchHit


@dataclass(frozen=True)
class VectorProjectionResult:
    """Outcome of chunking and vector indexing."""

    status: str
    chunk_count: int
    indexed_count: int
    message: str


@dataclass(frozen=True)
class VectorSearchResult:
    """Application-level vector search result."""

    status: str
    message: str
    results: list[dict[str, object]]


class DocumentVectorProjectionService:
    """Build layout-aware chunks and project them into Qdrant."""

    def __init__(
        self,
        session: Session,
        settings: Settings,
        embedding_provider: EmbeddingProvider | None = None,
        vector_store: QdrantVectorStore | None = None,
    ) -> None:
        self.session = session
        self.settings = settings
        self.repository = DocumentRepository(session)
        self.embedding_provider = embedding_provider or LMStudioEmbeddingProvider(settings)
        self.vector_store = vector_store or QdrantVectorStore(settings)

    async def project_from_canonical(
        self,
        document: Document,
        processing_run: ProcessingRun,
        canonical: CanonicalDocument,
    ) -> VectorProjectionResult:
        """Build chunks from canonical IR and attempt vector indexing."""

        chunker = LayoutAwareChunker(
            chunk_size_tokens=self.settings.default_chunk_size_tokens,
            chunk_overlap_tokens=self.settings.default_chunk_overlap_tokens,
        )
        chunks = chunker.build_chunks(canonical)
        chunk_records = list(self.repository.replace_chunks(document.id, processing_run.id, chunks))
        self.repository.add_event(
            document.id,
            processing_run.id,
            "build_chunks",
            "SUCCEEDED",
            f"Built {len(chunk_records)} layout-aware chunks.",
            {"chunk_count": len(chunk_records)},
        )
        return await self._index_chunks(document, processing_run, chunk_records)

    async def rebuild_document_vectors(self, document: Document) -> VectorProjectionResult:
        """Rebuild chunks/vectors from the latest canonical artifact for a document."""

        latest_run = self.repository.latest_processing_run(document.id)
        if latest_run is None:
            return VectorProjectionResult(
                status="unavailable",
                chunk_count=0,
                indexed_count=0,
                message="Document has not been processed yet.",
            )
        canonical = self._load_latest_canonical(document.id)
        if canonical is None:
            return VectorProjectionResult(
                status="unavailable",
                chunk_count=0,
                indexed_count=0,
                message="No canonical JSON artifact is available. Process the document first.",
            )
        return await self.project_from_canonical(document, latest_run, canonical)

    async def search(self, query: str, limit: int) -> VectorSearchResult:
        """Embed a query and search Qdrant."""

        try:
            vector = await self.embedding_provider.embed_query(query)
            hits = await self.vector_store.search(vector, limit)
        except Exception as exc:
            return VectorSearchResult(
                status="unavailable",
                message=f"Vector search is unavailable: {exc}",
                results=[],
            )
        return VectorSearchResult(
            status="available",
            message=f"Returned {len(hits)} vector search result(s).",
            results=[self._hit_payload(hit) for hit in hits],
        )

    async def _index_chunks(
        self,
        document: Document,
        processing_run: ProcessingRun,
        chunks: list[Chunk],
    ) -> VectorProjectionResult:
        projection_run = self.repository.create_chunk_projection_run(document.id, processing_run.id)
        if not chunks:
            self.repository.finish_chunk_projection_run(projection_run, "SUCCEEDED", 0, 0)
            return VectorProjectionResult("available", 0, 0, "No chunks were generated.")
        try:
            embeddings = await self.embedding_provider.embed_documents(
                [chunk.text for chunk in chunks]
            )
            points: list[VectorPoint] = []
            record_inputs: list[tuple[Chunk, str, dict[str, object]]] = []
            for chunk, embedding in zip(chunks, embeddings, strict=True):
                point_id = str(uuid5(NAMESPACE_URL, f"{document.id}:{chunk.chunk_id}"))
                payload = self._payload_for_chunk(document, chunk)
                points.append(VectorPoint(point_id=point_id, vector=embedding, payload=payload))
                record_inputs.append((chunk, point_id, payload))
            await self.vector_store.upsert_points(points)
            self.repository.persist_vector_records(
                document_id=document.id,
                projection_run_id=projection_run.id,
                collection_name=self.settings.qdrant_collection_document_chunks,
                embedding_model=self.settings.lm_studio_embedding_model,
                records=record_inputs,
            )
            self.repository.finish_chunk_projection_run(
                projection_run, "SUCCEEDED", len(chunks), len(points)
            )
            self.repository.add_event(
                document.id,
                processing_run.id,
                "upsert_qdrant_vectors",
                "SUCCEEDED",
                f"Indexed {len(points)} chunk vectors in Qdrant.",
                {"collection": self.settings.qdrant_collection_document_chunks},
            )
            return VectorProjectionResult(
                "available",
                len(chunks),
                len(points),
                f"Indexed {len(points)} chunk vectors.",
            )
        except Exception as exc:
            message = f"Vector projection unavailable: {exc}"
            self.repository.finish_chunk_projection_run(
                projection_run, "RETRYABLE", len(chunks), 0, message
            )
            self.repository.add_event(
                document.id,
                processing_run.id,
                "upsert_qdrant_vectors",
                "RETRYABLE",
                message,
                {"chunk_count": len(chunks)},
            )
            return VectorProjectionResult("unavailable", len(chunks), 0, message)

    def _load_latest_canonical(self, document_id: UUID) -> CanonicalDocument | None:
        artifacts = self.repository.list_artifacts(document_id)
        canonical_artifact = next(
            (artifact for artifact in artifacts if artifact.artifact_type == "canonical_json"), None
        )
        if canonical_artifact is None:
            return None
        path = Path(canonical_artifact.uri)
        if not path.exists():
            return None
        return CanonicalDocument.model_validate(json.loads(path.read_text(encoding="utf-8")))

    def _payload_for_chunk(self, document: Document, chunk: Chunk) -> dict[str, object]:
        return {
            "chunk_id": chunk.chunk_id,
            "document_id": str(document.id),
            "file_name": document.file_name,
            "file_type": document.file_type,
            "document_class": chunk.metadata_json.get("document_class"),
            "chunk_type": chunk.chunk_type,
            "section_path": chunk.section_path_json,
            "page_numbers": chunk.page_numbers_json,
            "quality_score": chunk.quality_score,
            "processing_version": "phase-3",
            "created_at": chunk.created_at.isoformat(),
            "source_element_ids": chunk.source_element_ids_json,
            "text": chunk.text,
        }

    def _hit_payload(self, hit: VectorSearchHit) -> dict[str, object]:
        return {"point_id": hit.point_id, "score": hit.score, **hit.payload}
