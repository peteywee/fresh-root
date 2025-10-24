#!/usr/bin/env node
const semver = require('semver');

function getVersion(cmd) {
  try {
    return require('child_process').execSync(cmd, { stdio: ['ignore','pipe','ignore'] }).toString().trim();
  } catch {
    return null;
  }
}

const nodev = process.version;
const pnpmv = getVersion('pnpm --version');

if (!semver.satisfies(semver.coerce(nodev), '>=20.0.0')) {
  console.error(`❌ Node ${nodev} not supported. Use Node >=20.`);
  process.exit(1);
}
if (!pnpmv || !semver.satisfies(semver.coerce(pnpmv), '>=9.0.0')) {
  console.error(`❌ pnpm ${pnpmv || 'not found'} not supported. Install pnpm >=9.`);
  process.exit(1);
}
console.log(`✅ Node ${nodev} / pnpm ${pnpmv} OK`);
