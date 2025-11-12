// [P1][OBSERVABILITY][LOGGING] Gen Api Catalog
// Tags: P1, OBSERVABILITY, LOGGING
// scripts/gen_api_catalog.ts
// Generate docs/blocks/BLOCK3_API_REFERENCE.md without ripgrep.
// Scans Next.js app router handlers under apps/web/app/api/**/route.ts,
// extracts exported HTTP methods, and emits a Markdown table.
//
// Usage:
//   pnpm tsx scripts/gen_api_catalog.ts
//
// Requirements:
//   - Node 18+
//   - dev dep: tsx (pnpm add -D tsx)
//
// Exit code 0 on success; non-zero on error.

import { promises as fs } from "node:fs";
import * as path from "node:path";

type RouteEntry = {
  endpoint: string;
  file: string;
  methods: string[];
};

const API_ROOT = path.join(process.cwd(), "apps", "web", "app", "api");
const OUTPUT_DIR = path.join(process.cwd(), "docs", "blocks");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "BLOCK3_API_REFERENCE.md");

// Regex to match: export const GET = / export const POST =  etc.
const METHOD_RE = /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*=/g;

async function* walk(dir: string): AsyncGenerator<string> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const d of dirents) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) {
      yield* walk(full);
    } else if (d.isFile()) {
      yield full;
    }
  }
}

function toEndpoint(file: string): string {
  // file: {root}/apps/web/app/api/<endpoint>/route.ts
  const rel = path.relative(API_ROOT, file).replace(/\\/g, "/"); // normalize
  // remove trailing '/route.ts'
  if (!rel.endsWith("/route.ts")) return "";
  const ep = rel.slice(0, -"/route.ts".length);
  return "/api/" + ep; // prepend /api
}

async function collectRoutes(): Promise<RouteEntry[]> {
  const entries: RouteEntry[] = [];
  for await (const file of walk(API_ROOT)) {
    if (!file.endsWith("/route.ts")) continue;
    const endpoint = toEndpoint(file);
    if (!endpoint) continue;

    const content = await fs.readFile(file, "utf8");
    const methodsSet = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = METHOD_RE.exec(content)) !== null) {
      methodsSet.add(m[1].toUpperCase());
    }
    if (methodsSet.size === 0) methodsSet.add("(none-found)");

    entries.push({
      endpoint,
      file: path.relative(process.cwd(), file).replace(/\\/g, "/"),
      methods: Array.from(methodsSet).sort(),
    });
  }

  // Sort by endpoint for stable output
  entries.sort((a, b) => a.endpoint.localeCompare(b.endpoint));
  return entries;
}

function renderMarkdown(entries: RouteEntry[]): string {
  const lines: string[] = [];
  lines.push("# API Reference – Next.js App Router (generated)");
  lines.push("");
  const now = new Date();
  lines.push(`_Generated: ${now.toISOString()}_`);
  lines.push("");
  lines.push("| Endpoint | Methods | File |");
  lines.push("|---|---|---|");
  for (const e of entries) {
    lines.push(`| ${e.endpoint} | ${e.methods.join(", ")} | ${e.file} |`);
  }
  lines.push("");
  lines.push("> To regenerate: `pnpm tsx scripts/gen_api_catalog.ts`");
  return lines.join("\n");
}

async function main() {
  try {
    // Ensure output dir
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Guard if API root is missing
    try {
      await fs.access(API_ROOT);
    } catch {
      console.error(`ERROR: API root not found: ${API_ROOT}`);
      process.exit(2);
    }

    const entries = await collectRoutes();
    const md = renderMarkdown(entries);
    await fs.writeFile(OUTPUT_FILE, md, "utf8");
    console.log(`Wrote ${OUTPUT_FILE} with ${entries.length} endpoints.`);
  } catch (err) {
    console.error("Failed to generate API catalog:", err);
    process.exit(1);
  }
}

main();
