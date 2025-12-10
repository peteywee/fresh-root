#!/bin/bash
# [P2][APP][CODE] Run Dev
# Tags: P2, APP, CODE
# Production-ready dev server launcher with memory management

# Set strict memory limits
export NODE_OPTIONS="--max-old-space-size=1536 --nouse-idle-notification"
export SWC_NUM_THREADS=2
export NEXT_TELEMETRY_DISABLED=1

# Kill any stale pnpm processes
pkill -f "pnpm.*dev" || true
sleep 1

# Start dev server
echo "Starting dev server with memory optimizations..."
echo "NODE_OPTIONS: $NODE_OPTIONS"
echo "SWC_NUM_THREADS: $SWC_NUM_THREADS"

pnpm --filter @apps/web dev
