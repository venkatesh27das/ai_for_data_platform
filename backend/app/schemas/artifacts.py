from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer

ArtifactType = Literal[
    "logical_model", "mappings", "dq_rules", "source_preview", "validation", "model_diff"
]


class ArtifactCreate(BaseModel):
    artifact_type: ArtifactType
    name: str = Field(min_length=1, max_length=160)
    version: int = Field(default=1, ge=1)
    status: str = "ready"
    payload: dict[str, Any]


class ArtifactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    artifact_type: ArtifactType
    name: str
    version: int
    status: str
    review_status: str
    review_note: str
    payload: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def serialize_utc(self, value: datetime) -> str:
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.isoformat()


class ArtifactReview(BaseModel):
    decision: Literal["approved", "changes_requested"]
    note: str = Field(default="", max_length=2000)


class ArtifactRevision(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    status: str = "ready"
    payload: dict[str, Any]


class CanvasPosition(BaseModel):
    x: float
    y: float


class ArtifactLayout(BaseModel):
    positions: dict[str, CanvasPosition]
