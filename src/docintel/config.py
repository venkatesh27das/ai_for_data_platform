from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables and `.env`."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "local"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"
    artifacts_dir: Path = Path("./data/artifacts")
    uploads_dir: Path = Path("./data/uploads")

    postgres_db: str = "document_intelligence"
    postgres_user: str = "docintel"
    postgres_password: str = "docintel"
    database_url: str = (
        "postgresql+psycopg://docintel:docintel@localhost:5432/document_intelligence"
    )

    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    qdrant_url: str = "http://localhost:6333"
    qdrant_collection_document_chunks: str = "document_chunks"

    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "change-me"

    object_store_mode: str = "filesystem"
    minio_endpoint: str = "http://localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "docintel"

    lm_studio_base_url: str = "http://localhost:1234/v1"
    lm_studio_api_key: str = "lm-studio"
    lm_studio_llm_model: str = Field(default="<set-your-loaded-gemma-4-model-id>")
    lm_studio_vlm_model: str = Field(default="<set-your-loaded-gemma-4-model-id>")
    lm_studio_embedding_model: str = Field(default="<set-your-loaded-nomic-embedding-model-id>")
    lm_studio_request_timeout_seconds: int = 180

    ocr_provider: str = "disabled"
    olmocr_enabled: bool = False
    olmocr_base_url: str = "http://localhost:8008"
    olmocr_timeout_seconds: int = 300

    max_upload_mb: int = 100
    default_chunk_size_tokens: int = 700
    default_chunk_overlap_tokens: int = 100
    min_text_quality_score: float = 0.70
    min_extraction_confidence: float = 0.70
    min_relationship_confidence: float = 0.75

    @property
    def max_upload_bytes(self) -> int:
        """Maximum accepted upload size in bytes."""

        return self.max_upload_mb * 1024 * 1024

    def ensure_local_directories(self) -> None:
        """Create local filesystem directories required by Phase 0."""

        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
