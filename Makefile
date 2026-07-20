.PHONY: setup install dev start stop status backend frontend test lint migrate seed-example clean

export UV_CACHE_DIR ?= $(CURDIR)/.cache/uv

setup install:
	./scripts/setup.sh

dev:
	./scripts/dev.sh

start:
	./scripts/start.sh

stop:
	./scripts/stop.sh

status:
	./scripts/status.sh

backend:
	cd backend && uv run alembic upgrade head && uv run uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev -- --host 127.0.0.1

test:
	cd backend && uv run python -m pytest
	cd frontend && npm test -- --run

lint:
	cd backend && uv run ruff check . && uv run mypy app
	cd frontend && npm run lint && npm run build

migrate:
	cd backend && uv run alembic upgrade head

seed-example:
	cd backend && uv run python -m scripts.seed_example

clean:
	./scripts/clean.sh
