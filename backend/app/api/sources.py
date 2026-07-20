from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile

from app.api.dependencies import get_project_service, get_source_ingestion_service
from app.db.models import ProjectSource
from app.schemas.sources import ProjectSourceRead
from app.services.projects import ProjectService
from app.services.source_ingestion import SourceIngestionService

router = APIRouter(prefix="/projects/{project_id}/sources", tags=["sources"])


@router.get("", response_model=list[ProjectSourceRead])
def list_sources(
    project_id: str,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    sources: Annotated[SourceIngestionService, Depends(get_source_ingestion_service)],
) -> list[ProjectSource]:
    projects.get(project_id)
    return sources.list(project_id)


@router.post("", response_model=ProjectSourceRead, status_code=201)
async def upload_source(
    project_id: str,
    projects: Annotated[ProjectService, Depends(get_project_service)],
    sources: Annotated[SourceIngestionService, Depends(get_source_ingestion_service)],
    file: Annotated[UploadFile, File()],
) -> ProjectSource:
    project = projects.get(project_id)
    source = await sources.ingest(project_id, file)
    projects.repository.update(project, source_count=len(sources.list(project_id)))
    return source
