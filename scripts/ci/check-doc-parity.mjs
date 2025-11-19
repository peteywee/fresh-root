#!/usr/bin/env node
// [P2][APP][CODE] Check Doc Parity
// Tags: P2, APP, CODE
/**
 * Doc and Code Parity Gate
 * Fails if any API route or exported Schema lacks a corresponding doc page and test spec.
 *
 * Rules:
 * - For each file:
 *   - API route -> docs/api/<route>.md
 *   - Exported Schema -> docs/schemas/<name>.md
 *   - Each doc must reference a TEST SPEC path
 */
import { promises as fs } from "node:fs";
import { globby } from "globby";
import path from "node:path";

const repoRoot = process.cwd();

async function ensureExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function routeToDocPath(routeFile) {
  // app/api/users/profile/route.ts -> docs/api/users/profile.md
  const rel = routeFile.replace(/^apps\/web\/app\/api\//, "").replace(/\/route\.ts$/, "");
  return path.join("docs", "api", `${rel}.md`);
}

function schemaToDocPath(schemaName) {
  return path.join("docs", "schemas", `${schemaName}.md`);
}

async function main() {
  const problems = [];

  // 1) API routes
  const routeFiles = await globby(["apps/web/app/api/**/route.ts"], {
    gitignore: true,
  });
  for (const rf of routeFiles) {
    const doc = routeToDocPath(rf);
    const ok = await ensureExists(doc);
    if (!ok) problems.push({ kind: "route-doc-missing", file: rf, need: doc });
  }

  // 2) Exported *Schema names from packages/types
  const typeFiles = await globby(["packages/types/src/**/*.ts"], {
    gitignore: true,
  });
  const schemaExports = [];
  for (const tf of typeFiles) {
    const content = await fs.readFile(tf, "utf8");
    const matches = [...content.matchAll(/export\s+const\s+(\w+Schema)\s*=\s*z\./g)];
    for (const m of matches) schemaExports.push({ file: tf, name: m[1] });
  }
  for (const s of schemaExports) {
    const doc = schemaToDocPath(s.name);
    const ok = await ensureExists(doc);
    if (!ok)
      problems.push({
        kind: "schema-doc-missing",
        file: s.file,
        schema: s.name,
        need: doc,
      });
  }

  // 3) Each doc must reference a TEST SPEC path (string match)
  const docFiles = await globby(["docs/api/**/*.md", "docs/schemas/**/*.md"], { gitignore: true });
  for (const df of docFiles) {
    const t = await fs.readFile(df, "utf8");
    if (!/TEST SPEC/i.test(t))
      problems.push({
        kind: "doc-missing-test-link",
        file: df,
        note: "Add a TEST SPEC link/section",
      });
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
