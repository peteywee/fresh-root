#!/usr/bin/env node
// [P2][APP][CODE] Auto Symlink Docs
// Tags: P2, APP, CODE
/**
 * [P2][APP][CODE] Auto-symlink Generator
 *
 * Ensures each exported Zod schema and API route has a symlink
 * to the consolidated SCHEMAS_PAPER.md or API_PAPER.md.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { globby } from "globby";

const root = process.cwd();
const schemaPaper = path.join(root, "docs/schemas/SCHEMAS_PAPER.md");
const apiPaper = path.join(root, "docs/api/API_PAPER.md");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function createSymlink(target, linkPath) {
  try {
    const rel = path.relative(path.dirname(linkPath), target);
    await fs.symlink(rel, linkPath);
    console.log("→ linked", linkPath, "→", rel);
  } catch (err) {
    if (err.code === "EEXIST") return; // already exists
    throw err;
  }
}

async function makeSchemaLinks() {
  const files = await globby(["packages/types/src/**/*.ts"]);
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const matches = [...content.matchAll(/export\s+const\s+(\w+Schema)\s*=\s*z\./g)];
    for (const [, name] of matches) {
      const link = path.join(root, "docs/schemas", `${name}.md`);
      await ensureDir(path.dirname(link));
      await createSymlink(schemaPaper, link);
    }
  }
}

async function makeApiLinks() {
  const files = await globby(["apps/web/app/api/**/route.ts"]);
  for (const f of files) {
    const rel = f.replace(/^apps\/web\/app\/api\//, "").replace(/\/route\.ts$/, "");
    const link = path.join(root, "docs/api", `${rel}.md`);
    await ensureDir(path.dirname(link));
    await createSymlink(apiPaper, link);
  }
}

(async () => {
  await makeSchemaLinks();
  await makeApiLinks();
})();
