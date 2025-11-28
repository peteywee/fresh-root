#!/usr/bin/env node
// [P2][APP][CODE] Gen Cognition Index
// Tags: P2, APP, CODE
/**
 * gen_cognition_index.mjs
 *
 * Generates machine-readable indexes for the Fresh Root / Fresh Schedules repo:
 * - docs/index/CODE_INDEX.json
 * - docs/index/DOMAIN_INDEX.json
 * - docs/index/RULES_INDEX.json
 * - docs/index/API_INDEX.json
 * - docs/index/UI_INDEX.json
 *
 * No external deps. Pure Node ESM.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();

const INDEX_DIR = path.join(ROOT, "docs", "index");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".turbo",
  ".next",
  "dist",
  "build",
  ".pnpm-store",
  ".vscode",
  ".idea",
  ".vercel",
]);

const CODE_FILE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md"]);

/**
 * Recursively walk a directory and return all files.
 */
async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT, fullPath);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      files.push(...(await walkDir(fullPath)));
    } else if (entry.isFile()) {
      files.push({ fullPath, relPath });
    }
  }

  return files;
}

/**
 * Convert a path to posix-style (for JSON).
 */
function toPosix(p) {
  return p.split(path.sep).join("/");
}

/**
 * Classify a file into a "layer" based on path.
 * Layers: domain, api, ui, docs, infra, other
 */
function classifyLayer(relPath) {
  const p = toPosix(relPath);

  if (p.startsWith("packages/types")) return "domain";
  if (p.startsWith("services/api")) return "api";
  if (p.startsWith("apps/web/app") || p.startsWith("apps/web/src/app")) return "ui";
  if (p.startsWith("docs/")) return "docs";
  if (
    p.startsWith(".github/") ||
    p.startsWith("scripts/") ||
    p.startsWith("config/") ||
    p.startsWith("infra/")
  ) {
    return "infra";
  }

  return "other";
}

/**
 * Rough heuristic to infer "domain" based on path segments.
 * This is intentionally simple; you can refine later.
 */
function inferDomain(relPath) {
  const p = toPosix(relPath).toLowerCase();

  const domains = new Set();

  if (p.includes("onboard")) domains.add("onboarding");
  if (p.includes("schedule")) domains.add("scheduling");
  if (p.includes("labor")) domains.add("labor-planning");
  if (p.includes("rbac") || p.includes("auth")) domains.add("rbac-auth");
  if (p.includes("org") || p.includes("tenant")) domains.add("organizations");
  if (p.includes("user") || p.includes("staff")) domains.add("staffing");

  return Array.from(domains);
}

/**
 * Infer tags for a path.
 */
function inferTags(relPath) {
  const p = toPosix(relPath);
  const lower = p.toLowerCase();
  const tags = new Set();

  const ext = path.extname(p);
  if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
    tags.add("code");
  }
  if (ext === ".md") {
    tags.add("doc");
  }
  if (ext === ".json") {
    tags.add("config");
  }

  if (p.startsWith("apps/web/app") || p.startsWith("apps/web/src/app")) {
    if (lower.includes("page.")) tags.add("page");
    if (lower.includes("layout.")) tags.add("layout");
    if (lower.includes("route.")) tags.add("route-handler");
  }

  if (p.startsWith("apps/web")) {
    if (p.includes("/components/")) tags.add("component");
    if (p.includes("/hooks/")) tags.add("hook");
  }

  if (p.startsWith("services/api")) {
    if (p.includes("/routes/")) tags.add("route");
    if (p.includes("/handlers/")) tags.add("handler");
  }

  if (p.startsWith("packages/types")) {
    tags.add("schema");
    if (lower.includes("schema")) tags.add("schema-def");
    if (lower.includes("zod")) tags.add("zod");
  }

  if (p.startsWith("docs/standards")) tags.add("standard");
  if (p.startsWith("docs/bible")) tags.add("bible");

  return Array.from(tags);
}

/**
 * Build CODE_INDEX.json
 */
async function buildCodeIndex() {
  const allFiles = await walkDir(ROOT);
  const entries = [];

  for (const { fullPath, relPath } of allFiles) {
    const ext = path.extname(relPath);
    if (!CODE_FILE_EXTS.has(ext)) continue;

    const stat = await fs.stat(fullPath);
    const layer = classifyLayer(relPath);
    const domains = inferDomain(relPath);
    const tags = inferTags(relPath);

    entries.push({
      path: toPosix(relPath),
      layer,
      domain: domains,
      tags,
      lastModified: stat.mtime.toISOString(),
    });
  }

  const index = {
    generatedAt: new Date().toISOString(),
    root: path.basename(ROOT),
    entries,
  };

  await fs.mkdir(INDEX_DIR, { recursive: true });
  const outPath = path.join(INDEX_DIR, "CODE_INDEX.json");
  await fs.writeFile(outPath, JSON.stringify(index, null, 2) + "\n", "utf8");
  console.log(`[cognition:index] Wrote CODE_INDEX.json (${entries.length} entries)`);

  return index;
}

/**
 * Build DOMAIN_INDEX.json from CODE_INDEX.
 */
async function buildDomainIndex(codeIndex) {
  const domainEntries = codeIndex.entries.filter(
    (e) => e.layer === "domain" || (e.tags || []).includes("schema"),
  );

  const transformed = domainEntries.map((e) => ({
    path: e.path,
    domain: e.domain,
    tags: e.tags,
  }));

  const index = {
    generatedAt: new Date().toISOString(),
    count: transformed.length,
    entries: transformed,
  };

  const outPath = path.join(INDEX_DIR, "DOMAIN_INDEX.json");
  await fs.writeFile(outPath, JSON.stringify(index, null, 2) + "\n", "utf8");
  console.log(`[cognition:index] Wrote DOMAIN_INDEX.json (${transformed.length} entries)`);
}

/**
 * Build RULES_INDEX.json by scanning docs for lines like:
 * R-101 [LAW]
 */
async function buildRulesIndex() {
  const rules = [];

  const docsDirs = [path.join(ROOT, "docs", "standards"), path.join(ROOT, "docs", "bible")];

  for (const dir of docsDirs) {
    let exists = false;
    try {
      const stat = await fs.stat(dir);
      exists = stat.isDirectory();
    } catch {
      // ignore
    }
    if (!exists) continue;

    const allFiles = await walkDir(dir);
    for (const { fullPath, relPath } of allFiles) {
      if (!relPath.endsWith(".md")) continue;

      const content = await fs.readFile(fullPath, "utf8");
      const lines = content.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const m = line.match(/^R-(\d+)\s+\[(LAW|GUIDELINE|PREFERENCE)\]/i);
        if (m) {
          const ruleId = `R-${m[1]}`;
          const level = m[2].toUpperCase();
          // Next non-empty line as description (best-effort)
          let description = "";
          for (let j = i + 1; j < lines.length; j++) {
            const d = lines[j].trim();
            if (d.length > 0) {
              description = d;
              break;
            }
          }
          rules.push({
            ruleId,
            level,
            file: toPosix(path.relative(ROOT, fullPath)),
            line: i + 1,
            description,
          });
        }
      }
    }
  }

  const index = {
    generatedAt: new Date().toISOString(),
    count: rules.length,
    rules,
  };

  const outPath = path.join(INDEX_DIR, "RULES_INDEX.json");
  await fs.writeFile(outPath, JSON.stringify(index, null, 2) + "\n", "utf8");
  console.log(`[cognition:index] Wrote RULES_INDEX.json (${rules.length} rules)`);
}

/**
 * Build API_INDEX.json using CODE_INDEX + simple heuristics for routes.
 */
async function buildApiIndex(codeIndex) {
  const apiCandidates = codeIndex.entries.filter(
    (e) =>
      e.layer === "api" || (e.path.startsWith("services/api") && (e.tags || []).includes("route")),
  );

  const routes = [];

  for (const entry of apiCandidates) {
    const fullPath = path.join(ROOT, entry.path);
    let content;
    try {
      content = await fs.readFile(fullPath, "utf8");
    } catch {
      continue;
    }

    let httpMethod = "UNKNOWN";
    let url = null;

    // Try to detect explicit method exports: export const method = "POST"
    const methodMatch = content.match(
      /export\s+const\s+method\s*=\s*["'`](GET|POST|PUT|PATCH|DELETE)["'`]/i,
    );
    if (methodMatch) {
      httpMethod = methodMatch[1].toUpperCase();
    } else {
      // Fallback: infer from filename
      const lower = entry.path.toLowerCase();
      if (lower.includes("create") || lower.includes("post")) httpMethod = "POST";
      else if (lower.includes("update") || lower.includes("patch")) httpMethod = "PATCH";
      else if (lower.includes("delete") || lower.includes("remove")) httpMethod = "DELETE";
      else if (lower.includes("get") || lower.includes("list")) httpMethod = "GET";
    }

    // Try to find a likely /api/... URL in the file
    const urlMatch = content.match(/["'`](\/api\/[a-zA-Z0-9\-\/{}:_]+)["'`]/);
    if (urlMatch) {
      url = urlMatch[1];
    }

    const feature = entry.domain && entry.domain.length > 0 ? entry.domain[0] : null;

    routes.push({
      path: entry.path,
      httpMethod,
      url,
      feature,
      tags: entry.tags,
    });
  }

  const index = {
    generatedAt: new Date().toISOString(),
    count: routes.length,
    routes,
  };

  const outPath = path.join(INDEX_DIR, "API_INDEX.json");
  await fs.writeFile(outPath, JSON.stringify(index, null, 2) + "\n", "utf8");
  console.log(`[cognition:index] Wrote API_INDEX.json (${routes.length} routes)`);
}

/**
 * Build UI_INDEX.json using CODE_INDEX.
 */
async function buildUiIndex(codeIndex) {
  const uiCandidates = codeIndex.entries.filter(
    (e) => e.layer === "ui" || e.path.startsWith("apps/web"),
  );

  const pages = [];

  for (const entry of uiCandidates) {
    const features = entry.tags ? entry.tags.split("|").slice(0, 3) : [];

    const route = {
      path: entry.path,
      features: features,
    };

    pages.push(route);
  }

  const index = {
    generatedAt: new Date().toISOString(),
    count: pages.length,
    pages,
  };

  const outPath = path.join(INDEX_DIR, "UI_INDEX.json");
  await fs.writeFile(outPath, JSON.stringify(index, null, 2) + "\n", "utf8");
  console.log(`[cognition:index] Wrote UI_INDEX.json (${pages.length} pages)`);
}
