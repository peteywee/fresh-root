#!/bin/bash
# [P2][APP][CODE] Cleanup Memory
# Tags: P2, APP, CODE
# Memory cleanup and safeguard script
# Clears caches, kills heavy processes, and optimizes for low-memory environments

set -e

echo "🧹 Starting memory cleanup..."

# Kill heavy VSCode language servers (they'll restart when needed)
echo "  → Killing heavy language servers..."
pkill -f "tsserver.js" 2>/dev/null || true
pkill -f "tailwindServer.js" 2>/dev/null || true
pkill -f "eslintServer.js" 2>/dev/null || true
sleep 1

# Clear Node.js build caches
echo "  → Clearing build caches..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next/cache 2>/dev/null || true
rm -rf apps/web/.next/cache 2>/dev/null || true
rm -rf .turbo/cache 2>/dev/null || true
rm -rf apps/web/.turbo 2>/dev/null || true

# Clear pnpm cache
echo "  → Pruning pnpm store..."
pnpm store prune 2>/dev/null || true

# Clear temp files
echo "  → Clearing temp files..."
rm -rf /tmp/vscode-typescript* 2>/dev/null || true
rm -rf /tmp/eslint* 2>/dev/null || true
rm -rf /tmp/ts-node-* 2>/dev/null || true

# Trigger system cache drop (requires sudo, optional)
if [ "$EUID" -eq 0 ]; then
  echo "  → Dropping system caches (running as root)..."
  sync
  echo 3 > /proc/sys/vm/drop_caches
else
  echo "  → Skipping system cache drop (requires sudo)"
fi

# Show current memory status
echo ""
echo "📊 Current memory status:"
free -h
echo ""

# Check swap
if swapon --show | grep -q swap; then
  echo "✅ Swap is enabled"
  swapon --show
else
  echo "⚠️  No swap detected - consider enabling swap for stability"
  echo "   Quick fix: sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
fi

echo ""
echo "✅ Memory cleanup complete!"
echo ""
echo "Top memory consumers:"
ps aux --sort=-%mem | head -6

echo ""
echo "💡 Tips:"
echo "  • Run 'pnpm pulse' to monitor system in real-time"
echo "  • Use 'bash scripts/safeguard-oom.sh &' for background protection"
echo "  • Set NODE_OPTIONS='--max-old-space-size=1536' to limit Node.js heap"
