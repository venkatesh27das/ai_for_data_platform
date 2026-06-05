#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "warning: this project targets macOS first; continuing on $(uname -s)"
fi

command -v uv >/dev/null 2>&1 || {
  echo "uv is required. Install with: brew install uv"
  exit 1
}

command -v docker >/dev/null 2>&1 || {
  echo "Docker Desktop is required and docker must be on PATH."
  exit 1
}

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "created .env from .env.example"
else
  echo ".env already exists; leaving it unchanged"
fi

docker compose up -d
uv sync --extra dev
uv run alembic upgrade head

cat <<'EOF'

Bootstrap complete.

Start the API:
  make api

Start the worker:
  make worker

LM Studio runs outside Docker. Start it manually and load the configured local models before later model-backed phases.
EOF
