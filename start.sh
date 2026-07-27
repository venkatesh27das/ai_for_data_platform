#!/usr/bin/env bash

set -Eeuo pipefail

APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_HOST_VALUE="${EKAS_HOST:-127.0.0.1}"
APP_PORT_VALUE="${EKAS_PORT:-4173}"

info() {
  printf '[Enterprise Knowledge Assembly Studio] %s\n' "$1"
}

fail() {
  printf '[Enterprise Knowledge Assembly Studio] Error: %s\n' "$1" >&2
  exit 1
}

command -v node >/dev/null 2>&1 ||
  fail "Node.js is required. Install Node.js 22 LTS from https://nodejs.org and run this script again."

command -v npm >/dev/null 2>&1 ||
  fail "npm is required. Install Node.js 22 LTS from https://nodejs.org and run this script again."

node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  process.exit(major > 20 || (major === 20 && minor >= 19) ? 0 : 1);
' ||
  fail "Node.js 20.19 or newer is required. Node.js 22 LTS is recommended."

case "$APP_PORT_VALUE" in
  ""|*[!0-9]*) fail "EKAS_PORT must be a number between 1 and 65535." ;;
esac

if (( APP_PORT_VALUE < 1 || APP_PORT_VALUE > 65535 )); then
  fail "EKAS_PORT must be a number between 1 and 65535."
fi

cd "$APP_ROOT"

if [[ ! -f .env ]]; then
  info "Creating local configuration from .env.example"
  cp .env.example .env
fi

if [[ ! -d node_modules ]] || ! npm ls --depth=0 --silent >/dev/null 2>&1; then
  info "Installing dependencies from package-lock.json"
  npm ci --no-audit --no-fund
else
  info "Dependencies are ready"
fi

info "Starting at http://${APP_HOST_VALUE}:${APP_PORT_VALUE}"
info "Press Ctrl+C to stop"

exec npm start -- --host "$APP_HOST_VALUE" --port "$APP_PORT_VALUE" --strictPort
