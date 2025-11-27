#!/usr/bin/env node
// Simple RBAC scan: looks for routes missing 'requireAuth' or 'withSecurity' tokens.
import { promises as fs } from 'node:fs';
import path from 'node:path';

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
  const content = await fs.readFile(file, 'utf8');
  // heuristics: check if route contains requireAuth/requireManager/withSecurity tokens
  const guardRegex = /requireAuth|requireManager|require2FA|withSecurity|requireOwner/;
  const matches = guardRegex.test(content);
  return matches ? null : { file, note: 'No RBAC guard token found (heuristic)' };
}

async function main() {
  const root = process.cwd();
  const routesDir = path.join(root, 'apps', 'web', 'app', 'api');
  const routeFiles = await walk(routesDir);
  const problems = [];
  for (const rf of routeFiles) {
    const p = await checkFile(rf);
    if (p) problems.push(p);
  }
  if (problems.length) {
    console.error('RBAC Scan: found missing guard heuristics:');
    console.error(JSON.stringify(problems, null, 2));
    process.exit(1);
  }
  console.log('RBAC Scan: OK');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1) });
