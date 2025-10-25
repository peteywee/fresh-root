# Firebase Studio / IDX workspace config for Fresh Schedules
# Provides Node 20, pnpm 10, optional emulator auto-detect, and VS Code extensions.
{ pkgs }:
{
  # Pin a stable channel; keep deterministic
  channel = "stable-24.11";

  packages = [
    pkgs.nodejs_20
    pkgs.pnpm_10
    pkgs.git
    pkgs.python3
    pkgs.pkg-config
    pkgs.openssl
    pkgs.cacert
    pkgs.jq
    pkgs.watchman
  ];

  # Environment variables for the workspace (non-secret defaults)
  env = {
    FRESH_WEB_PORT = "3000";
    FRESH_API_PORT = "3333";
    NEXT_PUBLIC_USE_EMULATORS = "true"; # default for Studio previews
    NODE_OPTIONS = "--max-old-space-size=4096";
  };

  # Optional: auto-start Firebase emulators if firebase.json is present.
  # Set detect=true when you want Studio to manage emulators.
  services.firebase.emulators = {
    detect = false;        # flip to true to auto-start when firebase.json found
    projectId = "fresh-schedules-dev";  # local-only hint; not used if detect=false
    services = [ "auth" "firestore" "storage" "functions" ];
  };

  # Recommended editor extensions (Open VSX)
  idx = {
    extensions = [
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
      "bradlc.vscode-tailwindcss"
      "ms-vscode.vscode-typescript-next"
      "streetsidesoftware.code-spell-checker"
    ];

    # Simple run-commands palette (visible in Studio “Run”)
    workspaceTasks = [
      {
        label = "Install (pnpm -w i)";
        command = "pnpm install --frozen-lockfile=false";
      }
      {
        label = "Dev: API (Express @ :3333)";
        command = "pnpm --filter @services/api dev";
      }
      {
        label = "Dev: Web (Next @ :3000)";
        command = "pnpm --filter @apps/web dev";
      }
      {
        label = "Emulators: start (manual)";
        command = "firebase emulators:start";
      }
    ];
  };
}
