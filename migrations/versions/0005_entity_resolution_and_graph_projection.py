"""add entity resolution and graph projection records

Revision ID: 0005_entity_resolution_and_graph_projection
Revises: 0004_generic_extraction_records
Create Date: 2026-06-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0005_entity_resolution_and_graph_projection"
down_revision: str | None = "0004_generic_extraction_records"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("entities", sa.Column("canonical_entity_id", postgresql.UUID(as_uuid=True)))
    op.add_column(
        "entities",
        sa.Column(
            "resolution_status", sa.String(length=32), nullable=False, server_default="UNRESOLVED"
        ),
    )
    op.add_column("entities", sa.Column("resolution_method", sa.String(length=80)))
    op.create_index("ix_entities_canonical_entity_id", "entities", ["canonical_entity_id"])
    op.create_foreign_key(
        "fk_entities_canonical_entity_id_entities",
        "entities",
        "entities",
        ["canonical_entity_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "entity_aliases",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("alias", sa.Text(), nullable=False),
        sa.Column("normalized_alias", sa.String(length=512), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("source", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["entity_id"], ["entities.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_entity_aliases"),
    )
    op.create_index("ix_entity_aliases_entity_id", "entity_aliases", ["entity_id"])
    op.create_index("ix_entity_aliases_normalized_alias", "entity_aliases", ["normalized_alias"])

    op.create_table(
        "graph_projection_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("processing_run_id", postgresql.UUID(as_uuid=True)),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("node_count", sa.Integer(), nullable=False),
        sa.Column("edge_count", sa.Integer(), nullable=False),
        sa.Column("error_details", sa.Text()),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("ended_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["processing_run_id"], ["processing_runs.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name="pk_graph_projection_runs"),
    )
    op.create_index(
        "ix_graph_projection_runs_document_id", "graph_projection_runs", ["document_id"]
    )
    op.create_index(
        "ix_graph_projection_runs_processing_run_id",
        "graph_projection_runs",
        ["processing_run_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_graph_projection_runs_processing_run_id", table_name="graph_projection_runs")
    op.drop_index("ix_graph_projection_runs_document_id", table_name="graph_projection_runs")
    op.drop_table("graph_projection_runs")
    op.drop_index("ix_entity_aliases_normalized_alias", table_name="entity_aliases")
    op.drop_index("ix_entity_aliases_entity_id", table_name="entity_aliases")
    op.drop_table("entity_aliases")
    op.drop_constraint("fk_entities_canonical_entity_id_entities", "entities", type_="foreignkey")
    op.drop_index("ix_entities_canonical_entity_id", table_name="entities")
    op.drop_column("entities", "resolution_method")
    op.drop_column("entities", "resolution_status")
    op.drop_column("entities", "canonical_entity_id")
