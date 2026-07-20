import httpx

from app.config import Settings
from app.llm.anthropic_provider import AnthropicProvider
from app.llm.base import LLMProvider
from app.llm.lm_studio import LMStudioProvider
from app.llm.openai_compatible import OpenAICompatibleProvider
from app.llm.openai_provider import OpenAIProvider
from app.runtime import ProviderGuard


class ProviderRegistry:
    def __init__(
        self,
        settings: Settings,
        *,
        client: httpx.AsyncClient | None = None,
        guard: ProviderGuard | None = None,
    ) -> None:
        self.settings = settings
        self.client = client
        self.guard = guard

    def get(
        self,
        provider_name: str,
        *,
        base_url: str | None = None,
        model: str | None = None,
        api_key: str | None = None,
    ) -> LLMProvider:
        if provider_name == "lm_studio":
            return LMStudioProvider(
                base_url=base_url or self.settings.lm_studio_base_url,
                api_key=api_key or self.settings.lm_studio_api_key,
                model=model or self.settings.lm_studio_model,
                timeout=self.settings.llm_request_timeout,
                temperature=self.settings.llm_temperature,
                client=self.client,
                guard=self.guard,
            )
        if provider_name == "openai":
            return OpenAIProvider(
                base_url=base_url or self.settings.openai_base_url,
                api_key=api_key or self.settings.openai_api_key,
                model=model or self.settings.openai_model,
                timeout=self.settings.llm_request_timeout,
                client=self.client,
                guard=self.guard,
            )
        if provider_name == "anthropic":
            return AnthropicProvider(
                api_key=api_key or self.settings.anthropic_api_key,
                model=model or self.settings.anthropic_model,
            )
        if provider_name == "custom":
            return OpenAICompatibleProvider(
                name="custom",
                base_url=base_url or self.settings.custom_llm_base_url,
                api_key=api_key or self.settings.custom_llm_api_key,
                model=model or self.settings.custom_llm_model,
                timeout=self.settings.llm_request_timeout,
                client=self.client,
                guard=self.guard,
            )
        raise ValueError(f"Unknown provider: {provider_name}")
