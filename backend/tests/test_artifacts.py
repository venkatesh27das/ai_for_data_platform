from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.repositories.artifacts import ArtifactRepository
from app.repositories.projects import ProjectRepository
from app.schemas.artifacts import ArtifactCreate, ArtifactLayout, ArtifactReview, ArtifactRevision
from app.services.artifacts import ArtifactService


def test_artifact_is_persisted_with_structured_payload() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        project = ProjectRepository(db).create(name="Sales model", objective="Analyse orders")
        service = ArtifactService(ArtifactRepository(db))
        artifact = service.create(
            project.id,
            ArtifactCreate(
                artifact_type="logical_model",
                name="Sales logical model",
                payload={
                    "entities": [
                        {
                            "id": "fact_sales",
                            "name": "FactSales",
                            "kind": "fact",
                            "attributes": [],
                        }
                    ],
                    "relationships": [],
                },
            ),
        )

        assert artifact.project_id == project.id
        assert artifact.payload["entities"][0]["name"] == "FactSales"  # type: ignore[index]
        assert service.list(project.id) == [artifact]

        reviewed = service.review(
            project.id,
            artifact.id,
            ArtifactReview(decision="approved", note="Reviewed by modeller"),
        )
        assert reviewed.review_status == "approved"

        laid_out = service.save_layout(
            project.id,
            artifact.id,
            ArtifactLayout(positions={"fact_sales": {"x": 120, "y": 80}}),
        )
        assert laid_out.payload["layout"]["positions"]["fact_sales"]["x"] == 120  # type: ignore[index]

        revision = service.revise(
            project.id,
            artifact.id,
            ArtifactRevision(payload={"entities": [], "relationships": []}),
        )
        assert revision.version == 2
        assert revision.review_status == "pending"
