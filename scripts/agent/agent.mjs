#!/usr/bin/env node
// Minimal agent harness for Global Cognition Agent
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function run(cmd) {
  try {
    const out = execSync(cmd, { stdio: 'pipe' }).toString();
    return { ok: true, out };
  } catch (err) {
    return { ok: false, out: err.stderr?.toString() || err.message };
  }
}

function runScriptLocation(script) {
  // run relative to repo root
  if (script.endsWith('.sh')) return `bash ${script}`;
  return `node ${script}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const res = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--scope') res.scope = args[++i];
    else if (a === '--pr') res.pr = args[++i];
    else if (a === '--format') res.format = args[++i];
    else if (a === '--scan-rbac') res.scanRbac = true;
    else if (a === '--scan-patterns') res.scanPatterns = true;
  }
  return res;
}

async function main() {
  const root = process.cwd();
  const args = parseArgs();
  const results = { checks: [], meta: { scope: args.scope || 'all', pr: args.pr || null } };

  // Ensure artifacts dir
  const artifactsDir = path.join(root, 'artifacts');
  try { await fs.mkdir(artifactsDir); } catch {}

  // 1) run index check
  results.checks.push({ id: 'index-check', name: 'Index Check' });
  const indexCmd = 'bash scripts/index/generate-file-index.sh --check';
  const idx = run(indexCmd);
  results.checks[results.checks.length - 1].result = idx.ok;
  results.checks[results.checks.length - 1].output = idx.out;

  // 2) doc-parity
  results.checks.push({ id: 'doc-parity', name: 'Doc Parity' });
  const dp = run('node scripts/ci/check-doc-parity-simple.mjs');
  results.checks[results.checks.length - 1].result = dp.ok;
  results.checks[results.checks.length - 1].output = dp.out;

  // 3) test-presence
  results.checks.push({ id: 'test-presence', name: 'Test Presence' });
  const tp = run('node scripts/tests/verify-tests-present-simple.mjs');
  results.checks[results.checks.length - 1].result = tp.ok;
  results.checks[results.checks.length - 1].output = tp.out;

  // Optional checks: RBAC & Patterns
  if (args.scanRbac || args.scope === 'all') {
    results.checks.push({ id: 'rbac-scan', name: 'RBAC Scan' });
    const r = run('node scripts/agent/tasks/rbac.mjs');
    results.checks[results.checks.length - 1].result = r.ok;
    results.checks[results.checks.length - 1].output = r.out;
  }
  if (args.scanPatterns || args.scope === 'all') {
    results.checks.push({ id: 'pattern-scan', name: 'Pattern Scan' });
    const p = run('node scripts/agent/tasks/pattern-scan.mjs');
    results.checks[results.checks.length - 1].result = p.ok;
    results.checks[results.checks.length - 1].output = p.out;
  }

  const artifactPath = path.join(artifactsDir, `agent-${args.pr || 'local'}.json`);
  await fs.writeFile(artifactPath, JSON.stringify(results, null, 2));

  // Print human summary
  console.log('\nAGENT RESULTS SUMMARY:');
  results.checks.forEach((c) => {
    console.log(`- ${c.name} (${c.id}): ${c.result ? 'PASS' : 'FAIL'}`);
  });

  if (results.checks.some((c) => !c.result)) process.exit(1);
  else process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
