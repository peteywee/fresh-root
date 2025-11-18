#!/usr/bin/env node
// scripts/sequential-tasks.mjs
// Runs workspace lint -> web build -> simple audit (no client firebase-admin imports)
// Usage: node scripts/sequential-tasks.mjs

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

function runCommand(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${cmd} ${args.join(' ')}\n`);
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    p.on('exit', (code, signal) => {
      if (signal) return reject(new Error(`Command killed by signal ${signal}`));
      if (code !== 0) return reject(new Error(`Command exited with code ${code}`));
      resolve();
    });
    p.on('error', (err) => reject(err));
  });
}

async function grepFiles(root, needle) {
  const matches = [];
  async function walk(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const it of items) {
      if (it.name === 'node_modules' || it.name === '.git' || it.name === '.next') continue;
      const p = path.join(dir, it.name);
      if (it.isDirectory()) await walk(p);
      else if (it.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(it.name)) {
        try {
          const txt = await fs.readFile(p, 'utf8');
          if (txt.includes(needle)) matches.push(p);
        } catch {}
      }
    }
  }
  await walk(root);
  return matches;
}

(async function main(){
  try {
    // Limit Node heap for these commands to reduce memory pressure when run locally
    const env = { ...process.env, NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max-old-space-size=1536' };

    // 1) Workspace lint (problem-only fixer recommended separately)
    await runCommand('pnpm', ['-w', 'run', 'lint'], { env });

    // 2) Build only web
    await runCommand('pnpm', ['--filter', '@apps/web', 'build'], { env });

    // 3) Quick audit: find occurrences of server-only admin wrapper or firebase-admin in client code
    console.log('\n> Running quick import audit for server-only libraries...');
    const repoRoot = process.cwd();
    const needle1 = "@/lib/firebase-admin";
    const needle2 = "firebase-admin";
    const matches1 = await grepFiles(repoRoot, needle1);
    const matches2 = await grepFiles(repoRoot, needle2);

    if (matches1.length === 0 && matches2.length === 0) {
      console.log('Audit: no occurrences of server-only admin imports found in source files.');
    } else {
      console.warn('Audit: potential server-only imports found:');
      for (const m of [...new Set([...matches1, ...matches2])]) console.log('  -', m);
      console.warn('Please review the above files to ensure imports are guarded or only used in server-only entrypoints.');
    }

    console.log('\nSequential tasks completed successfully');
  } catch (err) {
    console.error('\nSequential tasks failed:', err.message || err);
    process.exitCode = 1;
  }
})();
