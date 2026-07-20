from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import MemoryEntry, MemorySettings, ProjectMemory, utcnow


class MemoryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_project_memory(self, project_id: str) -> ProjectMemory | None:
        return self.db.get(ProjectMemory, project_id)

    def upsert_project_memory(
        self, project_id: str, **values: Any
    ) -> ProjectMemory:
        memory = self.get_project_memory(project_id) or ProjectMemory(project_id=project_id)
        for key, value in values.items():
            setattr(memory, key, value)
        memory.updated_at = utcnow()
        self.db.add(memory)
        self.db.flush()
        return memory

    def settings(self) -> MemorySettings:
        value = self.db.get(MemorySettings, 1)
        if value is None:
            value = MemorySettings(id=1, cross_project_enabled=False)
            self.db.add(value)
            self.db.flush()
        return value

    def set_cross_project_enabled(self, enabled: bool) -> MemorySettings:
        value = self.settings()
        value.cross_project_enabled = enabled
        value.updated_at = utcnow()
        self.db.commit()
        self.db.refresh(value)
        return value

    def list_entries(
        self, *, project_id: str | None = None, scope: str | None = None
    ) -> list[MemoryEntry]:
        statement = select(MemoryEntry)
        if project_id is not None:
            statement = statement.where(MemoryEntry.project_id == project_id)
        if scope is not None:
            statement = statement.where(MemoryEntry.scope == scope)
        return list(self.db.scalars(statement.order_by(MemoryEntry.updated_at.desc())))

    def candidates(self, project_id: str, *, include_user: bool) -> list[MemoryEntry]:
        project_scope = (MemoryEntry.scope == "project") & (
            MemoryEntry.project_id == project_id
        )
        if include_user:
            statement = select(MemoryEntry).where(
                project_scope | (MemoryEntry.scope == "user")
            )
        else:
            statement = select(MemoryEntry).where(project_scope)
        return list(
            self.db.scalars(
                statement.order_by(MemoryEntry.updated_at.desc())
            )
        )

    def entry_for_run(
        self, run_id: str, scope: str, kind: str, content: str | None = None
    ) -> MemoryEntry | None:
        statement = select(MemoryEntry).where(
                MemoryEntry.source_run_id == run_id,
                MemoryEntry.scope == scope,
                MemoryEntry.kind == kind,
            )
        if content is not None:
            statement = statement.where(MemoryEntry.content == content)
        return self.db.scalar(statement)

    def add_entry(
        self,
        *,
        scope: str,
        kind: str,
        content: str,
        embedding: list[float],
        metadata: dict[str, Any] | None = None,
        project_id: str | None = None,
        source_project_id: str | None = None,
        source_run_id: str | None = None,
    ) -> MemoryEntry:
        entry = MemoryEntry(
            scope=scope,
            kind=kind,
            content=content,
            embedding=embedding,
            entry_metadata=metadata or {},
            project_id=project_id,
            source_project_id=source_project_id,
            source_run_id=source_run_id,
        )
        self.db.add(entry)
        self.db.flush()
        return entry

    def delete_project_memory(self, project_id: str) -> None:
        self.db.execute(delete(MemoryEntry).where(MemoryEntry.project_id == project_id))
        memory = self.get_project_memory(project_id)
        if memory is not None:
            self.db.delete(memory)
        self.db.commit()

    def delete_user_entries(self, entry_id: str | None = None) -> int:
        condition = MemoryEntry.scope == "user"
        if entry_id is not None:
            condition = condition & (MemoryEntry.id == entry_id)
        count = len(list(self.db.scalars(select(MemoryEntry.id).where(condition))))
        self.db.execute(delete(MemoryEntry).where(condition))
        self.db.commit()
        return count
