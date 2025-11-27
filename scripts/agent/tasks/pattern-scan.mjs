#!/usr/bin/env node
// Pattern scan: searches for inline adminDb usage in UI or places where DB logic should not be present.
import { promises as fs } from 'node:fs';
import path from 'node:path';

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
  const uiDirs = [ path.join(root, 'apps', 'web', 'app'), path.join(root, 'apps', 'web', 'src') ];
  const problems = [];

  for (const d of uiDirs) {
    const files = await walk(d);
    for (const f of files) {
      const c = await fs.readFile(f, 'utf8');
      if (/\badminDb\./.test(c) || /\.transaction\(/.test(c)) {
        // Inline adminDb or transaction usage in UI or app code is a risk
        problems.push({ file: path.relative(root, f), note: 'Inline adminDb or transaction usage detected' });
      }
    }
  }

  if (problems.length) {
    console.error('Pattern Scan: risk patterns found:');
    console.error(JSON.stringify(problems, null, 2));
    process.exit(1);
  }
  console.log('Pattern Scan: OK');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1) });
