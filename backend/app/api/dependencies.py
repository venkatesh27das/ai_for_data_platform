from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.session import get_db
from app.repositories.artifacts import ArtifactRepository
from app.repositories.messages import MessageRepository
from app.repositories.projects import ProjectRepository
from app.services.artifacts import ArtifactService
from app.services.conversations import ConversationService
from app.services.projects import ProjectService
from app.services.provider_settings import ProviderConfigurationService

Db = Annotated[Session, Depends(get_db)]


def get_project_service(db: Db) -> ProjectService:
    return ProjectService(ProjectRepository(db))


def get_conversation_service(db: Db) -> ConversationService:
    return ConversationService(MessageRepository(db))


def get_artifact_service(db: Db) -> ArtifactService:
    return ArtifactService(ArtifactRepository(db))


def get_provider_configuration_service(
    db: Db, settings: Annotated[Settings, Depends(get_settings)]
) -> ProviderConfigurationService:
    return ProviderConfigurationService(db, settings)
