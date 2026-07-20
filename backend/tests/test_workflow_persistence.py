from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.repositories.projects import ProjectRepository
from app.services.workflow_persistence import WorkflowPersistenceService


def test_persists_workflow_state_and_versioned_artifacts() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        project = ProjectRepository(db).create(name="Sales", objective="Analyse sales")
        state = {
            "workflow_stage": "ready_for_review",
            "source_analysis": {
                "sources": [
                    {
                        "table_name": "VBAP",
                        "role": "Transaction",
                        "column_count": 2,
                        "description": "Items",
                    }
                ]
            },
            "logical_model": {
                "model_name": "Sales Model",
                "entities": [{"id": "fact", "name": "FactSales", "kind": "fact"}],
                "relationships": [],
            },
            "mapping_dq": {
                "mappings": [{"source": "VBAP.VBELN", "status": "Approved"}],
                "dq_rules": [{"target": "FactSales.Key", "status": "Ready"}],
            },
            "validation_report": {"findings": [], "summary": "Passed"},
        }
        persistence = WorkflowPersistenceService(db)
        first = persistence.persist(project, state)
        second = persistence.persist(project, state)

        assert len(first) == 5
        assert len(second) == 5
        assert project.workflow_state["logical_model"]["model_name"] == "Sales Model"
        assert project.entity_count == 1
        assert project.mapping_count == 1
        assert sorted(artifact.version for artifact in second) == [2, 2, 2, 2, 2]
