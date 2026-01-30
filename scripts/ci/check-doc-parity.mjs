#!/usr/bin/env node
// [P1][DOCS][CI] Documentation-to-code parity check
// Tags: P1, DOCS, CI, PARITY
import { promises as fs } from "node:fs";
import path from "node:path";
import { globby } from "globby";

const ROOT = process.cwd();
const API_ROOT = path.join(ROOT, "apps", "web", "app", "api");
const SCHEMA_ROOT = path.join(ROOT, "packages", "types", "src");
const DOCS_API_ROOT = path.join(ROOT, "docs", "api");
const DOCS_SCHEMA_ROOT = path.join(ROOT, "docs", "schemas");
const MAP_PATH = path.join(ROOT, "docs", "parity-map.json");

function toApiDocPath(routeFile) {
  const rel = path.relative(API_ROOT, routeFile);
  const withoutRoute = rel.replace(/\/route\.ts$/, "");
  const parts = withoutRoute.split(path.sep).filter(Boolean);
  return path.join(DOCS_API_ROOT, `${parts.join("/")}.md`);
}

function toSchemaDocPath(schemaFile) {
  const rel = path.relative(SCHEMA_ROOT, schemaFile);
  return path.join(DOCS_SCHEMA_ROOT, rel.replace(/\.ts$/, ".md"));
}

function globToRegExp(glob) {
  if (glob.length > 200) {
    throw new Error(`Glob pattern too long: ${glob}`);
  }
  const globStarToken = "__GLOBSTAR__";
  const globToken = "__GLOB__";
  const tokenized = glob.replace(/\*\*/g, globStarToken).replace(/\*/g, globToken);
  const escaped = tokenized.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");
  const withGlobStar = escaped.replaceAll(globStarToken, ".*");
  const withGlob = withGlobStar.replaceAll(globToken, "[^/]*");
  // nosemgrep: glob patterns are repository-controlled, not user input
  return new RegExp(`^${withGlob}$`);
}

function matchesAny(patterns, target) {
  return patterns.some((pattern) => globToRegExp(pattern).test(target));
}

async function loadMapping() {
  try {
    const raw = await fs.readFile(MAP_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resolveMappedDoc(mapping, type, sourcePath) {
  if (!mapping || !Array.isArray(mapping[type])) return null;
  for (const entry of mapping[type]) {
    const patterns = entry[type === "api" ? "routes" : "schemas"] || [];
    if (matchesAny(patterns, sourcePath)) {
      return entry.doc;
    }
  }
  return null;
}

async function fileHasTestSpec(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return /TEST SPEC/i.test(content);
}

async function main() {
  const mapping = await loadMapping();
  const apiRoutes = await globby(["apps/web/app/api/**/route.ts"], { gitignore: true });
  const schemas = await globby(["packages/types/src/**/*.ts"], {
    gitignore: true,
    ignore: ["**/index.ts", "**/*.d.ts", "**/*.test.ts"],
  });

  const missingDocs = [];
  const missingTestSpecs = [];

  for (const route of apiRoutes) {
    const mapped = resolveMappedDoc(mapping, "api", route);
    const docPath = mapped ? path.join(ROOT, mapped) : toApiDocPath(path.join(ROOT, route));
    try {
      await fs.access(docPath);
      if (!(await fileHasTestSpec(docPath))) {
        missingTestSpecs.push(path.relative(ROOT, docPath));
      }
    } catch {
      missingDocs.push({
        type: "api",
        source: route,
        expectedDoc: path.relative(ROOT, docPath),
      });
    }
  }

  for (const schema of schemas) {
    const mapped = resolveMappedDoc(mapping, "schemas", schema);
    const docPath = mapped ? path.join(ROOT, mapped) : toSchemaDocPath(path.join(ROOT, schema));
    try {
      await fs.access(docPath);
      if (!(await fileHasTestSpec(docPath))) {
        missingTestSpecs.push(path.relative(ROOT, docPath));
      }
    } catch {
      missingDocs.push({
        type: "schema",
        source: schema,
        expectedDoc: path.relative(ROOT, docPath),
      });
    }
  }

  console.log("Doc parity check");
  console.log("API routes:", apiRoutes.length);
  console.log("Schemas:", schemas.length);
  console.log("Missing docs:", missingDocs.length);
  console.log("Docs missing TEST SPEC:", missingTestSpecs.length);

  if (missingDocs.length) {
    console.log("\nMissing docs (first 50):");
    for (const item of missingDocs.slice(0, 50)) {
      console.log(`- [${item.type}] ${item.source} -> ${item.expectedDoc}`);
    }
  }

  if (missingTestSpecs.length) {
    console.log("\nDocs missing TEST SPEC (first 50):");
    for (const doc of missingTestSpecs.slice(0, 50)) {
      console.log(`- ${doc}`);
    }
  }

  if (missingDocs.length || missingTestSpecs.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
