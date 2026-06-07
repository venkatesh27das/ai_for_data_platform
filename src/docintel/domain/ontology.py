from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

FieldType = Literal[
    "string",
    "integer",
    "number",
    "boolean",
    "date",
    "datetime",
    "currency",
    "percentage",
    "identifier",
]


class ProfileFieldDefinition(BaseModel):
    """One typed field requested by an extraction profile."""

    name: str
    field_type: FieldType
    required: bool = False
    description: str
    validation_rules: dict[str, object] = Field(default_factory=dict)


class ProfileEntityDefinition(BaseModel):
    """Entity type expected by an extraction profile."""

    entity_type: str
    description: str
    required_attributes: list[str] = Field(default_factory=list)


class ProfileRelationshipDefinition(BaseModel):
    """Relationship type expected by an extraction profile."""

    relationship_type: str
    source_entity_types: list[str]
    target_entity_types: list[str]
    description: str
    minimum_confidence: float = Field(default=0.75, ge=0, le=1)


class TypedOutputTableDefinition(BaseModel):
    """Relational output proposed by a versioned extraction profile."""

    table_name: str
    description: str
    fields: list[ProfileFieldDefinition]

    @field_validator("table_name")
    @classmethod
    def validate_table_name(cls, value: str) -> str:
        if not re.fullmatch(r"[a-z][a-z0-9_]*", value):
            raise ValueError("table_name must be a lowercase SQL-safe identifier")
        return value


class ExtractionProfileDefinition(BaseModel):
    """Versioned, reviewable domain extraction profile."""

    profile_key: str
    version: str
    name: str
    description: str
    supported_document_classes: list[str]
    fields: list[ProfileFieldDefinition] = Field(default_factory=list)
    entities: list[ProfileEntityDefinition] = Field(default_factory=list)
    relationships: list[ProfileRelationshipDefinition] = Field(default_factory=list)
    typed_output_tables: list[TypedOutputTableDefinition] = Field(default_factory=list)
    validation_rules: dict[str, object] = Field(default_factory=dict)
    minimum_confidence: float = Field(default=0.70, ge=0, le=1)

    @field_validator("profile_key")
    @classmethod
    def validate_profile_key(cls, value: str) -> str:
        if not re.fullmatch(r"[a-z][a-z0-9_]*", value):
            raise ValueError("profile_key must be a lowercase identifier")
        return value

    @model_validator(mode="after")
    def validate_unique_names(self) -> ExtractionProfileDefinition:
        field_names = [field.name for field in self.fields]
        table_names = [table.table_name for table in self.typed_output_tables]
        if len(field_names) != len(set(field_names)):
            raise ValueError("profile field names must be unique")
        if len(table_names) != len(set(table_names)):
            raise ValueError("typed output table names must be unique")
        return self


class OntologyEntityTypeDefinition(BaseModel):
    """One entity type in a versioned ontology."""

    name: str
    description: str
    parent_type: str | None = None


class OntologyRelationshipTypeDefinition(BaseModel):
    """One relationship type in a versioned ontology."""

    name: str
    description: str
    source_types: list[str] = Field(default_factory=list)
    target_types: list[str] = Field(default_factory=list)


class OntologyAliasDefinition(BaseModel):
    """Alias mapped to an ontology type."""

    alias: str
    target_type: str
    target_kind: Literal["entity", "relationship"]


class OntologyDefinition(BaseModel):
    """Small universal ontology used by graph projections and profiles."""

    ontology_key: str
    version: str
    name: str
    description: str
    entity_types: list[OntologyEntityTypeDefinition]
    relationship_types: list[OntologyRelationshipTypeDefinition]
    aliases: list[OntologyAliasDefinition] = Field(default_factory=list)
