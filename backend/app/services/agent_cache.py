import hashlib
import json
from datetime import timedelta
from typing import Any

from sqlalchemy import delete

from app.db.models import AgentResultCache as AgentResultCacheModel
from app.db.models import utcnow
from app.db.session import SessionLocal


class AgentResultCache:
    def __init__(self, ttl_seconds: int = 86_400) -> None:
        self.ttl_seconds = ttl_seconds

    def key(
        self,
        *,
        agent_id: str,
        agent_version: str,
        provider: str,
        model: str,
        instructions: str,
        payload: dict[str, Any],
        output_schema: dict[str, Any],
    ) -> str:
        serialized = json.dumps(
            {
                "agent_id": agent_id,
                "agent_version": agent_version,
                "provider": provider,
                "model": model,
                "instructions": instructions,
                "payload": payload,
                "output_schema": output_schema,
            },
            sort_keys=True,
            separators=(",", ":"),
            default=str,
        )
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def get(self, cache_key: str) -> dict[str, Any] | None:
        with SessionLocal() as db:
            item = db.get(AgentResultCacheModel, cache_key)
            if item is None:
                return None
            expires_at = item.expires_at
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=utcnow().tzinfo)
            if expires_at <= utcnow():
                db.delete(item)
                db.commit()
                return None
            return dict(item.result)

    def put(
        self,
        cache_key: str,
        *,
        agent_id: str,
        provider: str,
        model: str,
        result: dict[str, Any],
    ) -> None:
        with SessionLocal() as db:
            expires_at = utcnow() + timedelta(seconds=self.ttl_seconds)
            item = db.get(AgentResultCacheModel, cache_key)
            if item is None:
                item = AgentResultCacheModel(
                    cache_key=cache_key,
                    agent_id=agent_id,
                    provider=provider,
                    model=model,
                    result=result,
                    expires_at=expires_at,
                )
                db.add(item)
            else:
                item.result = result
                item.expires_at = expires_at
            db.commit()

    def prune(self) -> int:
        with SessionLocal() as db:
            result = db.execute(
                delete(AgentResultCacheModel).where(AgentResultCacheModel.expires_at <= utcnow())
            )
            db.commit()
            return int(getattr(result, "rowcount", 0) or 0)
