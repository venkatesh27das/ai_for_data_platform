from docintel.config import Settings


def test_max_upload_bytes_uses_mebibytes() -> None:
    settings = Settings(max_upload_mb=2)

    assert settings.max_upload_bytes == 2 * 1024 * 1024


def test_processing_mode_defaults_to_sync() -> None:
    assert Settings().processing_mode == "sync"
