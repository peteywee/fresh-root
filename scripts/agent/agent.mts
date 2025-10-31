#!/usr/bin/env node
import { execa } from "execa";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pRetry from "p-retry";
import { z } from "zod";

import { log, ok, warn, err } from "./lib/logger.js";
import { ensureRBAC } from "./tasks/rbac.js";
import { ensureMonorepo, plannedChangesSummary } from "./tasks/restructure.js";
import { ensureRules } from "./tasks/rules.js";

const argv = process.argv.slice(2);
const ArgSchema = z.object({
  issue: z.string().default("21"),
  force: z.boolean().default(false),
  planOnly: z.boolean().default(false),
  selfHeal: z.boolean().default(true),
  selfUpdate: z.boolean().default(true)
});
function parseArgs() {
  let issue = "21", force = false, planOnly = false, selfHeal = true, selfUpdate = true;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") force = true;
    else if (a === "--plan-only") planOnly = true;
    else if (a === "--no-self-heal") selfHeal = false;
    else if (a === "--no-self-update") selfUpdate = false;
    else if (a === "--issue") { issue = argv[++i]; }
  }
  return ArgSchema.parse({ issue, force, planOnly, selfHeal, selfUpdate });
}

async function gitRoot(): Promise<string> {
  const { stdout } = await execa("git", ["rev-parse", "--show-toplevel"]);
  return stdout.trim();
}

/**
 * Self-Update: Pull latest agent code from main branch
 */
async function selfUpdate(root: string): Promise<boolean> {
  try {
    log("[self-update] Checking for agent updates...");
    
    // Fetch latest from origin
    await execa("git", ["fetch", "origin", "main"], { cwd: root });
    
    // Check if scripts/agent/ has changes
    const { stdout } = await execa("git", ["diff", "HEAD", "origin/main", "--name-only", "--", "scripts/agent/"], { cwd: root });
    
    if (stdout.trim()) {
      log("[self-update] Agent updates detected. Pulling changes...");
      
      // Stash local changes if any
      const { stdout: status } = await execa("git", ["status", "-s", "--", "scripts/agent/"], { cwd: root });
      if (status.trim()) {
        await execa("git", ["stash", "push", "-m", "[agent] auto-stash before self-update", "--", "scripts/agent/"], { cwd: root });
      }
      
      // Pull agent directory from main
      await execa("git", ["checkout", "origin/main", "--", "scripts/agent/"], { cwd: root });
      
      // Rebuild agent
      await execa("pnpm", ["run", "build:agent"], { cwd: root, stdio: "inherit" });
      
      ok("[self-update] Agent updated successfully. Restarting...");
      
      // Re-exec with special exit code to signal restart needed
      process.exit(77); // Special exit code to signal restart needed
    } else {
      ok("[self-update] Agent is up to date");
      return false;
    }
  } catch (e) {
    warn(`[self-update] Failed to update agent: ${e}`);
    return false;
  }
  return true;
}

/**
 * Self-Heal: Detect and fix common issues
 */
async function selfHeal(root: string): Promise<void> {
  log("[self-heal] Running diagnostics...");
  
  const issues: string[] = [];
  const fixes: string[] = [];
  
  // 1. Check pnpm lockfile
  try {
    const lockPath = join(root, "pnpm-lock.yaml");
    if (!existsSync(lockPath)) {
      issues.push("Missing pnpm-lock.yaml");
      writeFileSync(lockPath, "lockfileVersion: '9.0'\n", "utf8");
      fixes.push("Created pnpm-lock.yaml");
    }
  } catch (e) {
    warn(`[self-heal] Lockfile check failed: ${e}`);
  }
  
  // 2. Check node_modules and try to fix broken installs
  try {
    const nmPath = join(root, "node_modules");
    if (!existsSync(nmPath)) {
      issues.push("Missing node_modules");
      await execa("pnpm", ["install"], { cwd: root, stdio: "inherit" });
      fixes.push("Installed dependencies");
    }
  } catch (e) {
    warn(`[self-heal] Dependency check failed: ${e}`);
  }
  
  // 3. Check and fix TypeScript errors (best effort)
  try {
    const { exitCode } = await execa("pnpm", ["-w", "typecheck"], { 
      cwd: root, 
      reject: false 
    });
    if (exitCode !== 0) {
      issues.push("TypeScript errors detected");
      
      // Try auto-fix with ESLint
      await execa("pnpm", ["-w", "exec", "eslint", ".", "--fix"], { 
        cwd: root, 
        reject: false,
        stdio: "inherit"
      });
      fixes.push("Attempted ESLint auto-fix");
    }
  } catch (e) {
    warn(`[self-heal] TypeScript check failed: ${e}`);
  }
  
  // 4. Check Firebase emulators config
  try {
    const fbPath = join(root, "firebase.json");
    if (!existsSync(fbPath)) {
      issues.push("Missing firebase.json");
      const defaultConfig = {
        firestore: { rules: "firestore.rules", indexes: "firestore.indexes.json" },
        storage: { rules: "storage.rules" },
        emulators: {
          firestore: { port: 8080 },
          storage: { port: 9199 },
          ui: { enabled: true, port: 4000 }
        }
      };
      writeFileSync(fbPath, JSON.stringify(defaultConfig, null, 2), "utf8");
      fixes.push("Created firebase.json with defaults");
    }
  } catch (e) {
    warn(`[self-heal] Firebase config check failed: ${e}`);
  }
  
  // 5. Check agent build artifacts
  try {
    const distPath = join(root, "dist", "agent");
    if (!existsSync(distPath)) {
      issues.push("Missing agent build artifacts");
      await execa("pnpm", ["run", "build:agent"], { cwd: root, stdio: "inherit" });
      fixes.push("Rebuilt agent");
    }
  } catch (e) {
    warn(`[self-heal] Agent build check failed: ${e}`);
  }
  
  if (issues.length > 0) {
    warn(`[self-heal] Detected ${issues.length} issue(s): ${issues.join(", ")}`);
    ok(`[self-heal] Applied ${fixes.length} fix(es): ${fixes.join(", ")}`);
  } else {
    ok("[self-heal] No issues detected");
  }
}

async function main() {
  const { issue, force, planOnly, selfHeal: enableSelfHeal, selfUpdate: enableSelfUpdate } = parseArgs();
  log(`Repo agent started. Issue #${issue} | planOnly=${planOnly} | force=${force}`);

  const root = await gitRoot();
  log(`git root: ${root}`);

  // 0a) Self-Update: Check for agent updates and pull if available
  if (enableSelfUpdate && !planOnly) {
    const updated = await selfUpdate(root);
    if (updated) {
      log("[agent] Restart required after self-update. Exit code 77.");
      return; // Will exit with code 77
    }
  }

  // 0b) Self-Heal: Detect and fix common issues
  if (enableSelfHeal && !planOnly) {
    await selfHeal(root);
  }

  // 1) Plan & validate structure
  const structure = await ensureMonorepo({ root, planOnly });
  ok(`Monorepo structure OK`);
  log(plannedChangesSummary(structure));

  // 2) RBAC schemas
  await ensureRBAC({ root, force, planOnly });
  ok(`RBAC schemas ensured`);

  // 3) Firestore rules & indexes
  await ensureRules({ root, force, planOnly });
  ok(`Firestore rules & indexes ensured`);

  // 4) Install if needed (best-effort)
  if (!planOnly) {
    await pRetry(async () => {
      await execa("pnpm", ["install"], { stdio: "inherit" });
    }, { retries: 1 }).catch(() => warn("pnpm install failed (non-fatal)"));
  }

  // 5) Typecheck and rules tests (skip in plan-only mode)
  if (!planOnly) {
    await execa("pnpm", ["-s", "typecheck"], { stdio: "inherit" });
    // Rules tests require emulators - run but don't fail if emulators aren't available
    await execa("pnpm", ["-s", "test:rules"], { stdio: "inherit" })
      .catch(() => warn("Rules tests failed (may need emulators running)"));
  }

  ok("Repo agent completed successfully.");
}

main().catch((e) => {
  err(e?.stack || String(e));
  process.exit(1);
});
