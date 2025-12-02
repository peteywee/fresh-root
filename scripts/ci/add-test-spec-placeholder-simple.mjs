#!/usr/bin/env node
// [P1][TEST][TEST] Add Test Spec Placeholder Simple tests
// Tags: P1, TEST, TEST
// Adds a basic 'TEST SPEC' section to docs files that are missing it, without external dependencies.
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function walk(dir) {
  const res = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      res.push(...(await walk(p)));
    } else if (e.isFile() && p.endsWith('.md')) {
      res.push(p);
    }
  }
  return res;
}

async function main() {
  const root = process.cwd();
  const targets = [path.join(root, 'docs', 'api'), path.join(root, 'docs', 'schemas')];
  let count = 0;
  for (const t of targets) {
    try {
      const files = await walk(t);
      for (const f of files) {
        const content = await fs.readFile(f, 'utf8');
        if (!/TEST SPEC/i.test(content)) {
          const exampleTestPath = (f.includes('/api/')) ? 'apps/web/app/api/onboarding/__tests__/onboarding-consolidated.test.ts' : 'apps/web/src/__tests__/schema-consolidated.test.ts';
          const testSpec = `\n\n## TEST SPEC\n\n- TODO: Add tests for this doc. Example: \`${exampleTestPath}\`\n`;
          await fs.writeFile(f, content + testSpec);
          console.log(`Updated: ${path.relative(root, f)}`);
          count++;
        }
      }
    } catch (err) {
      // directory may not exist
    }
  }
  console.log(`Done. Added TEST SPEC to ${count} files.`);
}

main().catch((err)=>{ console.error(err); process.exit(1); });
