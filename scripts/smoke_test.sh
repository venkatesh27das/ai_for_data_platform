#!/usr/bin/env bash
set -euo pipefail

curl --fail --silent --show-error http://localhost:${APP_PORT:-8000}/health
echo
