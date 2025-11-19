#!/usr/bin/env node
// scripts/watch-restart.mjs
// Watches a command and restarts it if it exits with code 9 (SIGKILL) or with other non-zero codes.
// Usage: node scripts/watch-restart.mjs -- cmd args...  (separated by --) or `node scripts/watch-restart.mjs"pnpm","dev"`

import { spawn } from 'node:child_process';

function parseArgs() {
  // everything after -- is the command and args
  const idx = process.argv.indexOf('--');
  if (idx === -1) return process.argv.slice(2);
  return process.argv.slice(idx + 1);
}

const args = parseArgs();
if (!args.length) {
  console.error('Usage: node scripts/watch-restart.mjs -- <cmd> <arg1> <arg2> ...');
  process.exit(2);
}

const cmd = args[0];
const cmdArgs = args.slice(1);

let attempts = 0;
let lastExitCode = 0;

function start() {
  attempts += 1;
  const timestamp = new Date().toISOString();
  console.log(`[watch-restart] [${timestamp}] Starting command: ${cmd} ${cmdArgs.join(' ')}`);

  const p = spawn(cmd, cmdArgs, { stdio: 'inherit', shell: false, env: process.env });

  p.on('exit', (code, signal) => {
    lastExitCode = code;
    console.log(`[watch-restart] Command exited with code=${code}, signal=${signal}`);

    // If killed by SIGKILL (signal null with code 137) or code === 9, restart with backoff
    const isSigkill = signal === 'SIGKILL' || code === 137 || code === 9;
    if (isSigkill) {
      console.warn('[watch-restart] Detected SIGKILL-like termination. Restarting after backoff...');
      const backoff = Math.min(30, attempts * 2);
      setTimeout(start, backoff * 1000);
      return;
    }

    // Non-zero codes should also restart, but with limited attempts
    if ((code !== 0 && code !== null) && attempts < 10) {
      console.warn(`[watch-restart] Non-zero exit code (${code}). Restarting attempt ${attempts}/10 after 3s...`);
      setTimeout(start, 3000);
      return;
    }

    console.log('[watch-restart] Exiting watch process (no restart).');
    process.exit(code ?? 0);
  });

  p.on('error', (err) => {
    console.error('[watch-restart] Spawn error', err);
    process.exit(1);
  });
}

start();
