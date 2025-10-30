#!/usr/bin/env node
import { execa } from "execa";
import { z } from "zod";
import pRetry from "p-retry";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureMonorepo, plannedChangesSummary } from "./tasks/restructure.js";
import { ensureRBAC } from "./tasks/rbac.js";
import { ensureRules } from "./tasks/rules.js";
import { log, ok, warn, err } from "./lib/logger.js";

const argv = process.argv.slice(2);
const ArgSchema = z.object({
  issue: z.string().default("21"),
  force: z.boolean().default(false),
  planOnly: z.boolean().default(false)
});
function parseArgs() {
  let issue = "21", force = false, planOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") force = true;
    else if (a === "--plan-only") planOnly = true;
    else if (a === "--issue") { issue = argv[++i]; }
  }
  return ArgSchema.parse({ issue, force, planOnly });
}

async function gitStatusShort(): Promise<string> {
  const { stdout } = await execa("git", ["status", "-s"]);
  return stdout;
}
async function gitRoot(): Promise<string> {
  const { stdout } = await execa("git", ["rev-parse", "--show-toplevel"]);
  return stdout.trim();
}
async function appendIfMissing(file: string, content: string) {
  const exists = existsSync(file);
  if (!exists) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content, "utf8");
    return "created";
  }
  const prev = await readFile(file, "utf8");
  if (prev === content) return "unchanged";
  await writeFile(file, content, "utf8");
  return "updated";
}

async function main() {
  const { issue, force, planOnly } = parseArgs();
  log(`Repo agent started. Issue #${issue} | planOnly=${planOnly} | force=${force}`);

  const root = await gitRoot();
  log(`git root: ${root}`);

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
  await pRetry(async () => {
    await execa("pnpm", ["install"], { stdio: "inherit" });
  }, { retries: 1 }).catch(() => warn("pnpm install failed (non-fatal)"));

  // 5) Typecheck and rules tests (fail the job if they fail)
  await execa("pnpm", ["-s", "typecheck"], { stdio: "inherit" });
  await execa("pnpm", ["-s", "test:rules"], { stdio: "inherit" });

  ok("Repo agent completed successfully.");
}

main().catch((e) => {
  err(e?.stack || String(e));
  process.exit(1);
});
