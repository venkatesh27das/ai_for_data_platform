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
    tool_request_timeout: int = 30
    mcp_request_timeout: int = 30
    mcp_schema_cache_ttl_seconds: int = 300
    mcp_servers_json: str = "{}"
    mcp_tool_allowlist: str = ""
    llm_max_concurrency: int = 2
    llm_circuit_failure_threshold: int = 3
    llm_circuit_reset_seconds: float = 20
    http_max_connections: int = 20
    http_max_keepalive_connections: int = 10
    workflow_event_poll_interval: float = 0.15
    workflow_recent_message_limit: int = 12
    workflow_message_char_limit: int = 4_000
    workflow_source_excerpt_limit: int = 8_000
    planner_fast_path: bool = True
    presenter_fast_path: bool = True
    deterministic_source_analysis: bool = True
    deterministic_structural_validation: bool = True
    agent_result_cache_enabled: bool = True
    agent_result_cache_ttl_seconds: int = 86_400
    memory_enabled: bool = True
    memory_retrieval_limit: int = 5
    memory_embedding_timeout: int = 10

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
