from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.session import get_db
from app.llm.embeddings import OpenAICompatibleEmbeddingProvider
from app.repositories.artifacts import ArtifactRepository
from app.repositories.memory import MemoryRepository
from app.repositories.messages import MessageRepository
from app.repositories.projects import ProjectRepository
from app.repositories.sources import SourceRepository
from app.services.artifacts import ArtifactService
from app.services.conversations import ConversationService
from app.services.memory import MemoryService
from app.services.projects import ProjectService
from app.services.provider_settings import ProviderConfigurationService
from app.services.source_ingestion import SourceIngestionService

Db = Annotated[Session, Depends(get_db)]


def get_project_service(db: Db) -> ProjectService:
    return ProjectService(ProjectRepository(db))


def get_conversation_service(db: Db) -> ConversationService:
    return ConversationService(MessageRepository(db))


def get_artifact_service(db: Db) -> ArtifactService:
    return ArtifactService(ArtifactRepository(db))


def get_source_ingestion_service(
    db: Db, settings: Annotated[Settings, Depends(get_settings)]
) -> SourceIngestionService:
    return SourceIngestionService(SourceRepository(db), settings.max_upload_mb)


def get_provider_configuration_service(
    db: Db, settings: Annotated[Settings, Depends(get_settings)]
) -> ProviderConfigurationService:
    return ProviderConfigurationService(db, settings)


def get_memory_service(
    db: Db, settings: Annotated[Settings, Depends(get_settings)]
) -> MemoryService:
    provider = OpenAICompatibleEmbeddingProvider(
        base_url=settings.lm_studio_base_url,
        api_key=settings.lm_studio_api_key,
        model=settings.embedding_model,
        timeout=settings.memory_embedding_timeout,
    )
    return MemoryService(
        MemoryRepository(db),
        provider if settings.memory_enabled else None,
        settings.memory_retrieval_limit,
    )
