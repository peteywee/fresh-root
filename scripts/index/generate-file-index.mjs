#!/usr/bin/env node
// [P0][SECURITY][CODE] Generate File Index
// Tags: P0, SECURITY, CODE
/**
 * [MEDIUM][INFRA][INDEX]
 * Tags: index, codegen, ci-guard
 * Generate docs/INDEX.md from tracked files.
 * - Uses `git ls-files` to stay deterministic
 * - Category grouping from scripts/index/config.mjs
 * - Excludes heavy/legacy/vendor paths
 * - Flags:
 *    --write   : write docs/INDEX.md
 *    --check   : exit 1 if docs/INDEX.md differs from freshly generated
 *    --debug   : verbose logging
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { EXCLUDES, CATEGORIES, HEADER } from "./config.mjs";

const ROOT = process.cwd();
const DEBUG = process.argv.includes("--debug");
const WRITE = process.argv.includes("--write");
const CHECK = process.argv.includes("--check");
const OUT = path.join(ROOT, "docs", "INDEX.md");

function sh(cmd, opts = {}) {
  if (DEBUG) console.error("sh:", cmd);
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts })
    .trim();
}

function gatherFiles() {
  // Start with all tracked files
  let files = sh("git ls-files -z").split("\0").filter(Boolean);

  // Apply excludes (cheaply) with regex
  const excludeRe = new RegExp(
    EXCLUDES.map(g =>
      g
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*")
        .replace(/\//g, "\\/")
        .replace(/\./g, "\\.")
    ).join("|")
  );

  files = files.filter(p => !excludeRe.test(p));
  return files.sort((a, b) => a.localeCompare(b));
}

function groupFiles(files) {
  const groups = new Map(CATEGORIES.map(c => [c.name, []]));
  const uncategorized = [];
  for (const f of files) {
    const cat = CATEGORIES.find(c => c.match(f));
    if (cat) groups.get(cat.name).push(f);
    else uncategorized.push(f);
  }
  if (uncategorized.length) groups.set("Uncategorized", uncategorized);
  return groups;
}

function shortInfo(file) {
  // last commit time & author for the file (best-effort)
  let meta = "";
  try {
    const fmt = sh(`git log -1 --pretty=format:%cs__%an -- "${file}"`);
    const [date, author] = fmt.split("__");
    meta = ` — _${date}, ${author}_`;
  } catch {
    /* ignore */
  }
  return meta;
}

function render(groups) {
  const now = new Date().toISOString();
  let out = HEADER + `\n_Last generated: ${now}_\n\n`;

  const totals = [...groups.values()].reduce((n, arr) => n + arr.length, 0);
  out += `**Total files indexed:** ${totals}\n\n`;

  for (const [name, arr] of groups.entries()) {
    if (!arr.length) continue;
    out += `## ${name} (${arr.length})\n\n`;
    for (const f of arr) {
      out += `- \`${f}\`${shortInfo(f)}\n`;
    }
    out += `\n`;
  }

  // integrity footer
  const hash = crypto.createHash("sha256").update(out).digest("hex");
  out += `\n---\n\n_Index integrity:_ \`${hash}\`\n`;
  return out;
}

function main() {
  const files = gatherFiles();
  const groups = groupFiles(files);
  const md = render(groups);

  if (WRITE) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, md);
    console.log(`Wrote ${path.relative(ROOT, OUT)} (${files.length} files indexed).`);
    return;
  }

  if (CHECK) {
    if (!fs.existsSync(OUT)) {
      console.error("docs/INDEX.md missing. Run with --write.");
      process.exit(1);
    }
    const existing = fs.readFileSync(OUT, "utf8");
    if (existing !== md) {
      console.error("docs/INDEX.md is out of date. Regenerate with --write.");
      process.exit(1);
    }
    console.log("File index is up to date.");
    return;
  }

  // Default to print to stdout (useful for quick preview)
  process.stdout.write(md);
}

main();
