from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    objective: str = Field(default="", max_length=10_000)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    objective: str | None = Field(default=None, max_length=10_000)
    status: str | None = None


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    objective: str
    status: str
    workflow_stage: str
    source_count: int
    entity_count: int
    mapping_count: int
    dq_rule_count: int
    review_count: int
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def serialize_utc(self, value: datetime) -> str:
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.isoformat()
