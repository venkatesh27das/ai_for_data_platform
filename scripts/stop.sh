#!/usr/bin/env bash

set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

stopped=false
for service in frontend backend; do
  pid_file="$RUN_DIR/$service.pid"
  remove_pid_file=true
  if pid_is_running "$pid_file"; then
    pid="$(cat "$pid_file")"
    command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"
    if [[ "$command_line" == *vite* || "$command_line" == *uvicorn* || "$command_line" == *"$REPO_ROOT"* ]]; then
      kill "$pid"
      stopped=true
      echo "Stopped $service (PID $pid)."
    else
      echo "Refusing to stop reused PID $pid for $service: $command_line" >&2
      remove_pid_file=false
    fi
  fi
  if [[ "$remove_pid_file" == true ]]; then
    rm -f "$pid_file"
  fi
done

if [[ "$stopped" == false ]]; then
  echo "No managed local services are running."
fi
