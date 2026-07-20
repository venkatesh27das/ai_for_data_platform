import asyncio
from abc import ABC, abstractmethod

import httpx
from pydantic import BaseModel

from app.llm.base import LLMProvider


class StructuredAgent[InputT: BaseModel, OutputT: BaseModel](ABC):
    identifier: str
    version = "1.0"
    purpose: str
    allowed_tools: tuple[str, ...] = ()
    output_model: type[OutputT]

    def __init__(self, provider: LLMProvider, timeout_seconds: float = 45) -> None:
        self.provider = provider
        self.timeout_seconds = timeout_seconds

    @property
    @abstractmethod
    def instructions(self) -> str: ...

    async def run(self, payload: InputT) -> OutputT:
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
                return await asyncio.wait_for(
                    self.provider.generate_structured(messages, self.output_model),
                    timeout=self.timeout_seconds,
                )
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

    def fallback(self, payload: InputT, error: Exception) -> OutputT:
        raise RuntimeError(
            f"{self.identifier} could not produce a valid structured result: {type(error).__name__}"
        ) from error
