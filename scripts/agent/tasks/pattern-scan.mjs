#!/usr/bin/env node
// [P0][APP][CODE] Pattern Scan
// Tags: P0, APP, CODE
// Pattern scan: searches for inline adminDb usage in UI or places where DB logic should not be present.
import { promises as fs } from "node:fs";
import path from "node:path";

async function walk(dir, extRegex = /.*\.(ts|tsx|js|jsx|mjs)$/) {
  const res = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) res.push(...(await walk(p, extRegex)));
      else if (e.isFile() && extRegex.test(e.name)) res.push(p);
    }
  } catch (err) {}
  return res;
}

async function main() {
  const root = process.cwd();
  const uiDirs = [path.join(root, "apps", "web", "app")];
  // load ignore list from config
  const cfgPath = path.join(root, "scripts", "agent", "config.json");
  let cfg = {};
  try {
    cfg = JSON.parse(await fs.readFile(cfgPath, "utf8"));
  } catch {}
  const ignore = (cfg.patternAllowlist || []).map((p) => path.normalize(p));
  const problems = [];

  for (const d of uiDirs) {
    const files = await walk(d);
    for (const f of files) {
      const c = await fs.readFile(f, "utf8");
      // Skip API routes (app/api) - pattern scanning is intended for UI files
      if (f.includes(path.join("app", "api"))) continue;
      const rel = path.relative(root, f);
      if (ignore.includes(path.normalize(rel))) continue;
      if (/\badminDb\./.test(c) || /\.transaction\(/.test(c)) {
        // Inline adminDb or transaction usage in UI or app code is a risk
        problems.push({
          file: path.relative(root, f),
          note: "Inline adminDb or transaction usage detected",
        });
      }
    }
  }

  if (problems.length) {
    console.error("Pattern Scan: risk patterns found:");
    console.error(JSON.stringify(problems, null, 2));
    process.exit(1);
  }
  console.log("Pattern Scan: OK");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
