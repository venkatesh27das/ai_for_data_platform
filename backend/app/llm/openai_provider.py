import httpx

from app.llm.openai_compatible import OpenAICompatibleProvider
from app.runtime import ProviderGuard


class OpenAIProvider(OpenAICompatibleProvider):
    """Placeholder ready for the OpenAI-compatible chat-completions contract."""

    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str,
        timeout: int = 120,
        temperature: float = 0.2,
        structured_output: bool = True,
        client: httpx.AsyncClient | None = None,
        guard: ProviderGuard | None = None,
    ) -> None:
        super().__init__(
            name="openai",
            base_url=base_url,
            api_key=api_key,
            model=model,
            timeout=timeout,
            temperature=temperature,
            structured_output=structured_output,
            client=client,
            guard=guard,
        )
