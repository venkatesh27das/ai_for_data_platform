#!/usr/bin/env bash

set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require_command uv "Run ./scripts/setup.sh first."
[[ -x "$REPO_ROOT/frontend/node_modules/.bin/vite" ]] || {
  echo "Frontend dependencies are missing. Run ./scripts/setup.sh first." >&2
  exit 1
}

mkdir -p "$RUN_DIR"
if pid_is_running "$RUN_DIR/backend.pid" || pid_is_running "$RUN_DIR/frontend.pid"; then
  echo "The local app is already running. Use ./scripts/status.sh for details." >&2
  exit 1
fi

(cd "$REPO_ROOT/backend" && exec uv run alembic upgrade head)

(
  cd "$REPO_ROOT/backend"
  exec uv run uvicorn app.main:app --host "$BACKEND_HOST" --port "$BACKEND_PORT"
) >"$RUN_DIR/backend.log" 2>&1 &
echo "$!" >"$RUN_DIR/backend.pid"

(
  cd "$REPO_ROOT/frontend"
  exec ./node_modules/.bin/vite --host "$FRONTEND_HOST" --port "$FRONTEND_PORT" --strictPort
) >"$RUN_DIR/frontend.log" 2>&1 &
echo "$!" >"$RUN_DIR/frontend.pid"

sleep 2
if ! pid_is_running "$RUN_DIR/backend.pid" || ! pid_is_running "$RUN_DIR/frontend.pid"; then
  echo "A service failed to start. Recent logs:" >&2
  tail -n 30 "$RUN_DIR/backend.log" "$RUN_DIR/frontend.log" >&2 || true
  "$SCRIPT_DIR/stop.sh" >/dev/null 2>&1 || true
  exit 1
fi

echo "AI Data Modelling Assistant is running."
echo "Frontend: http://$FRONTEND_HOST:$FRONTEND_PORT"
echo "API docs: http://$BACKEND_HOST:$BACKEND_PORT/docs"
echo "Logs:     $RUN_DIR"
echo "Stop:     make stop"
