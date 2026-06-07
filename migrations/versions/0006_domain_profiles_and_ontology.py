"""add domain profiles ontology and schema proposal review

Revision ID: 0006_domain_profiles_and_ontology
Revises: 0005_entity_resolution_and_graph_projection
Create Date: 2026-06-07
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0006_domain_profiles_and_ontology"
down_revision: str | None = "0005_entity_resolution_and_graph_projection"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _jsonb() -> postgresql.JSONB:
    return postgresql.JSONB(astext_type=sa.Text())


def upgrade() -> None:
    op.create_table(
        "extraction_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_key", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=256), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_extraction_profiles"),
        sa.UniqueConstraint("profile_key", name="uq_extraction_profiles_profile_key"),
    )
    op.create_index("ix_extraction_profiles_profile_key", "extraction_profiles", ["profile_key"])

    op.create_table(
        "extraction_profile_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("source", sa.String(length=80), nullable=False),
        sa.Column("definition_json", _jsonb(), nullable=False),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["extraction_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_extraction_profile_versions"),
        sa.UniqueConstraint(
            "profile_id", "version", name="uq_extraction_profile_versions_profile_version"
        ),
    )
    op.create_index(
        "ix_extraction_profile_versions_profile_id",
        "extraction_profile_versions",
        ["profile_id"],
    )
    op.add_column(
        "extraction_profiles",
        sa.Column("active_version_id", postgresql.UUID(as_uuid=True)),
    )
    op.create_index(
        "ix_extraction_profiles_active_version_id",
        "extraction_profiles",
        ["active_version_id"],
    )
    op.create_foreign_key(
        "fk_extraction_profiles_active_version_id",
        "extraction_profiles",
        "extraction_profile_versions",
        ["active_version_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "extraction_profile_proposals",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_key", sa.String(length=120), nullable=False),
        sa.Column("proposed_version", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("definition_json", _jsonb(), nullable=False),
        sa.Column("sample_evidence_json", _jsonb(), nullable=False),
        sa.Column("reviewed_by", sa.String(length=256)),
        sa.Column("review_notes", sa.Text()),
        sa.Column("reviewed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_extraction_profile_proposals"),
    )
    op.create_index(
        "ix_extraction_profile_proposals_profile_key",
        "extraction_profile_proposals",
        ["profile_key"],
    )

    op.create_table(
        "review_tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("task_type", sa.String(length=80), nullable=False),
        sa.Column("target_type", sa.String(length=80), nullable=False),
        sa.Column("target_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("payload_json", _jsonb(), nullable=False),
        sa.Column("resolution_notes", sa.Text()),
        sa.Column("resolved_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_review_tasks"),
    )
    op.create_index("ix_review_tasks_task_type", "review_tasks", ["task_type"])
    op.create_index("ix_review_tasks_target_id", "review_tasks", ["target_id"])

    op.create_table(
        "ontology_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ontology_key", sa.String(length=120), nullable=False),
        sa.Column("version", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=256), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("definition_json", _jsonb(), nullable=False),
        sa.Column("activated_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_ontology_versions"),
        sa.UniqueConstraint("ontology_key", "version", name="uq_ontology_versions_key_version"),
    )
    op.create_index("ix_ontology_versions_ontology_key", "ontology_versions", ["ontology_key"])

    op.create_table(
        "ontology_entity_types",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ontology_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("parent_type", sa.String(length=120)),
        sa.ForeignKeyConstraint(
            ["ontology_version_id"], ["ontology_versions.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_ontology_entity_types"),
    )
    op.create_index(
        "ix_ontology_entity_types_ontology_version_id",
        "ontology_entity_types",
        ["ontology_version_id"],
    )
    op.create_index("ix_ontology_entity_types_name", "ontology_entity_types", ["name"])

    op.create_table(
        "ontology_relationship_types",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ontology_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("source_types_json", _jsonb(), nullable=False),
        sa.Column("target_types_json", _jsonb(), nullable=False),
        sa.ForeignKeyConstraint(
            ["ontology_version_id"], ["ontology_versions.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_ontology_relationship_types"),
    )
    op.create_index(
        "ix_ontology_relationship_types_ontology_version_id",
        "ontology_relationship_types",
        ["ontology_version_id"],
    )
    op.create_index("ix_ontology_relationship_types_name", "ontology_relationship_types", ["name"])

    op.create_table(
        "ontology_aliases",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ontology_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("alias", sa.String(length=256), nullable=False),
        sa.Column("target_type", sa.String(length=120), nullable=False),
        sa.Column("target_kind", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(
            ["ontology_version_id"], ["ontology_versions.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_ontology_aliases"),
    )
    op.create_index(
        "ix_ontology_aliases_ontology_version_id",
        "ontology_aliases",
        ["ontology_version_id"],
    )
    op.create_index("ix_ontology_aliases_alias", "ontology_aliases", ["alias"])

    op.create_table(
        "ontology_mappings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ontology_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_type", sa.String(length=120), nullable=False),
        sa.Column("target_type", sa.String(length=120), nullable=False),
        sa.Column("mapping_kind", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(
            ["ontology_version_id"], ["ontology_versions.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["profile_version_id"], ["extraction_profile_versions.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_ontology_mappings"),
    )
    op.create_index(
        "ix_ontology_mappings_ontology_version_id",
        "ontology_mappings",
        ["ontology_version_id"],
    )
    op.create_index(
        "ix_ontology_mappings_profile_version_id",
        "ontology_mappings",
        ["profile_version_id"],
    )

    op.create_table(
        "extracted_tables",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("extraction_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("table_name", sa.String(length=120), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("validation_errors_json", _jsonb(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["extraction_run_id"], ["extraction_runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["profile_version_id"], ["extraction_profile_versions.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_extracted_tables"),
    )
    op.create_index("ix_extracted_tables_document_id", "extracted_tables", ["document_id"])
    op.create_index(
        "ix_extracted_tables_extraction_run_id",
        "extracted_tables",
        ["extraction_run_id"],
    )
    op.create_index(
        "ix_extracted_tables_profile_version_id",
        "extracted_tables",
        ["profile_version_id"],
    )
    op.create_index("ix_extracted_tables_table_name", "extracted_tables", ["table_name"])

    op.create_table(
        "extracted_table_rows",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("extracted_table_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("row_index", sa.Integer(), nullable=False),
        sa.Column("values_json", _jsonb(), nullable=False),
        sa.Column("source_evidence_json", _jsonb(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("review_status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["extracted_table_id"], ["extracted_tables.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_extracted_table_rows"),
    )
    op.create_index(
        "ix_extracted_table_rows_extracted_table_id",
        "extracted_table_rows",
        ["extracted_table_id"],
    )


def downgrade() -> None:
    op.drop_table("extracted_table_rows")
    op.drop_table("extracted_tables")
    op.drop_table("ontology_mappings")
    op.drop_table("ontology_aliases")
    op.drop_table("ontology_relationship_types")
    op.drop_table("ontology_entity_types")
    op.drop_table("ontology_versions")
    op.drop_table("review_tasks")
    op.drop_table("extraction_profile_proposals")
    op.drop_constraint(
        "fk_extraction_profiles_active_version_id",
        "extraction_profiles",
        type_="foreignkey",
    )
    op.drop_index("ix_extraction_profiles_active_version_id", table_name="extraction_profiles")
    op.drop_column("extraction_profiles", "active_version_id")
    op.drop_table("extraction_profile_versions")
    op.drop_table("extraction_profiles")
