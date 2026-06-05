from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from docintel.config import Settings
from docintel.main import create_app


@pytest.fixture()
def test_settings(tmp_path) -> Settings:
    return Settings(
        app_env="test",
        database_url="sqlite+pysqlite:///:memory:",
        uploads_dir=tmp_path / "uploads",
        artifacts_dir=tmp_path / "artifacts",
    )


@pytest.fixture()
def client(test_settings: Settings) -> Iterator[TestClient]:
    with TestClient(create_app(test_settings)) as test_client:
        yield test_client
