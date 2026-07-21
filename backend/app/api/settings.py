from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_provider_configuration_service
from app.config import get_settings
from app.llm.registry import ProviderRegistry
from app.schemas.settings import (
    ProviderConnectionTest,
    ProviderHealth,
    ProviderSettingsRead,
    ProviderSettingsUpdate,
)
from app.services.provider_settings import ProviderConfigurationService

router = APIRouter(prefix="/settings", tags=["settings"])
Service = Annotated[ProviderConfigurationService, Depends(get_provider_configuration_service)]


@router.get("/provider", response_model=ProviderSettingsRead)
def get_provider_settings(service: Service) -> ProviderSettingsRead:
    return service.get()


@router.put("/provider", response_model=ProviderSettingsRead)
def update_provider_settings(
    payload: ProviderSettingsUpdate, service: Service
) -> ProviderSettingsRead:
    return service.update(payload)


@router.post("/provider/test", response_model=ProviderHealth)
async def test_provider(payload: ProviderConnectionTest, service: Service) -> dict[str, object]:
    provider = ProviderRegistry(get_settings()).get(
        payload.provider,
        base_url=payload.base_url,
        model=payload.model,
        api_key=service.api_key_for(payload),
        timeout=payload.request_timeout,
        temperature=payload.temperature,
        structured_output=payload.structured_output,
    )
    return await provider.health_check()
