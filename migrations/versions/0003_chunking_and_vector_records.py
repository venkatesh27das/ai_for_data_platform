"""add chunking and vector index records

Revision ID: 0003_chunking_and_vector_records
Revises: 0002_processing_and_canonical_assets
Create Date: 2026-06-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003_chunking_and_vector_records"
down_revision: str | None = "0002_processing_and_canonical_assets"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "chunks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("processing_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chunk_id", sa.String(length=120), nullable=False),
        sa.Column("chunk_type", sa.String(length=32), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("markdown", sa.Text(), nullable=True),
        sa.Column("section_path_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("page_numbers_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "source_element_ids_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
        sa.Column("quality_score", sa.Float(), nullable=True),
        sa.Column("metadata_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["processing_run_id"], ["processing_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_chunks"),
    )
    op.create_index("ix_chunks_chunk_id", "chunks", ["chunk_id"])
    op.create_index("ix_chunks_document_id", "chunks", ["document_id"])
    op.create_index("ix_chunks_processing_run_id", "chunks", ["processing_run_id"])

    op.create_table(
        "chunk_projection_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("processing_run_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("chunk_count", sa.Integer(), nullable=False),
        sa.Column("embedded_count", sa.Integer(), nullable=False),
        sa.Column("error_details", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["processing_run_id"], ["processing_runs.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name="pk_chunk_projection_runs"),
    )
    op.create_index(
        "ix_chunk_projection_runs_document_id", "chunk_projection_runs", ["document_id"]
    )
    op.create_index(
        "ix_chunk_projection_runs_processing_run_id",
        "chunk_projection_runs",
        ["processing_run_id"],
    )

    op.create_table(
        "vector_index_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chunk_db_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("projection_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("collection_name", sa.String(length=120), nullable=False),
        sa.Column("point_id", sa.String(length=120), nullable=False),
        sa.Column("embedding_model", sa.String(length=256), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("payload_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("error_details", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["chunk_db_id"], ["chunks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["projection_run_id"], ["chunk_projection_runs.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_vector_index_records"),
    )
    op.create_index("ix_vector_index_records_chunk_db_id", "vector_index_records", ["chunk_db_id"])
    op.create_index("ix_vector_index_records_document_id", "vector_index_records", ["document_id"])
    op.create_index("ix_vector_index_records_point_id", "vector_index_records", ["point_id"])
    op.create_index(
        "ix_vector_index_records_projection_run_id",
        "vector_index_records",
        ["projection_run_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_vector_index_records_projection_run_id", table_name="vector_index_records")
    op.drop_index("ix_vector_index_records_point_id", table_name="vector_index_records")
    op.drop_index("ix_vector_index_records_document_id", table_name="vector_index_records")
    op.drop_index("ix_vector_index_records_chunk_db_id", table_name="vector_index_records")
    op.drop_table("vector_index_records")
    op.drop_index("ix_chunk_projection_runs_processing_run_id", table_name="chunk_projection_runs")
    op.drop_index("ix_chunk_projection_runs_document_id", table_name="chunk_projection_runs")
    op.drop_table("chunk_projection_runs")
    op.drop_index("ix_chunks_processing_run_id", table_name="chunks")
    op.drop_index("ix_chunks_document_id", table_name="chunks")
    op.drop_index("ix_chunks_chunk_id", table_name="chunks")
    op.drop_table("chunks")
