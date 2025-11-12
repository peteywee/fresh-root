#!/usr/bin/env bash
set -euo pipefail

# Lean ESLint pass (skip legacy/vendor)
INCLUDE=(
  "apps/web/app/**/*.{ts,tsx}"
  "packages/types/src/**/*.ts"
  "packages/ui/src/**/*.tsx"
  "services/api/src/**/*.ts"
  "scripts/**/*.mjs"
)

# Build space-separated list
FILES=$(printf "%s " "${INCLUDE[@]}")

# Respect existing ignore files; rely on config, ignore legacy paths
npx eslint $FILES --max-warnings=0
