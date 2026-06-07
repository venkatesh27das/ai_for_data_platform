from docintel.workers import tasks  # noqa: F401
from docintel.workers.celery_app import celery_app


def test_document_processing_tasks_are_registered() -> None:
    expected = {
        "docintel.parse_document",
        "docintel.project_vectors",
        "docintel.run_extraction",
        "docintel.project_graph",
        "docintel.finalize_processing",
    }

    assert expected <= set(celery_app.tasks)
