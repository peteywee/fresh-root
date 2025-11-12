#!/usr/bin/env node
// [P2][APP][CODE] Prune Archives
// Tags: P2, APP, CODE
/**
 * [MEDIUM][INFRA][CLEANUP]
 * Tags: cleanup, vendor-management, quarantine
 * Prunes heavyweight duplicate/vendor artifacts from quarantined trees.
 * - ONLY touches known-safe paths under `_legacy/**` and `docs/archive/**`.
 * - Never touches `apps/**`, `packages/**`, `services/**`.
 * - Dry run by default; pass `--apply` to actually delete.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const DRY = !process.argv.includes("--apply");
const ROOT = process.cwd();

const TARGETS = [
  "_legacy/**/node_modules**",
  "_legacy/**/.pnpm/**",
  "docs/archive/**/node_modules**",
  "docs/archive/**/.pnpm/**",
  "_legacy/functions_duplicates/**/node_modules**",
  "_legacy/functions_duplicates/**/.pnpm/**",
];

function expand(glob) {
  // Use git to expand quickly and stay inside repo
  try {
    const out = execSync(`bash -lc 'ls -d ${glob} 2>/dev/null || true'`, {
      encoding: "utf8",
    });
    return out.split("\n").map(s => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

const candidates = TARGETS.flatMap(expand);
if (!candidates.length) {
  console.log("No vendor duplicates detected in quarantine paths.");
  process.exit(0);
}

let bytes = 0;
const toDelete = [];
for (const p of candidates) {
  try {
    const stat = fs.lstatSync(p);
    if (stat.isSymbolicLink()) continue;
    toDelete.push(p);
    // approximate size using du for directories
    const du = execSync(`du -sb "${p}" | awk '{print $1}'`, { encoding: "utf8" }).trim();
    bytes += Number(du || 0);
  } catch {/* ignore */}
}

const mb = (bytes / (1024 * 1024)).toFixed(1);
if (DRY) {
  console.log("DRY RUN — would delete:");
  toDelete.forEach(p => console.log(" -", p));
  console.log(`Total reclaimed (approx): ${mb} MiB`);
  console.log("Run with --apply to perform deletion.");
  process.exit(0);
}

for (const p of toDelete) {
  execSync(`rm -rf "${p}"`);
  console.log("deleted", p);
}
console.log(`Reclaimed ~${mb} MiB from quarantine vendor blobs.`);
