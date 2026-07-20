from typing import Any

from sqlalchemy.orm import Session

from app.db.models import Artifact, Project
from app.repositories.artifacts import ArtifactRepository
from app.repositories.projects import ProjectRepository


class WorkflowPersistenceService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.projects = ProjectRepository(db)
        self.artifacts = ArtifactRepository(db)

    def persist(
        self,
        project: Project,
        state: dict[str, Any],
        *,
        run_id: str | None = None,
        commit: bool = True,
    ) -> list[Artifact]:
        stage = str(state.get("workflow_stage", "awaiting_input"))
        source_analysis = dictionary(state.get("source_analysis"))
        logical_model = dictionary(state.get("logical_model"))
        mapping_dq = dictionary(state.get("mapping_dq"))
        validation = dictionary(state.get("validation_report"))

        mappings = list_of_dicts(mapping_dq.get("mappings"))
        dq_rules = list_of_dicts(mapping_dq.get("dq_rules"))
        findings = list_of_dicts(validation.get("findings"))
        review_count = sum(1 for item in findings if item.get("requires_human") is True) + sum(
            1 for item in mappings if item.get("status") == "Needs review"
        )
        project_status = project.status
        if stage in {"awaiting_clarification", "awaiting_sources"}:
            project_status = "in_progress"
        elif logical_model:
            project_status = "needs_review" if review_count or findings else "completed"

        self.projects.update(
            project,
            commit=False,
            workflow_state=state,
            state_version=project.state_version + 1,
            workflow_stage=stage,
            status=project_status,
            source_count=(
                len(list_of_dicts(source_analysis.get("sources")))
                if source_analysis
                else project.source_count
            ),
            entity_count=len(list_of_dicts(logical_model.get("entities"))),
            mapping_count=len(mappings),
            dq_rule_count=len(dq_rules),
            review_count=review_count,
        )
        if not logical_model:
            if commit:
                self.db.commit()
            return []

        target = state.get("regeneration_target")
        affected = affected_artifact_types(target)
        created: list[Artifact] = []
        if "source_preview" in affected:
            created.append(
                self.create_artifact(
                    project.id,
                    "source_preview",
                    "Source Analysis",
                    {
                        "tables": list_of_dicts(source_analysis.get("sources")),
                        "generation": generation_metadata(source_analysis),
                    },
                    run_id=run_id,
                )
            )
        if "logical_model" in affected:
            created.append(
                self.create_artifact(
                    project.id,
                    "logical_model",
                    str(logical_model.get("model_name") or "Logical Model"),
                    {
                        **logical_model,
                        "mapping_count": len(mappings),
                        "dq_rule_count": len(dq_rules),
                        "review_count": review_count,
                    },
                    run_id=run_id,
                )
            )
        if "mappings" in affected:
            created.append(
                self.create_artifact(
                    project.id,
                    "mappings",
                    "Source-to-Target Mappings",
                    {"items": mappings, "generation": generation_metadata(mapping_dq)},
                    run_id=run_id,
                )
            )
        if "dq_rules" in affected:
            created.append(
                self.create_artifact(
                    project.id,
                    "dq_rules",
                    "Data Quality Rules",
                    {"items": dq_rules, "generation": generation_metadata(mapping_dq)},
                    run_id=run_id,
                )
            )
        if "validation" in affected:
            created.append(
                self.create_artifact(
                    project.id,
                    "validation",
                    "Model Validation Findings",
                    {
                        "findings": findings,
                        "summary": validation.get("summary", ""),
                        "generation": generation_metadata(validation),
                    },
                    status="needs_review" if findings else "ready",
                    run_id=run_id,
                )
            )
        if commit:
            self.db.commit()
        return created

    def create_artifact(
        self,
        project_id: str,
        artifact_type: str,
        name: str,
        payload: dict[str, Any],
        *,
        status: str = "ready",
        run_id: str | None = None,
    ) -> Artifact:
        return self.artifacts.create(
            project_id=project_id,
            artifact_type=artifact_type,
            name=name,
            version=self.artifacts.next_version(project_id, artifact_type),
            status=status,
            payload=payload,
            generated_by_run_id=run_id,
            commit=False,
        )


def dictionary(value: object) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def list_of_dicts(value: object) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def affected_artifact_types(target: object) -> set[str]:
    if target == "validation":
        return {"validation"}
    if target in {"mappings", "dq_rules"}:
        return {"mappings", "dq_rules", "validation"}
    if target == "logical_model":
        return {"logical_model", "mappings", "dq_rules", "validation"}
    return {"source_preview", "logical_model", "mappings", "dq_rules", "validation"}


def generation_metadata(result: dict[str, Any]) -> dict[str, Any]:
    return {
        "agent_id": result.get("agent_id"),
        "agent_version": result.get("agent_version"),
        "execution_mode": result.get("execution_mode", "llm"),
        "fallback_reason": result.get("fallback_reason"),
        "confidence": result.get("confidence"),
    }
