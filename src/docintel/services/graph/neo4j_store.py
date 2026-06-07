from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from docintel.config import Settings


class Neo4jUnavailableError(RuntimeError):
    """Raised when Neo4j projection cannot run locally."""


@dataclass(frozen=True)
class GraphNode:
    """Graph node projection payload."""

    node_id: str
    labels: list[str]
    properties: dict[str, object]


@dataclass(frozen=True)
class GraphEdge:
    """Graph edge projection payload."""

    source_id: str
    target_id: str
    relationship_type: str
    properties: dict[str, object]


@dataclass(frozen=True)
class GraphPayload:
    """Complete graph projection payload."""

    nodes: list[GraphNode]
    edges: list[GraphEdge]


class Neo4jGraphStore:
    """Neo4j serving-store adapter using idempotent MERGE operations."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def project(self, payload: GraphPayload) -> None:
        """Project nodes and edges into Neo4j."""

        try:
            from neo4j import GraphDatabase
        except ImportError as exc:
            raise Neo4jUnavailableError("Neo4j Python driver is not installed") from exc

        try:
            driver = GraphDatabase.driver(
                self.settings.neo4j_uri,
                auth=(self.settings.neo4j_user, self.settings.neo4j_password),
            )
            with driver:
                driver.verify_connectivity()
                with driver.session() as session:
                    self._ensure_constraints(session)
                    for node in payload.nodes:
                        session.execute_write(_merge_node, node)
                    for edge in payload.edges:
                        session.execute_write(_merge_edge, edge)
        except Exception as exc:
            raise Neo4jUnavailableError(f"Neo4j projection failed: {exc}") from exc

    def _ensure_constraints(self, session: Any) -> None:
        session.run(
            "CREATE CONSTRAINT graph_node_id IF NOT EXISTS "
            "FOR (n:GraphNode) REQUIRE n.node_id IS UNIQUE"
        )


def _merge_node(tx: Any, node: GraphNode) -> None:
    labels = ":".join(_safe_label(label) for label in ["GraphNode", *node.labels])
    tx.run(
        f"MERGE (n:{labels} {{node_id: $node_id}}) SET n += $properties",
        node_id=node.node_id,
        properties=node.properties,
    )


def _merge_edge(tx: Any, edge: GraphEdge) -> None:
    relationship_type = _safe_label(edge.relationship_type)
    tx.run(
        "MATCH (source:GraphNode {node_id: $source_id}) "
        "MATCH (target:GraphNode {node_id: $target_id}) "
        f"MERGE (source)-[r:{relationship_type}]->(target) "
        "SET r += $properties",
        source_id=edge.source_id,
        target_id=edge.target_id,
        properties=edge.properties,
    )


def _safe_label(value: str) -> str:
    cleaned = "".join(char if char.isalnum() or char == "_" else "_" for char in value.upper())
    return cleaned or "UNKNOWN"
