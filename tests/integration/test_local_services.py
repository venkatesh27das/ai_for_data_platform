from __future__ import annotations

import asyncio
import os
import socket
from uuid import uuid4

import httpx
import pytest
from redis import Redis
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import SQLAlchemyError

from docintel.config import Settings
from docintel.services.graph.neo4j_store import (
    GraphEdge,
    GraphNode,
    GraphPayload,
    Neo4jGraphStore,
    Neo4jUnavailableError,
)
from docintel.services.vector_store.qdrant import QdrantVectorStore, VectorPoint

pytestmark = pytest.mark.integration


def test_postgres_has_required_source_of_truth_tables() -> None:
    url = os.getenv(
        "INTEGRATION_DATABASE_URL",
        "postgresql+psycopg://docintel:docintel@localhost:5432/document_intelligence",
    )
    engine = create_engine(url, connect_args={"connect_timeout": 1})
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        tables = set(inspect(engine).get_table_names())
    except SQLAlchemyError as exc:
        pytest.skip(f"PostgreSQL is unavailable: {exc}")
    finally:
        engine.dispose()

    assert {
        "documents",
        "processing_runs",
        "quality_scores",
        "entity_resolution_candidates",
        "extraction_profiles",
    } <= tables


def test_redis_broker_is_reachable() -> None:
    url = os.getenv("INTEGRATION_REDIS_URL", "redis://localhost:6379/0")
    client = Redis.from_url(
        url,
        socket_connect_timeout=1,
        socket_timeout=1,
        decode_responses=True,
    )
    try:
        response = client.ping()
    except Exception as exc:
        pytest.skip(f"Redis is unavailable: {exc}")
    finally:
        client.close()

    assert response is True


def test_qdrant_upsert_and_search_round_trip() -> None:
    base_url = os.getenv("INTEGRATION_QDRANT_URL", "http://localhost:6333")
    try:
        httpx.get(f"{base_url}/healthz", timeout=1).raise_for_status()
    except httpx.HTTPError as exc:
        pytest.skip(f"Qdrant is unavailable: {exc}")

    collection = f"docintel_integration_{uuid4().hex}"
    settings = Settings(
        qdrant_url=base_url,
        qdrant_collection_document_chunks=collection,
    )
    store = QdrantVectorStore(settings)
    point_id = str(uuid4())

    async def round_trip() -> None:
        await store.upsert_points(
            [
                VectorPoint(
                    point_id=point_id,
                    vector=[1.0, 0.0, 0.0],
                    payload={"text": "integration test"},
                )
            ]
        )
        hits = await store.search([1.0, 0.0, 0.0], 1)
        assert hits[0].point_id == point_id
        assert hits[0].payload["text"] == "integration test"

    try:
        asyncio.run(round_trip())
    finally:
        httpx.delete(f"{base_url}/collections/{collection}", timeout=5)


def test_neo4j_projection_round_trip() -> None:
    uri = os.getenv("INTEGRATION_NEO4J_URI", "bolt://localhost:7687")
    host, port = _bolt_host_port(uri)
    try:
        with socket.create_connection((host, port), timeout=1):
            pass
    except OSError as exc:
        pytest.skip(f"Neo4j is unavailable: {exc}")

    settings = Settings(
        neo4j_uri=uri,
        neo4j_user=os.getenv("INTEGRATION_NEO4J_USER", "neo4j"),
        neo4j_password=os.getenv("INTEGRATION_NEO4J_PASSWORD", "change-me"),
    )
    suffix = uuid4().hex
    payload = GraphPayload(
        nodes=[
            GraphNode(
                node_id=f"integration-source-{suffix}",
                labels=["Document"],
                properties={"name": "integration source"},
            ),
            GraphNode(
                node_id=f"integration-target-{suffix}",
                labels=["Entity"],
                properties={"name": "integration target"},
            ),
        ],
        edges=[
            GraphEdge(
                source_id=f"integration-source-{suffix}",
                target_id=f"integration-target-{suffix}",
                relationship_type="MENTIONS",
                properties={"source": "integration-test"},
            )
        ],
    )
    try:
        Neo4jGraphStore(settings).project(payload)
    except Neo4jUnavailableError as exc:
        pytest.fail(str(exc))


def _bolt_host_port(uri: str) -> tuple[str, int]:
    without_scheme = uri.split("://", maxsplit=1)[-1]
    host, _, port = without_scheme.partition(":")
    return host, int(port or "7687")
