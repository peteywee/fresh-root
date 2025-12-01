#!/usr/bin/env node
/**
 * Minimal release script for Series A
 * - Bumps package.json version to 1.2.0
 * - Runs SDK build to verify
 * - Creates a git tag 'v1.2.0'
 * Usage: node scripts/release-series-a.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const desiredVersion = '1.2.0';
if (pkg.version !== desiredVersion) {
  console.log(`Bumping version ${pkg.version} -> ${desiredVersion}`);
  pkg.version = desiredVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  execSync('git add package.json', { stdio: 'inherit' });
  execSync(`git commit -m "chore(release): bump to v${desiredVersion} (Series A)"`, { stdio: 'inherit' });
} else {
  console.log(`Version already ${desiredVersion}`);
}

console.log('Running SDK build to verify...');
execSync('pnpm build:sdk', { stdio: 'inherit' });

console.log(`Creating tag v${desiredVersion} (local only)`);
try {
  execSync(`git tag -a v${desiredVersion} -m "Series A release v${desiredVersion}"`, { stdio: 'inherit' });
} catch (err) {
  console.warn('Tagging failed or tag already exists.');
}

console.log('\nRelease script finished. Please push tags and branch to remote (if desired):\n  git push origin feat/sdk-extraction && git push origin v1.2.0');
