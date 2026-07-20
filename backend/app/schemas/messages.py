from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=50_000)


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    role: str
    content: str
    created_at: datetime
