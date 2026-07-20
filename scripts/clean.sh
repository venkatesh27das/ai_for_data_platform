#!/usr/bin/env bash

set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

"$SCRIPT_DIR/stop.sh" >/dev/null 2>&1 || true

find "$REPO_ROOT/backend" -type d -name __pycache__ -prune -exec rm -rf {} +
rm -rf \
  "$REPO_ROOT/.pytest_cache" \
  "$REPO_ROOT/.cache" \
  "$REPO_ROOT/.run" \
  "$REPO_ROOT/backend/.mypy_cache" \
  "$REPO_ROOT/backend/.pytest_cache" \
  "$REPO_ROOT/backend/.ruff_cache" \
  "$REPO_ROOT/frontend/dist" \
  "$REPO_ROOT/frontend/.vite"

echo "Removed generated caches, logs, PIDs, and frontend build output."
