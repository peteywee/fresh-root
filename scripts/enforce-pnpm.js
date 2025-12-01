#!/usr/bin/env node
// [P2][APP][CODE] Enforce Pnpm
// Tags: P2, APP, CODE

/**
 * FRESH-ROOT: pnpm-only enforcement hook
 * Series-A Standard: This script prevents npm/yarn usage in the monorepo
 * 
 * Runs as a pre-commit hook to catch npm install attempts before they break the build.
 * Also validates package.json engines field for Node/pnpm versions.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const PNPM_LOCK = path.join(ROOT, 'pnpm-lock.yaml');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const NODE_MODULES = path.join(ROOT, 'node_modules');

// Check 1: Verify pnpm-lock.yaml exists (not package-lock.json or yarn.lock)
const hasNpmLock = fs.existsSync(path.join(ROOT, 'package-lock.json'));
const hasYarnLock = fs.existsSync(path.join(ROOT, 'yarn.lock'));
const hasPnpmLock = fs.existsSync(PNPM_LOCK);

if (hasNpmLock || hasYarnLock) {
  console.error('❌ SERIES-A POLICY VIOLATION: npm or yarn lock file detected!');
  console.error('   Found: ' + (hasNpmLock ? 'package-lock.json' : 'yarn.lock'));
  console.error('   Expected: pnpm-lock.yaml only');
  console.error('\n   Fix: Delete the lock file and run `pnpm install`');
  process.exit(1);
}

if (!hasPnpmLock && fs.existsSync(NODE_MODULES)) {
  console.warn('⚠️  Warning: node_modules exists but pnpm-lock.yaml not found');
  console.warn('   Run `pnpm install` to regenerate lock file');
}

// Check 2: Verify pnpm version in packageManager field
try {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  
  if (!pkg.packageManager) {
    console.error('❌ Missing packageManager in package.json');
    console.error('   Add: "packageManager": "pnpm@9.12.1"');
    process.exit(1);
  }

  if (!pkg.packageManager.startsWith('pnpm@')) {
    console.error('❌ SERIES-A POLICY VIOLATION: packageManager must be pnpm!');
    console.error('   Found: ' + pkg.packageManager);
    console.error('   Expected: pnpm@X.X.X');
    process.exit(1);
  }

  // Check 3: Verify engines field
  if (!pkg.engines || !pkg.engines.pnpm) {
    console.warn('⚠️  Warning: engines.pnpm not specified in package.json');
    console.warn('   Recommended: "pnpm": ">=9.0.0"');
  }
} catch (err) {
  console.error('❌ Failed to read package.json:', err.message);
  process.exit(1);
}

console.log('✅ pnpm enforcement check passed');
