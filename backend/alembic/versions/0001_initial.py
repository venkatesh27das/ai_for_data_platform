"""Initial project, message and provider settings tables."""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("objective", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("workflow_stage", sa.String(64), nullable=False, server_default="new"),
        sa.Column("source_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("entity_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mapping_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("dq_rule_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("review_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "project_id",
            sa.String(36),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(24), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_messages_project_id", "messages", ["project_id"])
    op.create_table(
        "provider_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("provider", sa.String(64), nullable=False),
        sa.Column("base_url", sa.String(512), nullable=False),
        sa.Column("model", sa.String(256), nullable=False),
        sa.Column("api_key", sa.String(512), nullable=False, server_default=""),
        sa.Column("temperature", sa.Float(), nullable=False, server_default="0.2"),
        sa.Column("request_timeout", sa.Integer(), nullable=False, server_default="120"),
        sa.Column("structured_output", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("tool_calling", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("data_dir", sa.String(512), nullable=False, server_default="./data"),
        sa.Column("max_upload_mb", sa.Integer(), nullable=False, server_default="25"),
        sa.Column("log_level", sa.String(20), nullable=False, server_default="INFO"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("provider_settings")
    op.drop_index("ix_messages_project_id", table_name="messages")
    op.drop_table("messages")
    op.drop_table("projects")
