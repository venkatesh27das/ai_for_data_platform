import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.llm.lm_studio import LMStudioProvider
from app.services import agent_cache
from app.services.agent_cache import AgentResultCache


def test_agent_result_cache_is_stable_and_persistent(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    monkeypatch.setattr(
        agent_cache,
        "SessionLocal",
        sessionmaker(bind=engine, expire_on_commit=False),
    )
    cache = AgentResultCache(ttl_seconds=60)
    key = cache.key(
        agent_id="source_analysis_agent",
        agent_version="1.0",
        provider="lm_studio",
        model="gemma",
        instructions="Analyse sources",
        payload={"source": "orders"},
        output_schema={"type": "object"},
    )
    same_key = cache.key(
        agent_id="source_analysis_agent",
        agent_version="1.0",
        provider="lm_studio",
        model="gemma",
        instructions="Analyse sources",
        payload={"source": "orders"},
        output_schema={"type": "object"},
    )
    cache.put(
        key,
        agent_id="source_analysis_agent",
        provider="lm_studio",
        model="gemma",
        result={"answer": "cached"},
    )

    assert same_key == key
    assert cache.get(key) == {"answer": "cached"}


async def test_lm_studio_reuses_http_client_and_resolved_model() -> None:
    model_requests = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal model_requests
        if request.url.path.endswith("/models"):
            model_requests += 1
            return httpx.Response(200, json={"data": [{"id": "gemma-4-12b-qat"}]})
        return httpx.Response(
            200,
            json={"choices": [{"message": {"content": "ready"}}]},
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        provider = LMStudioProvider(
            base_url="http://lm-studio.test/v1",
            api_key="local",
            model="gemma-4-12b-qat",
            client=client,
        )
        first = await provider.generate_text([{"role": "user", "content": "one"}])
        second = await provider.generate_text([{"role": "user", "content": "two"}])

    assert first == second == "ready"
    assert model_requests == 1
