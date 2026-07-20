#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RUN_DIR="$REPO_ROOT/.run"
export UV_CACHE_DIR="${UV_CACHE_DIR:-$REPO_ROOT/.cache/uv}"

dotenv_value() {
  local key="$1"
  local fallback="$2"
  local file="$REPO_ROOT/.env"
  local value=""
  if [[ -f "$file" ]]; then
    value="$(awk -F= -v key="$key" '$1 == key {sub(/^[^=]*=/, ""); print; exit}' "$file")"
  fi
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  printf '%s' "${value:-$fallback}"
}

BACKEND_HOST="${APP_HOST:-$(dotenv_value APP_HOST 127.0.0.1)}"
BACKEND_PORT="${APP_PORT:-$(dotenv_value APP_PORT 8000)}"
FRONTEND_HOST="${FRONTEND_HOST:-$(dotenv_value FRONTEND_HOST 127.0.0.1)}"
FRONTEND_PORT="${FRONTEND_PORT:-$(dotenv_value FRONTEND_PORT 5173)}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command '$1' was not found. $2" >&2
    exit 1
  fi
}

pid_is_running() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}
