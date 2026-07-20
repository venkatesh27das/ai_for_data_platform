from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Message


class MessageRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_project(self, project_id: str) -> list[Message]:
        statement = (
            select(Message).where(Message.project_id == project_id).order_by(Message.created_at)
        )
        return list(self.db.scalars(statement))

    def create(
        self,
        *,
        project_id: str,
        role: str,
        content: str,
        workflow_run_id: str | None = None,
        commit: bool = True,
    ) -> Message:
        if workflow_run_id is not None:
            existing = self.db.scalar(
                select(Message).where(
                    Message.workflow_run_id == workflow_run_id,
                    Message.role == role,
                )
            )
            if existing is not None:
                return existing
        message = Message(
            project_id=project_id,
            role=role,
            content=content,
            workflow_run_id=workflow_run_id,
        )
        self.db.add(message)
        if commit:
            self.db.commit()
            self.db.refresh(message)
        else:
            self.db.flush()
        return message
