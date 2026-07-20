from sqlalchemy.orm import Session

from app.config import Settings
from app.db.models import ProviderSettings
from app.schemas.settings import ProviderSettingsRead, ProviderSettingsUpdate


class ProviderConfigurationService:
    def __init__(self, db: Session, env: Settings) -> None:
        self.db = db
        self.env = env

    def get_model(self) -> ProviderSettings:
        model = self.db.get(ProviderSettings, 1)
        if model is None:
            model = ProviderSettings(
                id=1,
                provider=self.env.llm_provider,
                base_url=self.env.lm_studio_base_url,
                model=self.env.lm_studio_model,
                api_key=self.env.lm_studio_api_key,
                temperature=self.env.llm_temperature,
                request_timeout=self.env.llm_request_timeout,
                data_dir=str(self.env.data_dir),
                max_upload_mb=self.env.max_upload_mb,
                log_level=self.env.log_level,
            )
            self.db.add(model)
            self.db.commit()
            self.db.refresh(model)
        return model

    def get(self) -> ProviderSettingsRead:
        model = self.get_model()
        return ProviderSettingsRead(
            provider=model.provider,
            base_url=model.base_url,
            model=model.model,
            api_key_configured=bool(model.api_key),
            temperature=model.temperature,
            request_timeout=model.request_timeout,
            structured_output=model.structured_output,
            tool_calling=model.tool_calling,
            data_dir=model.data_dir,
            max_upload_mb=model.max_upload_mb,
            log_level=model.log_level,
        )

    def update(self, payload: ProviderSettingsUpdate) -> ProviderSettingsRead:
        model = self.get_model()
        values = payload.model_dump(exclude={"api_key"})
        for key, value in values.items():
            setattr(model, key, value)
        if payload.api_key:
            model.api_key = payload.api_key
        self.db.commit()
        self.db.refresh(model)
        return self.get()
