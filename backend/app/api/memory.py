from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import get_memory_service, get_project_service
from app.db.models import MemoryEntry, MemorySettings
from app.schemas.memory import (
    MemoryEntryRead,
    MemorySettingsRead,
    MemorySettingsUpdate,
    ProjectMemoryEnvelope,
    UserMemoryCreate,
)
from app.services.memory import MemoryService
from app.services.projects import ProjectService

router = APIRouter(tags=["memory"])
Memory = Annotated[MemoryService, Depends(get_memory_service)]
Projects = Annotated[ProjectService, Depends(get_project_service)]


@router.get("/projects/{project_id}/memory", response_model=ProjectMemoryEnvelope)
def get_project_memory(
    project_id: str, memory: Memory, projects: Projects
) -> ProjectMemoryEnvelope:
    projects.get(project_id)
    structured, entries = memory.project_memory(project_id)
    return ProjectMemoryEnvelope(memory=structured, entries=entries)


@router.delete("/projects/{project_id}/memory", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_memory(project_id: str, memory: Memory, projects: Projects) -> Response:
    projects.get(project_id)
    memory.delete_project_memory(project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/memory/settings", response_model=MemorySettingsRead)
def get_memory_settings(memory: Memory) -> MemorySettings:
    return memory.settings()


@router.put("/memory/settings", response_model=MemorySettingsRead)
def update_memory_settings(
    payload: MemorySettingsUpdate, memory: Memory
) -> MemorySettings:
    return memory.update_settings(payload.cross_project_enabled)


@router.get("/memory/user", response_model=list[MemoryEntryRead])
def list_user_memory(memory: Memory) -> list[MemoryEntry]:
    return memory.user_entries()


@router.post(
    "/memory/user", response_model=MemoryEntryRead, status_code=status.HTTP_201_CREATED
)
async def create_user_memory(payload: UserMemoryCreate, memory: Memory) -> MemoryEntry:
    return await memory.add_user_entry(kind=payload.kind, content=payload.content)


@router.delete("/memory/user", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_user_memory(memory: Memory) -> Response:
    memory.delete_user_entries()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/memory/user/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_memory(entry_id: str, memory: Memory) -> Response:
    memory.delete_user_entries(entry_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
