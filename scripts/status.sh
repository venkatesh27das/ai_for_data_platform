#!/usr/bin/env bash

set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

running=false
for service in backend frontend; do
  pid_file="$RUN_DIR/$service.pid"
  if pid_is_running "$pid_file"; then
    echo "$service is running (PID $(cat "$pid_file"))."
    running=true
  else
    echo "$service is stopped."
  fi
done

if [[ "$running" == true ]]; then
  echo "Frontend: http://$FRONTEND_HOST:$FRONTEND_PORT"
  echo "API docs: http://$BACKEND_HOST:$BACKEND_PORT/docs"
fi
