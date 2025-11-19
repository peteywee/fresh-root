#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function walk(dir) {
  const res = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        res.push(...(await walk(p)));
      } else if (e.isFile() && p.endsWith('.md')) {
        res.push(p);
      }
    }
  } catch (err) {
    // ignore
  }
  return res;
}

async function main() {
  const root = process.cwd();
  const apiDir = path.join(root, 'docs', 'api');
  const schemasDir = path.join(root, 'docs', 'schemas');
  const files = [...(await walk(apiDir)), ...(await walk(schemasDir))];
  const missing = [];
  for (const f of files) {
    const content = await fs.readFile(f, 'utf8');
    if (!/TEST SPEC/i.test(content)) missing.push(path.relative(root, f));
  }
  console.log('Missing TEST SPEC in:', missing.length, 'files');
  for (const m of missing) console.log('  ', m);
}

main().catch((e) => { console.error(e); process.exit(1); });
