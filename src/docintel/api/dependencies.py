from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from docintel.config import Settings
from docintel.db.session import session_scope


def get_settings() -> Settings:
    """Return application settings for dependency injection."""

    return Settings()


def get_db_session(settings: Annotated[Settings, Depends(get_settings)]) -> Iterator[Session]:
    """Yield a SQLAlchemy session dependency."""

    yield from session_scope(settings)
