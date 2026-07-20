import json
from collections.abc import AsyncIterator
from typing import Any, TypeVar

import httpx
from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


class OpenAICompatibleProvider:
    def __init__(
        self,
        *,
        name: str,
        base_url: str,
        api_key: str,
        model: str,
        timeout: int = 120,
        temperature: float = 0.2,
    ) -> None:
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout = timeout
        self.temperature = temperature

    @property
    def headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    async def list_models(self) -> list[str]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/models", headers=self.headers)
            response.raise_for_status()
            return [item["id"] for item in response.json().get("data", [])]

    async def health_check(self) -> dict[str, Any]:
        try:
            models = await self.list_models()
            resolved = self._match_model(self.model, models)
            loaded = not self.model or resolved is not None
            return {
                "ok": bool(models) and loaded,
                "provider": self.name,
                "model": resolved or self.model,
                "models": models,
                "detail": "Connected"
                if loaded
                else f"Configured model '{self.model}' is not loaded",
            }
        except (httpx.HTTPError, KeyError, TypeError) as exc:
            return {
                "ok": False,
                "provider": self.name,
                "model": self.model,
                "models": [],
                "detail": f"Connection failed: {exc}",
            }

    @staticmethod
    def _match_model(configured: str, available: list[str]) -> str | None:
        if configured in available:
            return configured
        normalized = configured.lower()
        return next((item for item in available if normalized in item.lower()), None)

    async def _model_for_request(self) -> str:
        return self.model

    def _payload(
        self,
        messages: list[dict[str, Any]],
        temperature: float | None,
        *,
        model: str,
    ) -> dict[str, Any]:
        if not model:
            raise RuntimeError("No chat model configured")
        return {
            "model": model,
            "messages": messages,
            "temperature": self.temperature if temperature is None else temperature,
        }

    async def generate_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> str:
        model = await self._model_for_request()
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=self._payload(messages, temperature, model=model),
            )
            response.raise_for_status()
            return str(response.json()["choices"][0]["message"]["content"])

    async def generate_structured(
        self,
        messages: list[dict[str, Any]],
        response_model: type[T],
        *,
        temperature: float | None = None,
    ) -> T:
        model = await self._model_for_request()
        payload = self._payload(messages, temperature, model=model)
        payload["response_format"] = {
            "type": "json_schema",
            "json_schema": {
                "name": response_model.__name__,
                "schema": response_model.model_json_schema(),
            },
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions", headers=self.headers, json=payload
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError:
            fallback = messages + [
                {
                    "role": "system",
                    "content": "Return only valid JSON matching the requested schema.",
                }
            ]
            content = await self.generate_text(fallback, temperature=temperature)
        try:
            return response_model.model_validate_json(extract_json(content))
        except (ValidationError, ValueError):
            repair_messages = [
                *messages,
                {
                    "role": "system",
                    "content": (
                        "The previous response did not validate. Return only one JSON object "
                        f"matching this schema: {json.dumps(response_model.model_json_schema())}"
                    ),
                },
                {"role": "assistant", "content": str(content)},
            ]
            repaired = await self.generate_text(repair_messages, temperature=0)
            return response_model.model_validate_json(extract_json(repaired))

    async def stream_text(
        self, messages: list[dict[str, Any]], *, temperature: float | None = None
    ) -> AsyncIterator[str]:
        model = await self._model_for_request()
        payload = self._payload(messages, temperature, model=model)
        payload["stream"] = True
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST", f"{self.base_url}/chat/completions", headers=self.headers, json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: ") or line == "data: [DONE]":
                        continue
                    data = json.loads(line[6:])
                    token = data.get("choices", [{}])[0].get("delta", {}).get("content")
                    if token:
                        yield str(token)

    async def invoke_tools(
        self, messages: list[dict[str, Any]], tools: list[dict[str, Any]]
    ) -> dict[str, Any]:
        model = await self._model_for_request()
        payload = self._payload(messages, None, model=model)
        payload["tools"] = tools
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions", headers=self.headers, json=payload
            )
            response.raise_for_status()
            return dict(response.json()["choices"][0]["message"])


def extract_json(content: object) -> str:
    text = str(content).strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        text = text.rsplit("```", 1)[0].strip()
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end < start:
        raise ValueError("Structured model response did not contain a JSON object")
    return text[start : end + 1]
