#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

# Ensure .env exists
if [[ ! -f ".env" ]]; then
  if [[ -f ".env.example" ]]; then
    cp .env.example .env
    echo "[setup-mcp] Created .env from .env.example. Review and fill any placeholders."
  else
    cat > .env <<'EOF'
FILETAG_DEFAULT_EXCLUDES=node_modules,.git,dist,build,.next,.turbo,coverage,.cache
FILETAG_CACHE_TTL_SEC=300
FILETAG_MAX_FILES=5000
FILETAG_STATE_FILE=mcp/.filetag-state.json
EOF
    echo "[setup-mcp] Created minimal .env (no example present)."
  fi
else
  echo "[setup-mcp] .env already exists; leaving as-is."
fi

# Ensure directories
mkdir -p mcp .vscode

# Install deps at workspace root (pnpm workspace-aware)
if command -v pnpm >/dev/null 2>&1; then
  pnpm add -w @modelcontextprotocol/sdk zod
else
  echo "[setup-mcp] pnpm not found. Please install pnpm and re-run." >&2
  exit 1
fi

# Make server executable (optional)
chmod +x mcp/filetag-server.mjs || true

echo "[setup-mcp] Done. In VS Code, open .vscode/mcp.json and click Start. Use tools in Chat."
