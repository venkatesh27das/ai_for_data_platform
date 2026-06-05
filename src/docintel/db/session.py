from collections.abc import Iterator

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from docintel.config import Settings


def create_db_engine(settings: Settings) -> Engine:
    """Create a SQLAlchemy engine from application settings."""

    if settings.database_url.startswith("sqlite"):
        return create_engine(
            settings.database_url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
    return create_engine(settings.database_url, pool_pre_ping=True)


def create_session_factory(settings: Settings) -> sessionmaker[Session]:
    """Create a configured SQLAlchemy session factory."""

    return sessionmaker(bind=create_db_engine(settings), autoflush=False, expire_on_commit=False)


def session_scope(settings: Settings) -> Iterator[Session]:
    """Yield a database session and ensure it is closed."""

    session_factory = create_session_factory(settings)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
