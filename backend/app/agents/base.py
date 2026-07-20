import asyncio
from abc import ABC, abstractmethod

import httpx
from pydantic import BaseModel

from app.llm.base import LLMProvider
from app.services.agent_cache import AgentResultCache


class StructuredAgent[InputT: BaseModel, OutputT: BaseModel](ABC):
    identifier: str
    version = "1.0"
    purpose: str
    allowed_tools: tuple[str, ...] = ()
    output_model: type[OutputT]

    def __init__(
        self,
        provider: LLMProvider,
        timeout_seconds: float = 45,
        result_cache: AgentResultCache | None = None,
    ) -> None:
        self.provider = provider
        self.timeout_seconds = timeout_seconds
        self.result_cache = result_cache

    @property
    @abstractmethod
    def instructions(self) -> str: ...

    async def run(self, payload: InputT) -> OutputT:
        cache_key = self._cache_key(payload)
        if cache_key is not None and self.result_cache is not None:
            cached = self.result_cache.get(cache_key)
            if cached is not None:
                return self.output_model.model_validate(cached).model_copy(
                    update={"execution_mode": "cached"}
                )
        messages = [
            {"role": "system", "content": self.instructions},
            {
                "role": "user",
                "content": (
                    "Complete this agent task using only the supplied context. "
                    "Return the structured result requested by the schema.\n\n"
                    f"{payload.model_dump_json(indent=2)}"
                ),
            },
        ]
        failure: Exception | None = None
        for attempt in range(2):
            try:
                result = await asyncio.wait_for(
                    self.provider.generate_structured(messages, self.output_model),
                    timeout=self.timeout_seconds,
                )
                if cache_key is not None and self.result_cache is not None:
                    self.result_cache.put(
                        cache_key,
                        agent_id=self.identifier,
                        provider=self.provider.name,
                        model=self.provider.model,
                        result=result.model_dump(mode="json"),
                    )
                return result
            except (TimeoutError, httpx.HTTPError) as exc:
                failure = exc
                if attempt == 0:
                    await asyncio.sleep(0.2)
                    continue
            except (RuntimeError, ValueError) as exc:
                failure = exc
            break
        assert failure is not None
        result = self.fallback(payload, failure)
        return result.model_copy(
            update={
                "execution_mode": "fallback",
                "fallback_reason": str(failure) or type(failure).__name__,
            }
        )

    def _cache_key(self, payload: InputT) -> str | None:
        if self.result_cache is None:
            return None
        return self.result_cache.key(
            agent_id=self.identifier,
            agent_version=self.version,
            provider=self.provider.name,
            model=self.provider.model,
            instructions=self.instructions,
            payload=payload.model_dump(mode="json"),
            output_schema=self.output_model.model_json_schema(),
        )

    def fallback(self, payload: InputT, error: Exception) -> OutputT:
        raise RuntimeError(
            f"{self.identifier} could not produce a valid structured result: {type(error).__name__}"
        ) from error
