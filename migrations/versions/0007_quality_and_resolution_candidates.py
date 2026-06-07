"""add quality scores and entity resolution candidates

Revision ID: 0007_quality_and_resolution_candidates
Revises: 0006_domain_profiles_and_ontology
Create Date: 2026-06-07
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0007_quality_and_resolution_candidates"
down_revision: str | None = "0006_domain_profiles_and_ontology"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _jsonb() -> postgresql.JSONB:
    return postgresql.JSONB(astext_type=sa.Text())


def upgrade() -> None:
    op.create_table(
        "quality_scores",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("processing_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("metric_name", sa.String(length=120), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("threshold", sa.Float()),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("details_json", _jsonb(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["processing_run_id"], ["processing_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_quality_scores"),
    )
    op.create_index("ix_quality_scores_document_id", "quality_scores", ["document_id"])
    op.create_index(
        "ix_quality_scores_processing_run_id",
        "quality_scores",
        ["processing_run_id"],
    )
    op.create_index("ix_quality_scores_metric_name", "quality_scores", ["metric_name"])

    op.create_table(
        "entity_resolution_candidates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("candidate_entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("resolution_method", sa.String(length=80), nullable=False),
        sa.Column("similarity_score", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("details_json", _jsonb(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["entity_id"], ["entities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["candidate_entity_id"], ["entities.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_entity_resolution_candidates"),
        sa.UniqueConstraint(
            "entity_id",
            "candidate_entity_id",
            "resolution_method",
            name="uq_entity_resolution_candidate_method",
        ),
    )
    op.create_index(
        "ix_entity_resolution_candidates_entity_id",
        "entity_resolution_candidates",
        ["entity_id"],
    )
    op.create_index(
        "ix_entity_resolution_candidates_candidate_entity_id",
        "entity_resolution_candidates",
        ["candidate_entity_id"],
    )


def downgrade() -> None:
    op.drop_table("entity_resolution_candidates")
    op.drop_table("quality_scores")
