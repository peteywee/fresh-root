#!/usr/bin/env node
// [P1][TEST][TEST] Add Test Spec Placeholder All tests
// Tags: P1, TEST, TEST
import { promises as fs } from "node:fs";
import path from "node:path";

async function walk(dir) {
  const res = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        res.push(...(await walk(p)));
      } else if (e.isFile() && p.endsWith(".md")) {
        res.push(p);
      }
    }
  } catch {}
  return res;
}

async function addPlaceholderToFile(file, exampleTestPath) {
  const content = await fs.readFile(file, "utf8");
  if (!/TEST SPEC/i.test(content)) {
    const updated =
      content +
      `\n\n## TEST SPEC\n\n- TODO: Add tests for this doc. Example: \`${exampleTestPath}\`\n`;
    await fs.writeFile(file, updated, "utf8");
    return true;
  }
  return false;
}

async function main() {
  const root = process.cwd();
  const apiDir = path.join(root, "docs", "api");
  const schemasDir = path.join(root, "docs", "schemas");
  const apiFiles = await walk(apiDir);
  const schemaFiles = await walk(schemasDir);

  let added = 0;
  for (const f of [...apiFiles, ...schemaFiles]) {
    const exampleTestPath = f.includes("/api/")
      ? "apps/web/app/api/onboarding/__tests__/onboarding-consolidated.test.ts"
      : "packages/types/src/__tests__/schemas-consolidated.test.ts";
    const updated = await addPlaceholderToFile(f, exampleTestPath);
    if (updated) {
      console.log(`Updated: ${path.relative(root, f)}`);
      added++;
    }
  }
  console.log(`Done. Added TEST SPEC to ${added} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
