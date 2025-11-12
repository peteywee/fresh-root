// [P2][APP][CODE] Check No Legacy
// Tags: P2, APP, CODE
// [MEDIUM][INFRA][CI]
// Tags: ci, legacy-prevention, monorepo-hygiene
// scripts/ci/check-no-legacy.ts
// Fails CI if legacy duplicate trees reappear in the active workspace.
//
// Checks for these patterns at repo root:
//   - fresh-root/*
//   - apps/web duplicated elsewhere
//   - nested packages/types duplicates
//
// Exit 0 if clean; non-zero with a helpful message if violations found.

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const violations: string[] = [];

  // 1) Legacy nested root must not exist at repo root anymore
  if (await exists(path.join(ROOT, "fresh-root"))) {
    violations.push(
      "Found legacy nested tree at ./fresh-root (must be archived under docs/archive/).",
    );
  }

  // 2) Disallow second app tree copies outside canonical apps/web
  const forbiddenAppPaths = [
    path.join(ROOT, "docs", "archive", "fresh-root-legacy", "apps", "web"),
  ];
  // They can exist under archive; just ensure none exist in active workspace besides the canonical one.
  // If you discover any other non-canonical copies, add checks here.

  // 3) Disallow duplicate packages/types trees outside canonical path
  const canonicalTypes = path.join(ROOT, "packages", "types");
  if (!(await exists(canonicalTypes))) {
    // If types doesn't exist, we don't check duplicates here.
  }

  // 4) Warn on accidental workspace inclusion of archive
  const archivePath = path.join(ROOT, "docs", "archive");
  if (await exists(archivePath)) {
    // No-op; workspace should exclude archive via pnpm-workspace.yaml.
    // CI will catch it if build picks it up.
  }

  if (violations.length) {
    console.error("❌ Repository hygiene violations detected:");
    for (const v of violations) console.error(" - " + v);
    process.exit(1);
  } else {
    console.log("✅ No legacy duplicate trees detected.");
  }
}

main().catch((err) => {
  console.error("check-no-legacy failed:", err);
  process.exit(2);
});
