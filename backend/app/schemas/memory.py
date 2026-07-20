from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ProjectMemoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: str
    summary: str
    facts: dict[str, Any]
    decisions: list[str]
    assumptions: list[str]
    terminology: dict[str, str]
    preferences: dict[str, Any]
    updated_at: datetime


class MemoryEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str | None
    scope: str
    kind: str
    content: str
    entry_metadata: dict[str, Any]
    source_project_id: str | None
    created_at: datetime
    updated_at: datetime


class MemorySettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cross_project_enabled: bool
    updated_at: datetime


class MemorySettingsUpdate(BaseModel):
    cross_project_enabled: bool


class UserMemoryCreate(BaseModel):
    kind: Literal["preference", "terminology", "fact"] = "preference"
    content: str = Field(min_length=1, max_length=4_000)


class ProjectMemoryEnvelope(BaseModel):
    memory: ProjectMemoryRead | None
    entries: list[MemoryEntryRead]
