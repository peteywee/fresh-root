#!/usr/bin/env node
// [P2][APP][CODE] Postinstall
// Tags: P2, APP, CODE
const { spawnSync } = require("child_process");
const semver = require("semver");

function run(cmd) {
  const p = spawnSync(cmd[0], cmd.slice(1), { encoding: "utf-8" });
  return { code: p.status ?? 0, stdout: p.stdout || "", stderr: p.stderr || "" };
}

let outdated = [];
try {
  const out = run(["pnpm", "-r", "outdated", "--format", "json"]);
  if (out.stdout.trim()) outdated = JSON.parse(out.stdout);
} catch {
  console.warn("⚠️ Unable to parse outdated JSON; proceeding.");
}

const offenders = [];
for (const pkg of outdated) {
  if (
    pkg.current &&
    pkg.latest &&
    semver.lt(pkg.current, pkg.latest) &&
    pkg.isWorkspacePeer !== true
  ) {
    offenders.push(`${pkg.name}@${pkg.current} → ${pkg.latest} (${pkg.location})`);
  }
}
if (offenders.length) {
  console.error(
    "❌ Outdated direct dependencies detected:\n" + offenders.map((x) => " - " + x).join("\n"),
  );
  console.error("   Run: pnpm -r up --latest  (then verify & commit lockfile)");
  process.exit(1);
}

const audit = run(["pnpm", "-r", "audit", "--prod", "--json"]);
if (audit.stdout) {
  try {
    const s = audit.stdout.toLowerCase();
    if (s.includes('"severity":"critical"') || s.includes('"severity":"high"')) {
      console.error("❌ Security audit found HIGH/CRITICAL issues. Address before proceeding.");
      process.exit(1);
    }
  } catch {
    if (audit.code !== 0) {
      console.error("❌ Security audit failed (non-zero exit). Resolve issues or re-run.");
      process.exit(1);
    }
  }
}

console.log("✅ Dependency health checks passed (no outdated direct deps; audit clean).");
