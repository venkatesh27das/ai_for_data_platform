from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    app_env: str = "development"
    database_url: str = "sqlite:///./data/assistant.db"
    frontend_origin: str = "http://localhost:5173"
    data_dir: Path = Path("./data")
    max_upload_mb: int = 25
    log_level: str = "INFO"

    llm_provider: str = "lm_studio"
    lm_studio_base_url: str = "http://localhost:1234/v1"
    lm_studio_api_key: str = "lm-studio"
    lm_studio_model: str = "gemma-4-12b-qat"
    embedding_provider: str = "lm_studio"
    embedding_model: str = "nomic-embed-text"
    llm_temperature: float = 0.2
    llm_request_timeout: int = 120
    agent_request_timeout: int = 45
    workflow_checkpoint_path: Path = Path("./data/workflow_checkpoints.db")

    openai_base_url: str = "https://api.openai.com/v1"
    openai_api_key: str = ""
    openai_model: str = ""
    anthropic_api_key: str = ""
    anthropic_model: str = ""
    custom_llm_base_url: str = ""
    custom_llm_api_key: str = ""
    custom_llm_model: str = ""


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    return settings
