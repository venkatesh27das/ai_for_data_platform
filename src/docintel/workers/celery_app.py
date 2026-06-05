from celery import Celery

from docintel.config import Settings

settings = Settings()

celery_app = Celery(
    "docintel",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["docintel.workers.tasks"],
)
celery_app.conf.update(task_track_started=True)
