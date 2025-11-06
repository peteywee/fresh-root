// [P2][APP][CODE] Preinstall
// Tags: P2, APP, CODE
#!/usr/bin/env node
const semver = require("semver");

function getVersion(cmd) {
  try {
    return require("child_process")
      .execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

const nodeVersion = process.version;
const pnpmVersion = getVersion("pnpm --version");

if (!semver.satisfies(semver.coerce(nodeVersion), ">=20.0.0")) {
  console.error(`❌ Node ${nodeVersion} not supported. Use Node >=20.`);
  process.exit(1);
}
if (!pnpmVersion || !semver.satisfies(semver.coerce(pnpmVersion), ">=9.0.0")) {
  console.error(`❌ pnpm ${pnpmVersion || "not found"} not supported. Install pnpm >=9.`);
  process.exit(1);
}
console.log(`✅ Node ${nodeVersion} / pnpm ${pnpmVersion} OK`);
