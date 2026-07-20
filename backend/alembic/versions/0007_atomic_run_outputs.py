"""Make workflow outputs run-idempotent.

Revision ID: 0007
Revises: 0006
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0007"
down_revision: str | None = "0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("messages") as batch:
        batch.add_column(sa.Column("workflow_run_id", sa.String(length=36), nullable=True))
        batch.create_foreign_key(
            "fk_messages_workflow_run_id",
            "workflow_runs",
            ["workflow_run_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch.create_index("ix_messages_workflow_run_id", ["workflow_run_id"])
        batch.create_unique_constraint(
            "uq_message_run_role", ["workflow_run_id", "role"]
        )

    with op.batch_alter_table("artifacts") as batch:
        batch.add_column(
            sa.Column("generated_by_run_id", sa.String(length=36), nullable=True)
        )
        batch.create_foreign_key(
            "fk_artifacts_generated_by_run_id",
            "workflow_runs",
            ["generated_by_run_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch.create_index("ix_artifacts_generated_by_run_id", ["generated_by_run_id"])
        batch.create_unique_constraint(
            "uq_artifact_run_type", ["generated_by_run_id", "artifact_type"]
        )


def downgrade() -> None:
    with op.batch_alter_table("artifacts") as batch:
        batch.drop_constraint("uq_artifact_run_type", type_="unique")
        batch.drop_index("ix_artifacts_generated_by_run_id")
        batch.drop_constraint("fk_artifacts_generated_by_run_id", type_="foreignkey")
        batch.drop_column("generated_by_run_id")

    with op.batch_alter_table("messages") as batch:
        batch.drop_constraint("uq_message_run_role", type_="unique")
        batch.drop_index("ix_messages_workflow_run_id")
        batch.drop_constraint("fk_messages_workflow_run_id", type_="foreignkey")
        batch.drop_column("workflow_run_id")
