import hashlib
import json
from typing import Any

from sqlalchemy import select

from app.db.models import ToolOperation
from app.db.session import SessionLocal


class ToolOperationStore:
    def fingerprint(
        self,
        *,
        project_id: str,
        plan_id: str,
        step_id: str,
        tool_name: str,
        arguments: dict[str, Any],
    ) -> str:
        raw = json.dumps(
            [project_id, plan_id, step_id, tool_name, arguments],
            sort_keys=True,
            separators=(",", ":"),
            default=str,
        )
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def completed_result(self, fingerprint: str) -> dict[str, Any] | None:
        with SessionLocal() as db:
            operation = db.scalar(
                select(ToolOperation).where(
                    ToolOperation.request_fingerprint == fingerprint,
                    ToolOperation.status == "completed",
                )
            )
            return dict(operation.result) if operation is not None else None

    def mark_pending(
        self,
        *,
        fingerprint: str,
        project_id: str,
        run_id: str | None,
        tool_name: str,
        arguments: dict[str, Any],
    ) -> None:
        with SessionLocal() as db:
            operation = db.scalar(
                select(ToolOperation).where(ToolOperation.request_fingerprint == fingerprint)
            )
            if operation is None:
                operation = ToolOperation(
                    project_id=project_id,
                    run_id=run_id,
                    request_fingerprint=fingerprint,
                    tool_name=tool_name,
                    arguments=arguments,
                    status="pending",
                )
                db.add(operation)
            else:
                operation.status = "pending"
                operation.error = ""
            db.commit()

    def finish(
        self,
        fingerprint: str,
        *,
        status: str,
        result: dict[str, Any] | None = None,
        error: str = "",
    ) -> None:
        with SessionLocal() as db:
            operation = db.scalar(
                select(ToolOperation).where(ToolOperation.request_fingerprint == fingerprint)
            )
            if operation is None:
                return
            operation.status = status
            operation.result = result or {}
            operation.error = error
            db.commit()
