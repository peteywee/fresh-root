#!/usr/bin/env bash
# [P2][APP][CODE] Run Firecrawl Mcp
# Tags: P2, APP, CODE
set -euo pipefail

if [[ -z "${FIRECRAWL_API_KEY:-}" ]]; then
  echo "FIRECRAWL_API_KEY is not set. Export it before running." >&2
  exit 1
fi

npx -y firecrawl-mcp
