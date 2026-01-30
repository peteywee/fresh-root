#!/usr/bin/env node
// [P1][DOCS][CODE] Validate docs YAML frontmatter metadata
// Tags: P1, DOCS, CODE, validation

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ALLOWED_CATEGORIES = new Set([
  "architecture",
  "guide",
  "standard",
  "reference",
  "decision",
  "report",
  "template",
  "archive",
]);

const ALLOWED_STATUSES = new Set(["active", "draft", "deprecated", "archived"]);

const ALLOWED_AUDIENCES = new Set([
  "developers",
  "operators",
  "architects",
  "ai-agents",
  "stakeholders",
  "teams",
]);

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  return {
    staged: flags.has("--staged"),
    all: flags.has("--all"),
    verbose: flags.has("--verbose"),
  };
}

function getStagedMarkdownDocs() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return output
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => p.startsWith("docs/") && p.endsWith(".md"));
}

function walkDocsMarkdownFiles() {
  const docsRoot = path.resolve("docs");
  /** @type {string[]} */
  const results = [];

  /** @param {string} dir */
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(path.relative(process.cwd(), abs));
      }
    }
  }

  walk(docsRoot);
  return results;
}

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n");
}

function extractFrontmatter(text) {
  const normalized = normalizeNewlines(text);
  const match = /^---\n([\s\S]*?)\n---\n/.exec(normalized);
  if (!match) return null;
  return {
    raw: match[1],
    after: normalized.slice(match[0].length),
  };
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseSimpleYamlFrontmatter(frontmatterRaw) {
  /** @type {Record<string, string | string[]>} */
  const data = {};
  const lines = frontmatterRaw.split("\n");
  /** @type {string | null} */
  let currentArrayKey = null;

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (!trimmed.trim() || trimmed.trimStart().startsWith("#")) continue;

    const keyMatch = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(trimmed);
    if (keyMatch) {
      const [, key, rest] = keyMatch;
      if (!rest) {
        currentArrayKey = key;
        data[key] = [];
      } else {
        currentArrayKey = null;
        data[key] = stripQuotes(rest);
      }
      continue;
    }

    const arrayItemMatch = /^\s{2}-\s+(.*)$/.exec(trimmed);
    if (arrayItemMatch && currentArrayKey) {
      const item = stripQuotes(arrayItemMatch[1]);
      const current = data[currentArrayKey];
      if (Array.isArray(current)) {
        current.push(item);
      } else {
        data[currentArrayKey] = [item];
      }
    }
  }

  return data;
}

function findFirstH1(afterFrontmatter) {
  const lines = normalizeNewlines(afterFrontmatter).split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("# ")) return t.slice(2).trim();
    return null;
  }
  return null;
}

function validateDoc(filePath, content, options) {
  /** @type {string[]} */
  const errors = [];

  const fm = extractFrontmatter(content);
  if (!fm) {
    errors.push("Missing YAML frontmatter (must start with '---' and end with '---').");
    return errors;
  }

  const parsed = parseSimpleYamlFrontmatter(fm.raw);

  const title = typeof parsed.title === "string" ? parsed.title : "";
  const description = typeof parsed.description === "string" ? parsed.description : "";
  const category = typeof parsed.category === "string" ? parsed.category : "";
  const status = typeof parsed.status === "string" ? parsed.status : "";
  const keywords = Array.isArray(parsed.keywords) ? parsed.keywords : null;
  const audience = Array.isArray(parsed.audience) ? parsed.audience : null;

  if (!title) errors.push("Missing required field: title");
  if (title && (title.length < 4 || title.length > 100)) {
    errors.push("title length must be 4-100 characters");
  }

  if (!description) errors.push("Missing required field: description");
  if (description && (description.length < 10 || description.length > 150)) {
    errors.push("description length must be 10-150 characters");
  }

  if (!keywords) {
    errors.push("Missing required field: keywords (YAML list)");
  } else {
    if (keywords.length < 3 || keywords.length > 10) {
      errors.push("keywords must include 3-10 entries");
    }
    for (const k of keywords) {
      if (!k) {
        errors.push("keywords entries must be non-empty strings");
        continue;
      }
      if (k !== k.toLowerCase()) {
        errors.push(`keyword '${k}' must be lowercase`);
      }
      if (/\s/.test(k)) {
        errors.push(`keyword '${k}' must not contain spaces`);
      }
    }
  }

  if (!category) errors.push("Missing required field: category");
  if (category && !ALLOWED_CATEGORIES.has(category)) {
    errors.push(`category must be one of: ${Array.from(ALLOWED_CATEGORIES).join(", ")}`);
  }

  if (!status) errors.push("Missing required field: status");
  if (status && !ALLOWED_STATUSES.has(status)) {
    errors.push(`status must be one of: ${Array.from(ALLOWED_STATUSES).join(", ")}`);
  }

  if (!audience) {
    errors.push("Missing required field: audience (YAML list)");
  } else {
    if (audience.length < 1) errors.push("audience must include at least 1 entry");
    for (const a of audience) {
      if (!ALLOWED_AUDIENCES.has(a)) {
        errors.push(`audience entry '${a}' is invalid (allowed: ${Array.from(ALLOWED_AUDIENCES).join(", ")})`);
      }
    }
  }

  const h1 = findFirstH1(fm.after);
  if (!h1) errors.push("Missing H1 header immediately after frontmatter ('# Title')");

  if (options.verbose && errors.length === 0) {
     
    console.log(`✅ ${filePath} ok`);
  }

  return errors;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if ((args.staged && args.all) || (!args.staged && !args.all)) {
     
    console.error("Usage: validate-docs-metadata.mjs --staged|--all [--verbose]");
    process.exit(1);
  }

  const files = args.staged ? getStagedMarkdownDocs() : walkDocsMarkdownFiles();

  if (files.length === 0) {
    process.exit(0);
  }

  /** @type {{file: string, errors: string[]}[]} */
  const failures = [];

  for (const filePath of files) {
    const abs = path.resolve(filePath);
    if (!fs.existsSync(abs)) continue;

    const content = fs.readFileSync(abs, "utf8");
    const errors = validateDoc(filePath, content, { verbose: args.verbose });
    if (errors.length > 0) failures.push({ file: filePath, errors });
  }

  if (failures.length > 0) {
     
    console.error("🚫 Docs metadata validation failed:\n");
    for (const f of failures) {
       
      console.error(`- ${f.file}`);
      for (const err of f.errors) {
         
        console.error(`    - ${err}`);
      }
    }

     
    console.error("\nFix: add/repair YAML frontmatter per docs/_METADATA_SCHEMA.md");
    process.exit(1);
  }
}

main();
