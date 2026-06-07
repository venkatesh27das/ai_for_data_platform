from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy.orm import Session

from docintel.db.models import ExtractionProfile, ExtractionProfileProposal
from docintel.db.repositories.profiles import ProfileRepository
from docintel.domain.ontology import ExtractionProfileDefinition, OntologyDefinition


class ProfileNotFoundError(LookupError):
    """Requested profile, version, or proposal does not exist."""


class ProfileConflictError(ValueError):
    """Profile operation conflicts with its persisted review state."""


@dataclass(frozen=True)
class ProfileSummary:
    profile_key: str
    name: str
    description: str
    active_version: str | None
    versions: list[str]


class ExtractionProfileService:
    """Load, validate, review, and activate versioned extraction profiles."""

    def __init__(self, session: Session) -> None:
        self.repository = ProfileRepository(session)

    def synchronize_starters(self) -> list[ProfileSummary]:
        for definition in load_starter_profiles():
            self.repository.upsert_approved_profile(definition, source="starter", activate=True)
        self.repository.upsert_ontology(load_core_ontology(), activate=True)
        return self.list_profiles()

    def list_profiles(self) -> list[ProfileSummary]:
        summaries: list[ProfileSummary] = []
        for profile in self.repository.list_profiles():
            versions = list(self.repository.list_versions(profile.id))
            active = next(
                (
                    version.version
                    for version in versions
                    if version.id == profile.active_version_id
                ),
                None,
            )
            summaries.append(
                ProfileSummary(
                    profile_key=profile.profile_key,
                    name=profile.name,
                    description=profile.description,
                    active_version=active,
                    versions=[version.version for version in versions],
                )
            )
        return summaries

    def get_profile_definition(
        self, profile_key: str, version: str | None = None
    ) -> ExtractionProfileDefinition:
        profile = self._get_profile(profile_key)
        versions = list(self.repository.list_versions(profile.id))
        selected = (
            next((item for item in versions if item.version == version), None)
            if version is not None
            else next((item for item in versions if item.id == profile.active_version_id), None)
        )
        if selected is None:
            raise ProfileNotFoundError("profile version not found or no active version is set")
        return ExtractionProfileDefinition.model_validate(selected.definition_json)

    def submit_proposal(
        self,
        definition: ExtractionProfileDefinition,
        rationale: str,
        sample_evidence: list[dict[str, object]],
    ) -> ExtractionProfileProposal:
        if not sample_evidence:
            raise ProfileConflictError("draft proposals require sample evidence")
        return self.repository.create_proposal(definition, rationale, sample_evidence)

    def list_proposals(self) -> list[ExtractionProfileProposal]:
        return list(self.repository.list_proposals())

    def review_proposal(
        self,
        proposal_id: UUID,
        decision: str,
        reviewed_by: str,
        review_notes: str | None,
    ) -> ExtractionProfileProposal:
        if decision not in {"APPROVED", "REJECTED"}:
            raise ProfileConflictError("decision must be APPROVED or REJECTED")
        proposal = self.repository.get_proposal(proposal_id)
        if proposal is None:
            raise ProfileNotFoundError("proposal not found")
        try:
            reviewed = self.repository.resolve_proposal(
                proposal, decision, reviewed_by, review_notes
            )
        except ValueError as exc:
            raise ProfileConflictError(str(exc)) from exc
        if decision == "APPROVED":
            definition = ExtractionProfileDefinition.model_validate(reviewed.definition_json)
            self.repository.upsert_approved_profile(
                definition, source=f"proposal:{proposal.id}", activate=False
            )
        return reviewed

    def activate(self, profile_key: str, version: str) -> ProfileSummary:
        profile = self._get_profile(profile_key)
        selected = self.repository.get_version(profile.id, version)
        if selected is None:
            raise ProfileNotFoundError("profile version not found")
        try:
            self.repository.activate_version(profile, selected)
        except ValueError as exc:
            raise ProfileConflictError(str(exc)) from exc
        return next(item for item in self.list_profiles() if item.profile_key == profile_key)

    def _get_profile(self, profile_key: str) -> ExtractionProfile:
        profile = self.repository.get_profile(profile_key)
        if profile is None:
            raise ProfileNotFoundError("profile not found")
        return profile


def load_starter_profiles() -> list[ExtractionProfileDefinition]:
    """Read and validate bundled starter profiles."""

    profile_dir = Path(__file__).resolve().parents[2] / "profiles"
    definitions: list[ExtractionProfileDefinition] = []
    for path in sorted(profile_dir.glob("*_v1.json")):
        if path.name == "core_ontology_v1.json":
            continue
        try:
            definitions.append(
                ExtractionProfileDefinition.model_validate_json(path.read_text(encoding="utf-8"))
            )
        except ValidationError as exc:
            raise RuntimeError(f"invalid starter profile {path.name}: {exc}") from exc
    return definitions


def load_core_ontology() -> OntologyDefinition:
    """Read and validate the bundled core ontology."""

    path = Path(__file__).resolve().parents[2] / "profiles" / "core_ontology_v1.json"
    return OntologyDefinition.model_validate(json.loads(path.read_text(encoding="utf-8")))
