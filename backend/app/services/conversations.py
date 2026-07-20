from app.db.models import Message
from app.repositories.messages import MessageRepository


class ConversationService:
    def __init__(self, repository: MessageRepository) -> None:
        self.repository = repository

    def list(self, project_id: str) -> list[Message]:
        return self.repository.list_for_project(project_id)

    def add(self, project_id: str, role: str, content: str) -> Message:
        return self.repository.create(project_id=project_id, role=role, content=content)
