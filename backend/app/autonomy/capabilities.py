from pathlib import Path

from app.autonomy.contracts import SkillManifest


class CapabilityRegistry:
    def __init__(self, manifests: list[SkillManifest] | None = None) -> None:
        self._skills = {skill.id: skill for skill in manifests or load_manifests()}

    def all(self) -> list[SkillManifest]:
        return list(self._skills.values())

    def get(self, skill_id: str) -> SkillManifest:
        try:
            return self._skills[skill_id]
        except KeyError as exc:
            raise ValueError(f"Unknown skill: {skill_id}") from exc

    def for_agent(self, agent_id: str) -> list[SkillManifest]:
        return [skill for skill in self._skills.values() if skill.agent_id == agent_id]

    def allowed_tools(self, skill_id: str) -> set[str]:
        return set(self.get(skill_id).allowed_tools)


def load_manifests() -> list[SkillManifest]:
    directory = Path(__file__).with_name("skills")
    manifests = [
        SkillManifest.model_validate_json(path.read_text(encoding="utf-8"))
        for path in sorted(directory.glob("*.json"))
    ]
    identifiers = [manifest.id for manifest in manifests]
    if len(identifiers) != len(set(identifiers)):
        raise RuntimeError("Skill manifest identifiers must be unique")
    return manifests
