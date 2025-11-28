#!/usr/bin/env node
// [P0][RBAC][CODE] Rbac
// Tags: P0, RBAC, CODE
// Simple RBAC scan: looks for routes missing 'requireAuth' or 'withSecurity' tokens.
import { promises as fs } from "node:fs";
import path from "node:path";

async function walk(dir) {
  const res = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) res.push(...(await walk(p)));
      else if (e.isFile() && /route\.(ts|mts|js|mjs)$/.test(e.name)) res.push(p);
    }
  } catch (err) {}
  return res;
}

async function checkFile(file) {
  const content = await fs.readFile(file, "utf8");
  // heuristics: check if route contains requireAuth/requireManager/withSecurity tokens
  const guardRegex =
    /requireAuth|requireManager|require2FA|withSecurity|requireOwner|requireOrgMembership|requireRole|csrfProtection|requireSession|requireAdmin/;
  const matches = guardRegex.test(content);
  return matches ? null : { file, note: "No RBAC guard token found (heuristic)" };
}

async function loadConfig() {
  try {
    const cfgPath = path.join(process.cwd(), "scripts", "agent", "config.json");
    const cfgStr = await fs.readFile(cfgPath, "utf8");
    return JSON.parse(cfgStr);
  } catch (err) {
    return {};
  }
}

async function main() {
  const root = process.cwd();
  const routesDir = path.join(root, "apps", "web", "app", "api");
  const routeFiles = await walk(routesDir);
  const problems = [];
  const cfg = await loadConfig();
  const allowlist = (cfg.rbacAllowlist || []).map((p) => path.normalize(p));
  const checkPaths = cfg.rbacCheckPaths || [];
  for (const rf of routeFiles) {
    const relPath = path.relative(process.cwd(), rf);
    if (allowlist.includes(relPath)) continue;
    if (checkPaths.length > 0 && !checkPaths.some((p) => relPath.startsWith(p))) continue;
    const p = await checkFile(rf);
    if (p) problems.push(p);
  }
  if (problems.length) {
    console.error("RBAC Scan: found missing guard heuristics:");
    console.error(JSON.stringify(problems, null, 2));
    process.exit(1);
  }
  console.log("RBAC Scan: OK");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
