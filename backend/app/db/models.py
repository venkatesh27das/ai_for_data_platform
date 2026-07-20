from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(160))
    objective: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="draft")
    workflow_stage: Mapped[str] = mapped_column(String(64), default="new")
    source_count: Mapped[int] = mapped_column(Integer, default=0)
    entity_count: Mapped[int] = mapped_column(Integer, default=0)
    mapping_count: Mapped[int] = mapped_column(Integer, default=0)
    dq_rule_count: Mapped[int] = mapped_column(Integer, default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    workflow_state: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
    messages: Mapped[list["Message"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    artifacts: Mapped[list["Artifact"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    sources: Mapped[list["ProjectSource"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(24))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    project: Mapped[Project] = relationship(back_populates="messages")


class Artifact(Base):
    __tablename__ = "artifacts"
    __table_args__ = (
        UniqueConstraint(
            "project_id", "artifact_type", "version", name="uq_artifact_project_type_version"
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    artifact_type: Mapped[str] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(160))
    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(32), default="ready")
    review_status: Mapped[str] = mapped_column(String(32), default="pending")
    review_note: Mapped[str] = mapped_column(Text, default="")
    payload: Mapped[dict[str, object]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
    project: Mapped[Project] = relationship(back_populates="artifacts")


class ProjectSource(Base):
    __tablename__ = "project_sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    format: Mapped[str] = mapped_column(String(32))
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    content_excerpt: Mapped[str] = mapped_column(Text, default="")
    profile: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    project: Mapped[Project] = relationship(back_populates="sources")


class ProviderSettings(Base):
    __tablename__ = "provider_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    provider: Mapped[str] = mapped_column(String(64), default="lm_studio")
    base_url: Mapped[str] = mapped_column(String(512))
    model: Mapped[str] = mapped_column(String(256))
    api_key: Mapped[str] = mapped_column(String(512), default="")
    temperature: Mapped[float] = mapped_column(Float, default=0.2)
    request_timeout: Mapped[int] = mapped_column(Integer, default=120)
    structured_output: Mapped[bool] = mapped_column(Boolean, default=True)
    tool_calling: Mapped[bool] = mapped_column(Boolean, default=True)
    data_dir: Mapped[str] = mapped_column(String(512), default="./data")
    max_upload_mb: Mapped[int] = mapped_column(Integer, default=25)
    log_level: Mapped[str] = mapped_column(String(20), default="INFO")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
