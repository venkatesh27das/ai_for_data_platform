"""Add metadata to semantic memory entries.

Revision ID: 0009
Revises: 0008
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0009"
down_revision: str | None = "0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("memory_entries") as batch:
        batch.add_column(
            sa.Column("metadata", sa.JSON(), nullable=False, server_default="{}")
        )


def downgrade() -> None:
    with op.batch_alter_table("memory_entries") as batch:
        batch.drop_column("metadata")
