from typing import Literal

from pydantic import BaseModel, Field


class ProviderSettingsUpdate(BaseModel):
    provider: Literal["lm_studio", "openai", "custom", "anthropic"]
    base_url: str = Field(min_length=1)
    model: str = Field(min_length=1)
    api_key: str | None = None
    temperature: float = Field(ge=0, le=2)
    request_timeout: int = Field(ge=5, le=600)
    structured_output: bool
    tool_calling: bool
    data_dir: str
    max_upload_mb: int = Field(ge=1, le=1000)
    log_level: str


class ProviderConnectionTest(ProviderSettingsUpdate):
    model: str = ""


class ProviderSettingsRead(BaseModel):
    provider: str
    base_url: str
    model: str
    api_key_configured: bool
    temperature: float
    request_timeout: int
    structured_output: bool
    tool_calling: bool
    data_dir: str
    max_upload_mb: int
    log_level: str


class ProviderHealth(BaseModel):
    ok: bool
    provider: str
    model: str
    models: list[str] = []
    detail: str
