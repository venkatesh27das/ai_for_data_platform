import httpx

from app.llm.openai_compatible import OpenAICompatibleProvider
from app.runtime import ProviderGuard


class LMStudioProvider(OpenAICompatibleProvider):
    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str,
        timeout: int = 120,
        temperature: float = 0.2,
        client: httpx.AsyncClient | None = None,
        guard: ProviderGuard | None = None,
    ) -> None:
        super().__init__(
            name="lm_studio",
            base_url=base_url,
            api_key=api_key,
            model=model,
            timeout=timeout,
            temperature=temperature,
            client=client,
            guard=guard,
        )
        self._resolved_model: str | None = None

    async def _model_for_request(self) -> str:
        if self._resolved_model is not None:
            return self._resolved_model
        models = await self.list_models()
        resolved = self._match_model(self.model, models)
        if resolved is None:
            raise RuntimeError(f"Configured model '{self.model}' is not loaded in LM Studio")
        self._resolved_model = resolved
        return resolved
