.PHONY: install dev backend frontend test lint migrate seed-example

UV_CACHE_DIR ?= /tmp/uv-ai-data-model-cache

install:
	cd backend && uv sync --extra dev
	cd frontend && npm install

dev:
	@echo "Run 'make backend' and 'make frontend' in separate terminals."

backend:
	cd backend && uv run alembic upgrade head && uv run uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

test:
	cd backend && uv run pytest
	cd frontend && npm test -- --run

lint:
	cd backend && uv run ruff check . && uv run mypy app
	cd frontend && npm run lint && npm run build

migrate:
	cd backend && uv run alembic upgrade head

seed-example:
	cd backend && UV_CACHE_DIR=$(UV_CACHE_DIR) uv run python -m scripts.seed_example
