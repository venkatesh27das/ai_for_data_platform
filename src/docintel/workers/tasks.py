from docintel.workers.celery_app import celery_app


@celery_app.task(name="docintel.ping")  # type: ignore[untyped-decorator]
def ping() -> str:
    """Return a simple worker health value."""

    return "pong"
