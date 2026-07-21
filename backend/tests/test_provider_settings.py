from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.config import Settings
from app.db.base import Base
from app.llm.registry import ProviderRegistry
from app.schemas.settings import ProviderConnectionTest, ProviderSettingsUpdate
from app.services.provider_settings import ProviderConfigurationService


def payload(**overrides: object) -> ProviderSettingsUpdate:
    values: dict[str, object] = {
        "provider": "custom",
        "base_url": "https://models.example.test/v1",
        "model": "example-chat",
        "api_key": "secret-one",
        "temperature": 0.4,
        "request_timeout": 75,
        "structured_output": True,
        "tool_calling": True,
        "data_dir": "./data",
        "max_upload_mb": 25,
        "log_level": "INFO",
    }
    values.update(overrides)
    return ProviderSettingsUpdate.model_validate(values)


def test_provider_secret_is_reused_only_for_the_same_endpoint() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        service = ProviderConfigurationService(db, Settings())
        service.update(payload())

        same_endpoint = payload(api_key=None, model="another-chat")
        assert service.api_key_for(same_endpoint) == "secret-one"

        different_endpoint = payload(
            api_key=None,
            base_url="https://other.example.test/v1",
        )
        assert service.api_key_for(different_endpoint) == ""
        updated = service.update(different_endpoint)
        assert updated.api_key_configured is False


def test_registry_uses_saved_request_tuning_for_compatible_provider() -> None:
    provider = ProviderRegistry(Settings()).get(
        "custom",
        base_url="https://models.example.test/v1",
        model="example-chat",
        api_key="secret",
        timeout=75,
        temperature=0.4,
        structured_output=False,
    )

    assert provider.timeout == 75
    assert provider.temperature == 0.4
    assert provider.structured_output is False


def test_connection_test_can_discover_models_before_one_is_selected() -> None:
    values = payload().model_dump()
    values["model"] = ""

    request = ProviderConnectionTest.model_validate(values)

    assert request.model == ""
