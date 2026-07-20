from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import get_project_service
from app.db.models import Project
from app.schemas.projects import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.projects import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])
Service = Annotated[ProjectService, Depends(get_project_service)]


@router.get("", response_model=list[ProjectRead])
def list_projects(service: Service) -> list[Project]:
    return service.list()


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, service: Service) -> Project:
    return service.create(payload)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: str, service: Service) -> Project:
    return service.get(project_id)


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(project_id: str, payload: ProjectUpdate, service: Service) -> Project:
    return service.update(project_id, payload)


@router.post(
    "/{project_id}/duplicate", response_model=ProjectRead, status_code=status.HTTP_201_CREATED
)
def duplicate_project(project_id: str, service: Service) -> Project:
    return service.duplicate(project_id)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, service: Service) -> Response:
    service.delete(project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
