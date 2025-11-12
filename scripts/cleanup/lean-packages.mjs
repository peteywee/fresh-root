#!/usr/bin/env node
/**
 * [MEDIUM][INFRA][AUDIT]
 * Tags: audit, dependencies, monorepo-health
 * Surfaces unused deps and orphan workspaces using pnpm + knip, without mutating.
 * Requires: pnpm; optionally uses knip via dlx.
 */
import { execSync } from "node:child_process";

const sh = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });

console.log("→ Audit: workspace health");
sh("pnpm -v");

console.log("\n→ List workspaces");
sh("pnpm -w -r list --depth -1");

console.log("\n→ Audit: prod-only vulnerabilities");
sh("pnpm audit --prod --json || true");

console.log("\n→ Detect unused deps (knip)");
sh("pnpm dlx knip --exclude 'docs/**' --exclude '_legacy/**' --exclude 'tests/**' || true");

console.log("\n→ Detect circular deps (madge)");
sh("pnpm dlx madge --circular --extensions ts,tsx apps packages services || true");

console.log("\nDone (non-destructive).");
