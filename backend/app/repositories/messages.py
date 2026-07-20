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

    def create(self, *, project_id: str, role: str, content: str) -> Message:
        message = Message(project_id=project_id, role=role, content=content)
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message
