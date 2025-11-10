#!/usr/bin/env bash
# [P1][TEST][TEST] Run Tests Safe tests
# Tags: P1, TEST, TEST
# Run workspace tests with conservative memory and thread settings to avoid OOM kills.
# Usage: ./scripts/run-tests-safe.sh [additional vitest args]

export NODE_OPTIONS="--max-old-space-size=4096"

# Run vitest across the workspace with threads disabled (using --no-threads), a single worker, and dot reporter by default.
pnpm -w vitest run --no-threads --maxWorkers=1 --reporter=dot "$@"
