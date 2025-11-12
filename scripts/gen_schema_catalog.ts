// [P1][OBSERVABILITY][LOGGING] Gen Schema Catalog
// Tags: P1, OBSERVABILITY, LOGGING, VALIDATION
// scripts/gen_schema_catalog.ts
// Scans packages/types/src/** for exported Zod schemas and generates
// docs/blocks/SCHEMA_CATALOG.md with a stable table.
// No external deps beyond Node 18+ and tsx.
//
// Usage:
//   pnpm tsx scripts/gen_schema_catalog.ts
//
// Notes:
// - Detects `export const <Name>Schema = z.object({ ... })` and similar shapes.
// - Extracts best-effort top-level field names from the object literal.
// - Gracefully handles unions/arrays by marking Kind accordingly.

import { promises as fs } from "node:fs";
import path from "node:path";

const DOMAIN_ROOT = path.join(process.cwd(), "packages", "types", "src");
const OUTPUT_DIR = path.join(process.cwd(), "docs", "blocks");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "SCHEMA_CATALOG.md");

type Row = {
  schema: string;
  kind: "object" | "union" | "array" | "unknown";
  fields: string[]; // best-effort: top-level keys
  file: string; // relative path
};

async function* walk(dir: string): AsyncGenerator<string> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const d of dirents) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(full);
    else if (d.isFile() && d.name.endsWith(".ts")) yield full;
  }
}

function detectKind(source: string, schemaName: string): Row["kind"] {
  // Examine the initializer around the schema name.
  // Simple heuristics looking for z.object / z.union / z.array
  const re = new RegExp(`export\\s+const\\s+${schemaName}\\s*=\\s*z\\.(object|union|array)\\s*\\(`);
  const m = re.exec(source);
  if (!m) return "unknown";
  const k = m[1];
  if (k === "object") return "object";
  if (k === "union") return "union";
  if (k === "array") return "array";
  return "unknown";
}

function extractObjectFields(source: string, schemaName: string): string[] {
  // Best-effort: find `export const NameSchema = z.object({ ... })`
  // and grab top-level keys within the first object literal.
  const startRE = new RegExp(`export\\s+const\\s+${schemaName}\\s*=\\s*z\\.object\\s*\\(`);
  const start = startRE.exec(source)?.index;
  if (start == null) return [];

  // Find first `{` after the z.object( and attempt to capture until the matching `}`
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) return [];

  // Naive balance to find matching closing brace for top-level object literal.
  let i = braceStart;
  let depth = 0;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        // slice object literal
        const objectLiteral = source.slice(braceStart + 1, i);
        // Extract keys like: key: ..., "key": ..., ['key']: ...
        const keyRE = /(?<![A-Za-z0-9_])([A-Za-z_][A-Za-z0-9_]*)\s*:/g;
        const keys = new Set<string>();
        let m: RegExpExecArray | null;
        while ((m = keyRE.exec(objectLiteral)) !== null) {
          keys.add(m[1]);
        }
        return Array.from(keys).sort();
      }
    }
  }
  return [];
}

function findExportedSchemas(source: string): string[] {
  // Matches `export const <Name>Schema = z.<something>(`
  const re = /export\s+const\s+([A-Za-z0-9_]+Schema)\s*=\s*z\.\w+\s*\(/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    out.push(m[1]);
  }
  return out;
}

async function collectRows(): Promise<Row[]> {
  const rows: Row[] = [];
  for await (const file of walk(DOMAIN_ROOT)) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    const src = await fs.readFile(file, "utf8");
    const schemas = findExportedSchemas(src);
    for (const schema of schemas) {
      const kind = detectKind(src, schema);
      const fields = kind === "object" ? extractObjectFields(src, schema) : [];
      rows.push({ schema, kind, fields, file: rel });
    }
  }
  rows.sort((a, b) => a.schema.localeCompare(b.schema));
  return rows;
}

function render(rows: Row[]): string {
  const lines: string[] = [];
  lines.push("# Schema Catalog (generated)");
  lines.push("");
  lines.push(`_Generated: ${new Date().toISOString()}_`);
  lines.push("");
  lines.push("| Schema | Kind | Top-Level Fields | File |");
  lines.push("|---|---|---|---|");
  for (const r of rows) {
    const fieldList = r.fields.length ? r.fields.join(", ") : "—";
    lines.push(`| \`${r.schema}\` | \`${r.kind}\` | ${fieldList} | \`${r.file}\` |`);
  }
  lines.push("");
  lines.push("> To regenerate: `pnpm tsx scripts/gen_schema_catalog.ts`");
  return lines.join("\n");
}

async function main() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    // Guard: domain root must exist
    try {
      await fs.access(DOMAIN_ROOT);
    } catch {
      console.error(`ERROR: Domain root not found: ${DOMAIN_ROOT}`);
      process.exit(2);
    }
    const rows = await collectRows();
    const md = render(rows);
    await fs.writeFile(OUTPUT_FILE, md, "utf8");
    console.log(`Wrote ${OUTPUT_FILE} with ${rows.length} schemas.`);
  } catch (err) {
    console.error("Failed to generate Schema Catalog:", err);
    process.exit(1);
  }
}

main();
