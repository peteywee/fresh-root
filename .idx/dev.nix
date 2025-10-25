# Reproducible local dev shell for Fresh Schedules (Node 20, pnpm, Firebase tooling)
# Usage: nix develop
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # Core toolchain
  packages = with pkgs; [
    nodejs_20
    pnpm_10
    git
    python3     # node-gyp (some Firebase deps)
    pkg-config  # native modules
    openssl
    cacert
    curl
    jq
    watchman
  ];

  # Useful ports (align with your spec)
  FRESH_WEB_PORT = "3000";
  FRESH_API_PORT = "3333";
  FIREBASE_AUTH_EMULATOR_PORT = "9099";
  FIREBASE_FIRESTORE_EMULATOR_PORT = "8080";
  FIREBASE_FUNCTIONS_EMULATOR_PORT = "5001";
  FIREBASE_STORAGE_EMULATOR_PORT = "9199";

  # Default emulator toggle for dev shells (overridable)
  NEXT_PUBLIC_USE_EMULATORS = "true";

  # Keep Node resolutions stable for pnpm
  NODE_OPTIONS = "--max-old-space-size=4096";

  # Fail-fast hint: ensure .env.local exists for apps/web and services/api if running dev
  shellHook = ''
    echo "[dev.nix] Node: $(node -v)  pnpm: $(pnpm -v)"

    # Prefer pnpm via corepack if present; otherwise ensure pnpm is on PATH already
    if command -v corepack >/dev/null 2>&1; then
      corepack enable >/dev/null 2>&1 || true
    fi

    # Repo root sanity
    if [ -f pnpm-workspace.yaml ]; then
      echo "[dev.nix] pnpm workspace detected."
    else
      echo "[dev.nix] WARNING: pnpm-workspace.yaml not found at CWD."
    fi

    # Fast-fail env check (advisory): only warn, do not block shell
    check_env () {
      local file="$1"
      local missing=0
      if [ ! -f "$file" ]; then
        echo "[dev.nix] NOTE: $file not found (create it before running dev servers)."
        return
      fi
      while IFS= read -r key; do
        if [ -n "$key" ] && ! grep -q "^[[:space:]]*${key}=" "$file"; then
          echo "[dev.nix] MISSING in $file: $key"
          missing=1
        fi
      done <<EOF
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_USE_EMULATORS
EOF
      if [ $missing -eq 1 ]; then
        echo "[dev.nix] Some required client envs are missing (spec requires fail fast)."
      fi
    }

    # Advisory checks for web and api
    [ -d apps/web ] && check_env "./apps/web/.env.local"
    [ -d services/api ] && {
      if [ ! -f "./services/api/.env.local" ]; then
        echo "[dev.nix] NOTE: services/api/.env.local not found. Add FIREBASE_ADMIN_* and LEDGER_SALT as per spec."
      fi
    }

    echo "[dev.nix] To run:"
    echo "  pnpm install"
    echo "  pnpm dev:api  # http://localhost:$FRESH_API_PORT/health"
    echo "  pnpm dev:web  # http://localhost:$FRESH_WEB_PORT"
  '';
}
