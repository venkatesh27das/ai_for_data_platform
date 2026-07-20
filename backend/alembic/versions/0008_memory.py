"""Add project and opt-in cross-project memory.

Revision ID: 0008
Revises: 0007
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0008"
down_revision: str | None = "0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "project_memories",
        sa.Column("project_id", sa.String(length=36), primary_key=True),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("facts", sa.JSON(), nullable=False),
        sa.Column("decisions", sa.JSON(), nullable=False),
        sa.Column("assumptions", sa.JSON(), nullable=False),
        sa.Column("terminology", sa.JSON(), nullable=False),
        sa.Column("preferences", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
    )
    op.create_table(
        "memory_entries",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), nullable=True),
        sa.Column("scope", sa.String(length=24), nullable=False),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", sa.JSON(), nullable=False),
        sa.Column("source_run_id", sa.String(length=36), nullable=True),
        sa.Column("source_project_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["source_run_id"], ["workflow_runs.id"], ondelete="SET NULL"
        ),
    )
    op.create_index("ix_memory_entries_project_id", "memory_entries", ["project_id"])
    op.create_index("ix_memory_entries_scope", "memory_entries", ["scope"])
    op.create_index("ix_memory_entries_kind", "memory_entries", ["kind"])
    op.create_index("ix_memory_entries_source_run_id", "memory_entries", ["source_run_id"])
    op.create_table(
        "memory_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "cross_project_enabled", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("memory_settings")
    op.drop_table("memory_entries")
    op.drop_table("project_memories")
