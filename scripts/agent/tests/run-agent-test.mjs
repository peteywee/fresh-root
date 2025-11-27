#!/usr/bin/env node
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const root = process.cwd();
  const pr = 'test-run';
  const artifact = path.join(root, 'artifacts', `agent-${pr}.json`);
  try {
    await execa('node', ['scripts/agent/agent.mjs', '--pr', pr, '--scope', 'all', '--format', 'json', '--scan-rbac', '--scan-patterns'], { stdio: 'inherit' });
  } catch (err) {
    // agent failed; ensure artifact may still exist
    console.error('Agent failed to run:', err?.message || err);
  }
  const data = JSON.parse(await fs.readFile(artifact, 'utf8'));
  if (!Array.isArray(data.checks)) throw new Error('No checks found in artifact');
  for (const c of data.checks) {
    if (typeof c.result !== 'boolean') throw new Error(`Check ${c.id} has invalid result: ${c.result}`);
  }
  // Ensure doc-parity and test-presence checks exist and are booleans
  const ids = new Set(data.checks.map((c) => c.id));
  if (!ids.has('doc-parity')) throw new Error('doc-parity check missing');
  if (!ids.has('test-presence')) throw new Error('test-presence check missing');
  // Check that the results are booleans
  const dp = data.checks.find((c) => c.id === 'doc-parity');
  if (typeof dp.result !== 'boolean') throw new Error('doc-parity result invalid');
  const tp = data.checks.find((c) => c.id === 'test-presence');
  if (typeof tp.result !== 'boolean') throw new Error('test-presence result invalid');
  console.log('Agent test validated: checks exist and results are boolean');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
