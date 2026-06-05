from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from docintel.api.dependencies import get_settings
from docintel.config import Settings
from docintel.db.base import Base
from docintel.db.session import create_db_engine
from docintel.main import create_app


@pytest.fixture()
def test_settings(tmp_path) -> Settings:
    return Settings(
        app_env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'test.db'}",
        uploads_dir=tmp_path / "uploads",
        artifacts_dir=tmp_path / "artifacts",
    )


@pytest.fixture()
def client(test_settings: Settings) -> Iterator[TestClient]:
    engine = create_db_engine(test_settings)
    Base.metadata.create_all(engine)
    app = create_app(test_settings)
    app.dependency_overrides[get_settings] = lambda: test_settings
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture()
def test_session(test_settings: Settings):
    import docintel.db.models  # noqa: F401

    engine = create_db_engine(test_settings)
    Base.metadata.create_all(engine)
    from sqlalchemy.orm import sessionmaker

    session_factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()
