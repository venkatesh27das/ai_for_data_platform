from app.llm.openai_compatible import OpenAICompatibleProvider


class LMStudioProvider(OpenAICompatibleProvider):
    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str,
        timeout: int = 120,
        temperature: float = 0.2,
    ) -> None:
        super().__init__(
            name="lm_studio",
            base_url=base_url,
            api_key=api_key,
            model=model,
            timeout=timeout,
            temperature=temperature,
        )

    async def _model_for_request(self) -> str:
        models = await self.list_models()
        resolved = self._match_model(self.model, models)
        if resolved is None:
            raise RuntimeError(f"Configured model '{self.model}' is not loaded in LM Studio")
        return resolved
