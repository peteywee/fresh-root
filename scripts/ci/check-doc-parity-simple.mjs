#!/usr/bin/env node
// [P2][APP][CODE] Check Doc Parity Simple
// Tags: P2, APP, CODE
import { promises as fs } from "node:fs";
import path from "node:path";

async function walk(dir, pattern = /.*\.(ts|md)$/) {
  const res = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        res.push(...(await walk(p, pattern)));
      } else if (e.isFile() && pattern.test(e.name)) {
        res.push(p);
      }
    }
  } catch (err) {}
  return res;
}

async function ensureExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function routeToDocPath(routeFile) {
  const rel = routeFile.replace(/^apps\/web\/app\/api\//, "").replace(/\/route\.(ts|mts)$/, "");
  return path.join("docs", "api", `${rel}.md`);
}

function schemaToDocPath(schemaName) {
  return path.join("docs", "schemas", `${schemaName}.md`);
}

async function main() {
  const root = process.cwd();
  const problems = [];

  // 1) API routes
  const routeFiles = await walk(path.join(root, "apps", "web", "app", "api"), /route\.(ts|mts)$/);
  for (const rf of routeFiles) {
    const rel = path.relative(root, rf);
    const doc = routeToDocPath(rel);
    const ok = await ensureExists(path.join(root, doc));
    if (!ok) problems.push({ kind: "route-doc-missing", file: rel, need: doc });
  }

  // 2) Schema exports
  const typeFiles = await walk(path.join(root, "packages", "types", "src"), /.*\.ts$/);
  const schemaExports = [];
  for (const tf of typeFiles) {
    const content = await fs.readFile(tf, "utf8");
    const matches = [...content.matchAll(/export\s+const\s+(\w+Schema)\s*=\s*z\./g)];
    for (const m of matches) schemaExports.push({ file: path.relative(root, tf), name: m[1] });
  }
  for (const s of schemaExports) {
    const doc = schemaToDocPath(s.name);
    const ok = await ensureExists(path.join(root, doc));
    if (!ok) problems.push({ kind: "schema-doc-missing", file: s.file, schema: s.name, need: doc });
  }

  // 3) docs must contain TEST SPEC
  const docFiles = await walk(path.join(root, "docs", "api"), /.*\.md$/);
  const schemaDocFiles = await walk(path.join(root, "docs", "schemas"), /.*\.md$/);
  const allDocs = [...docFiles, ...schemaDocFiles];
  for (const df of allDocs) {
    const t = await fs.readFile(df, "utf8");
    if (!/TEST SPEC/i.test(t)) {
      problems.push({ kind: "doc-missing-test-link", file: path.relative(root, df) });
    } else {
      // Check for TODOs in the Test Spec section
      // Simple heuristic: look for "TEST SPEC" followed by "TODO" within a small window or until next header
      const testSpecMatch = t.match(/TEST SPEC[\s\S]*?(?=(#|\z))/i);
      if (testSpecMatch && /TODO/i.test(testSpecMatch[0])) {
        problems.push({ kind: "doc-test-spec-todo", file: path.relative(root, df) });
      }
    }
  }

  if (problems.length) {
    console.error("Doc Parity Failed:\n" + problems.map((p) => JSON.stringify(p)).join("\n"));
    process.exit(1);
  } else {
    console.log("Doc Parity: OK");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
