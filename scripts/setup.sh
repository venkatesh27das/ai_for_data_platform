#!/usr/bin/env bash

set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require_command uv "Install it from https://docs.astral.sh/uv/getting-started/installation/."
require_command npm "Install Node.js 20 or newer from https://nodejs.org/."

if [[ ! -f "$REPO_ROOT/.env" ]]; then
  cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env"
  echo "Created .env from .env.example."
fi

mkdir -p "$REPO_ROOT/backend/data" "$UV_CACHE_DIR"

echo "Installing locked Python dependencies..."
(cd "$REPO_ROOT/backend" && uv sync --extra dev --frozen)

echo "Installing locked frontend dependencies..."
(cd "$REPO_ROOT/frontend" && npm ci)

echo "Applying database migrations..."
(cd "$REPO_ROOT/backend" && uv run alembic upgrade head)

echo
echo "Setup complete. Start the app with: make dev"
