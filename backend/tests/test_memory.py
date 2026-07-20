from typing import Any

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import MemoryEntry, Project, WorkflowRun
from app.repositories.memory import MemoryRepository
from app.services.memory import MemoryService


class KeywordEmbeddings:
    name = "test"
    model = "keywords"

    def __init__(self) -> None:
        self.calls: list[list[str]] = []

    async def health_check(self) -> dict[str, Any]:
        return {"ok": True}

    async def embed(self, texts: list[str]) -> list[list[float]]:
        self.calls.append(texts)
        return [
            [
                float("order" in text.lower() or "sales" in text.lower()),
                float("retention" in text.lower()),
            ]
            for text in texts
        ]


class FailingEmbeddings(KeywordEmbeddings):
    async def embed(self, texts: list[str]) -> list[list[float]]:
        raise RuntimeError("embedding service unavailable")


def workflow_state() -> dict[str, Any]:
    return {
        "modelling_brief": {
            "domain": "Sales",
            "objective": "Analyse sales orders",
            "business_process": "Order fulfilment",
            "candidate_grain": "one row per order line",
            "kpis": ["net sales", "quantity"],
            "source_systems": ["SAP"],
            "source_objects": ["VBAK", "VBAP"],
            "requested_outputs": ["logical model", "mappings"],
            "assumptions": ["Cancelled orders are excluded"],
        },
        "logical_model": {
            "model_name": "Sales analytics",
            "fact_grain": "one row per order line",
            "entities": [
                {"name": "FactSalesOrderLine", "kind": "fact"},
                {"name": "DimCustomer", "kind": "dimension"},
            ],
        },
        "validation_report": {"summary": "Structurally valid"},
    }


@pytest.mark.asyncio
async def test_completed_run_updates_and_retrieves_project_memory() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    embeddings = KeywordEmbeddings()

    with Session(engine) as db:
        project = Project(name="Sales", objective="Model sales")
        run = WorkflowRun(
            project=project,
            idempotency_key="run-1",
            request_content="Build an order-line sales model",
        )
        db.add_all([project, run])
        db.commit()
        service = MemoryService(MemoryRepository(db), embeddings, retrieval_limit=3)

        memory = await service.update_after_run(
            project_id=project.id,
            project_name=project.name,
            run_id=run.id,
            user_message=run.request_content,
            assistant_response="The sales model is ready.",
            state=workflow_state(),
        )

        assert memory.facts["fact_grain"] == "one row per order line"
        assert "Confirmed grain: one row per order line" in memory.summary
        assert memory.terminology["FactSalesOrderLine"] == "fact"
        assert len(MemoryRepository(db).list_entries(project_id=project.id)) == 3
        assert embeddings.calls

        context = await service.retrieve_context(project.id, "What is the order grain?")
        assert context["project_summary"] == memory.summary
        assert context["facts"]["fact_grain"] == "one row per order line"
        assert context["relevant_memories"]
        assert context["cross_project_enabled"] is False


@pytest.mark.asyncio
async def test_cross_project_memory_is_opt_in_and_deletable() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        project = Project(name="Sales", objective="Model sales")
        run = WorkflowRun(
            project=project,
            idempotency_key="run-1",
            request_content="Build an order-line sales model",
        )
        db.add_all([project, run])
        db.commit()
        service = MemoryService(MemoryRepository(db), KeywordEmbeddings())
        service.update_settings(True)

        await service.update_after_run(
            project_id=project.id,
            project_name=project.name,
            run_id=run.id,
            user_message=run.request_content,
            assistant_response="Ready",
            state=workflow_state(),
        )
        preference = await service.add_user_entry(
            kind="preference", content="Prefer surrogate integer keys"
        )

        assert len(service.user_entries()) == 2
        assert service.delete_user_entries(preference.id) == 1
        assert service.delete_user_entries() == 1
        assert service.user_entries() == []


@pytest.mark.asyncio
async def test_embedding_failure_falls_back_without_breaking_memory() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        project = Project(name="Retention", objective="Model customer retention")
        db.add(project)
        db.commit()
        repository = MemoryRepository(db)
        repository.add_entry(
            scope="project",
            kind="request",
            content="Create a customer retention model",
            embedding=[],
            project_id=project.id,
        )
        db.commit()
        service = MemoryService(repository, FailingEmbeddings())

        context = await service.retrieve_context(project.id, "customer retention")

        assert context["relevant_memories"][0]["content"] == (
            "Create a customer retention model"
        )
        entry = await service.add_user_entry(
            kind="preference", content="Prefer dimensional models"
        )
        assert isinstance(entry, MemoryEntry)
        assert entry.embedding == []
