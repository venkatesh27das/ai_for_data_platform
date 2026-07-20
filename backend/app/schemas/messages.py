from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=50_000)


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    role: str
    content: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_utc(self, value: datetime) -> str:
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.isoformat()
