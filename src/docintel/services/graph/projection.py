from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from docintel.config import Settings
from docintel.db.models import Document, EntityRecord, ProcessingRun
from docintel.db.repositories.documents import DocumentRepository
from docintel.services.entity_resolution.exact_match import (
    ExactMatchEntityResolver,
    normalize_entity_key,
)
from docintel.services.graph.neo4j_store import (
    GraphEdge,
    GraphNode,
    GraphPayload,
    Neo4jGraphStore,
    Neo4jUnavailableError,
)


@dataclass(frozen=True)
class GraphProjectionResult:
    """Outcome of projecting a document graph."""

    status: str
    message: str
    nodes: list[dict[str, object]]
    edges: list[dict[str, object]]
    projection_run_id: str | None = None


class DocumentGraphProjectionService:
    """Resolve entities and project document graph assets."""

    def __init__(self, session: Session, settings: Settings) -> None:
        self.session = session
        self.settings = settings
        self.repository = DocumentRepository(session)
        self.resolver = ExactMatchEntityResolver(session)
        self.graph_store = Neo4jGraphStore(settings)

    def rebuild_document_graph(
        self, document: Document, processing_run: ProcessingRun | None = None
    ) -> GraphProjectionResult:
        """Resolve entities and rebuild the graph projection for a document."""

        resolution = self.resolver.resolve_document(document)
        payload = self.build_local_graph(document.id)
        run = self.repository.create_graph_projection_run(
            document.id, processing_run.id if processing_run else None
        )
        try:
            self.graph_store.project(payload)
        except Neo4jUnavailableError as exc:
            self.repository.finish_graph_projection_run(
                run,
                "PARTIAL",
                len(payload.nodes),
                len(payload.edges),
                str(exc),
            )
            return GraphProjectionResult(
                status="partial",
                message=(
                    "Local graph is available; Neo4j projection is retryable. "
                    f"Resolved {resolution.canonical_count} canonical entities and "
                    f"{resolution.resolved_count} duplicate mentions. {exc}"
                ),
                nodes=[_node_to_dict(node) for node in payload.nodes],
                edges=[_edge_to_dict(edge) for edge in payload.edges],
                projection_run_id=str(run.id),
            )

        self.repository.finish_graph_projection_run(
            run, "SUCCEEDED", len(payload.nodes), len(payload.edges)
        )
        return GraphProjectionResult(
            status="available",
            message=(
                f"Projected {len(payload.nodes)} nodes and {len(payload.edges)} edges to Neo4j."
            ),
            nodes=[_node_to_dict(node) for node in payload.nodes],
            edges=[_edge_to_dict(edge) for edge in payload.edges],
            projection_run_id=str(run.id),
        )

    def get_document_graph(self, document: Document) -> GraphProjectionResult:
        """Return the current local graph payload for a document."""

        payload = self.build_local_graph(document.id)
        run = self.repository.latest_graph_projection_run(document.id)
        if not payload.nodes:
            return GraphProjectionResult(
                status="unavailable",
                message="No graph records are available yet. Run extraction and rebuild graph.",
                nodes=[],
                edges=[],
                projection_run_id=str(run.id) if run else None,
            )
        status = "available" if run and run.status == "SUCCEEDED" else "partial"
        return GraphProjectionResult(
            status=status,
            message=f"{len(payload.nodes)} node(s) and {len(payload.edges)} edge(s) available.",
            nodes=[_node_to_dict(node) for node in payload.nodes],
            edges=[_edge_to_dict(edge) for edge in payload.edges],
            projection_run_id=str(run.id) if run else None,
        )

    def search(self, query: str, limit: int = 10) -> GraphProjectionResult:
        """Search local resolved graph records by entity name."""

        normalized_query = normalize_entity_key(query)
        nodes: list[dict[str, object]] = []
        for document in self.repository.list():
            payload = self.build_local_graph(document.id)
            for node in payload.nodes:
                name = str(node.properties.get("name", ""))
                if normalized_query and normalized_query not in normalize_entity_key(name):
                    continue
                nodes.append(_node_to_dict(node))
                if len(nodes) >= limit:
                    break
            if len(nodes) >= limit:
                break
        return GraphProjectionResult(
            status="available",
            message=f"{len(nodes)} graph node(s) matched.",
            nodes=nodes,
            edges=[],
        )

    def build_local_graph(self, document_id: UUID) -> GraphPayload:
        """Build graph nodes and edges from PostgreSQL/SQLite source records."""

        document = self.repository.get(document_id)
        if document is None:
            return GraphPayload(nodes=[], edges=[])

        entity_records = list(self.repository.list_resolved_entities(document_id))
        canonical_entities = _canonical_entities(entity_records)
        entity_lookup = _entity_lookup(entity_records)
        nodes = [
            GraphNode(
                node_id=f"document:{document.id}",
                labels=["Document"],
                properties={
                    "node_id": f"document:{document.id}",
                    "document_id": str(document.id),
                    "name": document.file_name,
                    "file_type": document.file_type,
                },
            )
        ]
        for entity in canonical_entities:
            nodes.append(
                GraphNode(
                    node_id=f"entity:{entity.id}",
                    labels=["Entity", entity.entity_type],
                    properties={
                        "node_id": f"entity:{entity.id}",
                        "entity_id": str(entity.id),
                        "document_id": str(entity.document_id),
                        "name": entity.canonical_name,
                        "entity_type": entity.entity_type,
                        "normalized_key": entity.normalized_key,
                        "confidence": entity.confidence,
                        "review_status": entity.review_status,
                    },
                )
            )

        edges: list[GraphEdge] = []
        for entity in canonical_entities:
            edges.append(
                GraphEdge(
                    source_id=f"document:{document.id}",
                    target_id=f"entity:{entity.id}",
                    relationship_type="MENTIONS",
                    properties={
                        "document_id": str(document.id),
                        "confidence": entity.confidence,
                        "review_status": entity.review_status,
                        "source": "entity_resolution",
                    },
                )
            )

        for relationship in self.repository.list_relationships(document_id):
            if relationship.review_status == "REJECTED":
                continue
            if relationship.confidence < self.settings.min_relationship_confidence:
                continue
            source = entity_lookup.get(normalize_entity_key(relationship.source_entity))
            target = entity_lookup.get(normalize_entity_key(relationship.target_entity))
            if source is None or target is None:
                continue
            edges.append(
                GraphEdge(
                    source_id=f"entity:{source.id}",
                    target_id=f"entity:{target.id}",
                    relationship_type=relationship.relationship_type,
                    properties={
                        "document_id": str(document_id),
                        "relationship_id": str(relationship.id),
                        "confidence": relationship.confidence,
                        "review_status": relationship.review_status,
                        "extraction_run_id": str(relationship.extraction_run_id),
                        "evidence": relationship.source_evidence_json,
                    },
                )
            )

        return GraphPayload(nodes=nodes, edges=edges)


def _canonical_entities(entities: list[EntityRecord]) -> list[EntityRecord]:
    by_id: dict[UUID, EntityRecord] = {}
    for entity in entities:
        canonical_id = entity.canonical_entity_id or entity.id
        if canonical_id == entity.id:
            by_id[entity.id] = entity
    return list(by_id.values())


def _entity_lookup(entities: list[EntityRecord]) -> dict[str, EntityRecord]:
    canonical_by_id = {entity.id: entity for entity in _canonical_entities(entities)}
    lookup: dict[str, EntityRecord] = {}
    for entity in entities:
        canonical = canonical_by_id.get(entity.canonical_entity_id or entity.id)
        if canonical:
            lookup[normalize_entity_key(entity.canonical_name)] = canonical
    return lookup


def _node_to_dict(node: GraphNode) -> dict[str, object]:
    return {"id": node.node_id, "labels": node.labels, "properties": node.properties}


def _edge_to_dict(edge: GraphEdge) -> dict[str, object]:
    return {
        "source": edge.source_id,
        "target": edge.target_id,
        "type": edge.relationship_type,
        "properties": edge.properties,
    }
