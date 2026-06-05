"""add processing and canonical asset tables

Revision ID: 0002_processing_and_canonical_assets
Revises: 0001_create_documents
Create Date: 2026-06-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_processing_and_canonical_assets"
down_revision: str | None = "0001_create_documents"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "document_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("checksum_sha256", sa.String(length=64), nullable=False),
        sa.Column("storage_uri", sa.String(length=1024), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_document_versions"),
    )
    op.create_index(
        "ix_document_versions_document_id", "document_versions", ["document_id"], unique=False
    )

    op.create_table(
        "processing_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pipeline_version", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("error_details", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_processing_runs"),
    )
    op.create_index("ix_processing_runs_document_id", "processing_runs", ["document_id"])

    op.create_table(
        "processing_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("processing_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stage", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("metadata_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["processing_run_id"], ["processing_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_processing_events"),
    )
    op.create_index("ix_processing_events_document_id", "processing_events", ["document_id"])
    op.create_index(
        "ix_processing_events_processing_run_id", "processing_events", ["processing_run_id"]
    )

    op.create_table(
        "document_pages",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("processing_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=False),
        sa.Column("parser_route", sa.String(length=80), nullable=False),
        sa.Column("text_quality_score", sa.Float(), nullable=True),
        sa.Column("warnings_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["processing_run_id"], ["processing_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_document_pages"),
    )
    op.create_index("ix_document_pages_document_id", "document_pages", ["document_id"])
    op.create_index("ix_document_pages_processing_run_id", "document_pages", ["processing_run_id"])

    op.create_table(
        "document_artifacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("processing_run_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("artifact_type", sa.String(length=80), nullable=False),
        sa.Column("uri", sa.String(length=1024), nullable=False),
        sa.Column("media_type", sa.String(length=120), nullable=False),
        sa.Column("metadata_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["processing_run_id"], ["processing_runs.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name="pk_document_artifacts"),
    )
    op.create_index("ix_document_artifacts_document_id", "document_artifacts", ["document_id"])
    op.create_index(
        "ix_document_artifacts_processing_run_id", "document_artifacts", ["processing_run_id"]
    )

    op.create_table(
        "document_elements",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("processing_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("element_id", sa.String(length=120), nullable=False),
        sa.Column("element_type", sa.String(length=32), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("text", sa.Text(), nullable=True),
        sa.Column("markdown", sa.Text(), nullable=True),
        sa.Column("source_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["processing_run_id"], ["processing_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_document_elements"),
    )
    op.create_index("ix_document_elements_document_id", "document_elements", ["document_id"])
    op.create_index("ix_document_elements_element_id", "document_elements", ["element_id"])
    op.create_index(
        "ix_document_elements_processing_run_id", "document_elements", ["processing_run_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_document_elements_processing_run_id", table_name="document_elements")
    op.drop_index("ix_document_elements_element_id", table_name="document_elements")
    op.drop_index("ix_document_elements_document_id", table_name="document_elements")
    op.drop_table("document_elements")
    op.drop_index("ix_document_artifacts_processing_run_id", table_name="document_artifacts")
    op.drop_index("ix_document_artifacts_document_id", table_name="document_artifacts")
    op.drop_table("document_artifacts")
    op.drop_index("ix_document_pages_processing_run_id", table_name="document_pages")
    op.drop_index("ix_document_pages_document_id", table_name="document_pages")
    op.drop_table("document_pages")
    op.drop_index("ix_processing_events_processing_run_id", table_name="processing_events")
    op.drop_index("ix_processing_events_document_id", table_name="processing_events")
    op.drop_table("processing_events")
    op.drop_index("ix_processing_runs_document_id", table_name="processing_runs")
    op.drop_table("processing_runs")
    op.drop_index("ix_document_versions_document_id", table_name="document_versions")
    op.drop_table("document_versions")
