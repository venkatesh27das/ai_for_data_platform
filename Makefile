.PHONY: bootstrap services-up services-down services-logs install migrate api worker ui-install ui-dev ui-build test test-unit test-integration lint format typecheck smoke-test clean

export UV_CACHE_DIR ?= .uv-cache
export PYTHONPATH ?= src

bootstrap:
	./scripts/bootstrap.sh

services-up:
	docker compose up -d

services-down:
	docker compose down

services-logs:
	docker compose logs -f

install:
	uv sync --extra dev

migrate:
	uv run alembic upgrade head

api:
	uv run uvicorn docintel.main:create_app --factory --host $${APP_HOST:-0.0.0.0} --port $${APP_PORT:-8000}

worker:
	uv run celery -A docintel.workers.celery_app:celery_app worker --loglevel=$${LOG_LEVEL:-INFO}

ui-install:
	cd ui && npm install

ui-dev:
	cd ui && npm run dev

ui-build:
	cd ui && npm run build

test:
	uv run pytest

test-unit:
	uv run pytest tests/unit

test-integration:
	uv run pytest tests/integration -m integration

lint:
	uv run ruff check .

format:
	uv run ruff format .

typecheck:
	uv run mypy

smoke-test:
	./scripts/smoke_test.sh

clean:
	rm -rf .uv-cache .ruff_cache .pytest_cache .mypy_cache **/__pycache__
