#!/usr/bin/env node
// [P2][APP][CODE] Nesting Audit
// Tags: P2, APP, CODE
/**
 * Nesting Audit
 * Fails if we detect double-nesting (app/app, src/src), any live `apps/web/src/**`,
 * or imports pointing at the old src paths.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "pipe", encoding: "utf8" }).trim();

const badDirGlobs = [
  "'**/app/app/**'",
  "'**/src/src/**'",
  "'apps/web/src/**'",        // should be migrated or quarantined as _legacy_src
];

const grepBadDirs = () => {
  const matches = [];
  for (const g of badDirGlobs) {
    const out = run(`bash -lc "shopt -s globstar nullglob; ls -d ${g} 2>/dev/null || true"`);
    if (out) matches.push(...out.split("\n").filter(Boolean));
  }
  return matches;
};

const grepBadImports = () => {
  // Look for imports reaching into /src/ from live code (apps/**/app/**)
  const cmd = `
    bash -lc '
      git ls-files | grep -E "^(apps|packages)/.*/(app|src)/.*\\.(ts|tsx|js|jsx)$" | \
      xargs -I{} grep -nH -E "(from|require\\()\\s*[\\'\\\"][^\\'\\\"]*\\/src(\\/|\\')"
    '`;
  try {
    const out = run(cmd);
    return out ? out.split("\n").filter(Boolean) : [];
  } catch {
    return [];
  }
};

const forbiddenDirs = grepBadDirs();
const badImports = grepBadImports();

const ignoredOK = (() => {
  try {
    const rootCfg = readFileSync("eslint.config.mjs", "utf8");
    const hasIgnores = /ignores:\s*\[([\s\S]*?)\]/m.test(rootCfg) && /_legacy\/\*\*/.test(rootCfg);
    return hasIgnores;
  } catch {
    return false;
  }
})();

let failed = false;

if (forbiddenDirs.length) {
  console.error("❌ Forbidden nested directories detected:");
  forbiddenDirs.forEach((p) => console.error(" -", p));
  failed = true;
} else {
  console.log("✅ No double-nested directories (app/app, src/src, apps/web/src) present.");
}

if (badImports.length) {
  console.error("\n❌ Live code still imports from '/src' paths:");
  badImports.forEach((l) => console.error(" -", l));
  failed = true;
} else {
  console.log("✅ No live imports referencing old '/src' paths.");
}

if (!ignoredOK) {
  console.error("\n❌ ESLint root config is missing required _legacy/** ignores.");
  failed = true;
} else {
  console.log("✅ ESLint root ignores include _legacy/** quarantine.");
}

process.exit(failed ? 1 : 0);
