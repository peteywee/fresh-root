/**
 * FRESH SCHEDULES - GPT-Compatible REST API
 * 
 * This wraps the same tools as the MCP server but exposes them
 * as REST endpoints that GPT Custom Actions can call.
 * 
 * Run with: pnpm start:gpt
 */

import express from "express";
import cors from "cors";
import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";
import { glob } from "glob";

// =============================================================================
// CONFIGURATION
// =============================================================================

const app = express();
const PORT = process.env.PORT || 3001;
const REPO_ROOT = process.env.FRESH_SCHEDULES_ROOT || process.cwd();
const MAX_DEPTH = 5;
const CHARACTER_LIMIT = 50000;
const INDEX_FILE = "REPO_INDEX.md";
const MINI_INDEX_FILE = "_INDEX.md";
const IGNORE_DIRS = ["node_modules", "dist", ".git", ".next", "coverage", ".turbo"];

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// =============================================================================
// HELPERS
// =============================================================================

function truncate(content: string, limit = CHARACTER_LIMIT): string {
  if (content.length <= limit) return content;
  const half = Math.floor(limit / 2) - 50;
  return `${content.slice(0, half)}\n\n... [TRUNCATED] ...\n\n${content.slice(-half)}`;
}

async function exists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

function getDepth(relativePath: string): number {
  return relativePath.split(path.sep).filter(Boolean).length;
}

function isPathSafe(targetPath: string): boolean {
  const resolved = path.resolve(REPO_ROOT, targetPath);
  return resolved.startsWith(REPO_ROOT) && getDepth(targetPath) <= MAX_DEPTH;
}

function runCmd(cmd: string): { ok: boolean; out: string } {
  try {
    const out = execSync(cmd, { cwd: REPO_ROOT, encoding: "utf-8", timeout: 60000 });
    return { ok: true, out };
  } catch (e: any) {
    return { ok: false, out: e.stdout || e.stderr || e.message || "Failed" };
  }
}

function respond(res: express.Response, success: boolean, data: any) {
  res.json({ success, data });
}

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get("/", (req, res) => {
  res.json({ 
    name: "Fresh Schedules GPT API",
    version: "2.0.0",
    repo: REPO_ROOT,
    endpoints: [
      "GET  /file/:path",
      "POST /file",
      "PUT  /file",
      "DELETE /file",
      "POST /folder",
      "GET  /list/:path?",
      "GET  /search",
      "GET  /schema/:name",
      "GET  /index/:path?",
      "POST /index",
      "POST /test",
      "POST /run"
    ]
  });
});

// READ FILE
app.get("/file/*", async (req, res) => {
  const filePath = req.params[0];
  const { startLine, endLine } = req.query;
  
  if (!isPathSafe(filePath)) {
    return respond(res, false, "Path outside repo or too deep");
  }

  const fullPath = path.join(REPO_ROOT, filePath);
  if (!await exists(fullPath)) {
    return respond(res, false, `File not found: ${filePath}`);
  }

  try {
    let content = await fs.readFile(fullPath, "utf-8");
    
    if (startLine || endLine) {
      const lines = content.split("\n");
      const start = (Number(startLine) || 1) - 1;
      const end = Number(endLine) || lines.length;
      content = lines.slice(start, end).map((l, i) => `${start + i + 1}: ${l}`).join("\n");
    }

    respond(res, true, truncate(content));
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// CREATE FILE
app.post("/file", async (req, res) => {
  const { path: filePath, content, overwrite } = req.body;
  
  if (!filePath || content === undefined) {
    return respond(res, false, "Missing path or content");
  }
  
  if (!isPathSafe(filePath)) {
    return respond(res, false, "Path outside repo or too deep");
  }

  const fullPath = path.join(REPO_ROOT, filePath);
  
  if (await exists(fullPath) && !overwrite) {
    return respond(res, false, "File exists. Set overwrite=true to replace");
  }

  try {
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
    respond(res, true, `Created: ${filePath} (${content.length} bytes)`);
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// UPDATE FILE
app.put("/file", async (req, res) => {
  const { path: filePath, search, replace, content } = req.body;
  
  if (!filePath) {
    return respond(res, false, "Missing path");
  }
  
  if (!isPathSafe(filePath)) {
    return respond(res, false, "Path outside repo or too deep");
  }

  const fullPath = path.join(REPO_ROOT, filePath);
  if (!await exists(fullPath)) {
    return respond(res, false, `File not found: ${filePath}`);
  }

  try {
    if (content !== undefined) {
      await fs.writeFile(fullPath, content, "utf-8");
      return respond(res, true, `Replaced: ${filePath}`);
    }

    if (search && replace !== undefined) {
      const current = await fs.readFile(fullPath, "utf-8");
      if (!current.includes(search)) {
        return respond(res, false, "Search text not found");
      }
      await fs.writeFile(fullPath, current.replace(search, replace), "utf-8");
      return respond(res, true, `Updated: ${filePath}`);
    }

    respond(res, false, "Provide content or search+replace");
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// DELETE FILE
app.delete("/file", async (req, res) => {
  const { path: filePath, confirm } = req.body;
  
  if (!confirm) {
    return respond(res, false, "Set confirm=true to delete");
  }
  
  if (!isPathSafe(filePath)) {
    return respond(res, false, "Path outside repo");
  }

  const fullPath = path.join(REPO_ROOT, filePath);
  if (!await exists(fullPath)) {
    return respond(res, false, "File not found");
  }

  try {
    await fs.unlink(fullPath);
    respond(res, true, `Deleted: ${filePath}`);
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// CREATE FOLDER
app.post("/folder", async (req, res) => {
  const { path: dirPath, withIndex = true } = req.body;
  
  if (!isPathSafe(dirPath)) {
    return respond(res, false, "Path too deep");
  }

  const fullPath = path.join(REPO_ROOT, dirPath);

  try {
    await fs.mkdir(fullPath, { recursive: true });
    
    if (withIndex) {
      const indexContent = `# ${path.basename(dirPath)}\n\n> Created: ${new Date().toISOString()}\n`;
      await fs.writeFile(path.join(fullPath, MINI_INDEX_FILE), indexContent);
    }

    respond(res, true, `Created folder: ${dirPath}${withIndex ? " (with index)" : ""}`);
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// LIST DIRECTORY
app.get("/list/*?", async (req, res) => {
  const dirPath = req.params[0] || ".";
  const depth = Number(req.query.depth) || 2;
  
  const fullPath = path.join(REPO_ROOT, dirPath);
  if (!await exists(fullPath)) {
    return respond(res, false, `Directory not found: ${dirPath}`);
  }

  try {
    const files = await glob("**/*", {
      cwd: fullPath,
      maxDepth: depth,
      ignore: IGNORE_DIRS.map(d => `${d}/**`)
    });
    
    respond(res, true, {
      path: dirPath,
      count: files.length,
      files: files.sort().slice(0, 200)
    });
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// SEARCH CODE
app.get("/search", async (req, res) => {
  const { query, path: searchPath = ".", pattern = "**/*.{ts,tsx,js,jsx}", max = "30" } = req.query;
  
  if (!query || typeof query !== "string" || query.length < 2) {
    return respond(res, false, "Query must be at least 2 characters");
  }

  const fullPath = path.join(REPO_ROOT, searchPath as string);

  try {
    const files = await glob(pattern as string, {
      cwd: fullPath,
      ignore: IGNORE_DIRS.map(d => `${d}/**`)
    });

    const results: string[] = [];
    const regex = new RegExp(query, "gi");
    const maxResults = Number(max);

    for (const file of files) {
      if (results.length >= maxResults) break;
      
      const content = await fs.readFile(path.join(fullPath, file), "utf-8");
      const lines = content.split("\n");
      
      lines.forEach((line, i) => {
        if (regex.test(line) && results.length < maxResults) {
          results.push(`${file}:${i + 1}: ${line.trim().slice(0, 100)}`);
        }
        regex.lastIndex = 0;
      });
    }

    respond(res, true, { 
      query, 
      count: results.length, 
      results 
    });
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// GET SCHEMA
app.get("/schema/:name", async (req, res) => {
  const { name } = req.params;
  const schemasDir = path.join(REPO_ROOT, "packages/types/src/schemas");
  
  const possibleFiles = [
    `${name.toLowerCase()}.schema.ts`,
    `${name.toLowerCase()}.ts`,
    `${name}.schema.ts`,
    `${name}.ts`
  ];

  for (const file of possibleFiles) {
    const fullPath = path.join(schemasDir, file);
    if (await exists(fullPath)) {
      const content = await fs.readFile(fullPath, "utf-8");
      return respond(res, true, { file, content });
    }
  }

  try {
    const files = await glob("*.ts", { cwd: schemasDir });
    respond(res, false, { 
      message: `Schema "${name}" not found`,
      available: files 
    });
  } catch {
    respond(res, false, `Schema not found: ${name}`);
  }
});

// GET INDEX
app.get("/index/*?", async (req, res) => {
  const dirPath = req.params[0] || ".";
  const indexFile = dirPath === "."
    ? path.join(REPO_ROOT, INDEX_FILE)
    : path.join(REPO_ROOT, dirPath, MINI_INDEX_FILE);

  if (!await exists(indexFile)) {
    return respond(res, false, "Index not found. POST /index to create");
  }

  try {
    const content = await fs.readFile(indexFile, "utf-8");
    respond(res, true, content);
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// UPDATE INDEX
app.post("/index", async (req, res) => {
  const { path: dirPath = ".", depth = 3 } = req.body;
  
  try {
    const fullPath = path.join(REPO_ROOT, dirPath);
    const files = await glob("**/*", {
      cwd: fullPath,
      maxDepth: depth,
      ignore: IGNORE_DIRS.map(d => `${d}/**`)
    });

    const fileList = files.filter(f => !f.includes("/")).slice(0, 50);
    const dirs = [...new Set(files.map(f => f.split("/")[0]))].filter(d => !fileList.includes(d));

    const content = `# Index: ${dirPath || "Repository Root"}

> Auto-generated: ${new Date().toISOString()}
> Files: ${files.length}

## Directories
${dirs.map(d => `- ${d}/`).join("\n")}

## Files (top level)
${fileList.map(f => `- ${f}`).join("\n")}
`;

    const indexFile = dirPath === "."
      ? path.join(REPO_ROOT, INDEX_FILE)
      : path.join(REPO_ROOT, dirPath, MINI_INDEX_FILE);
    
    await fs.writeFile(indexFile, content, "utf-8");
    
    respond(res, true, { 
      message: `Updated index: ${dirPath === "." ? INDEX_FILE : `${dirPath}/${MINI_INDEX_FILE}`}`,
      files: files.length 
    });
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// CREATE TEST
app.post("/test", async (req, res) => {
  const { sourcePath, testType = "unit" } = req.body;
  
  const fullPath = path.join(REPO_ROOT, sourcePath);
  if (!await exists(fullPath)) {
    return respond(res, false, `Source not found: ${sourcePath}`);
  }

  try {
    const source = await fs.readFile(fullPath, "utf-8");
    const fileName = path.basename(sourcePath, path.extname(sourcePath));
    const ext = path.extname(sourcePath);
    
    const exports = source.match(/export\s+(const|function|class)\s+(\w+)/g) || [];
    const exportNames = exports.map(e => e.replace(/export\s+(const|function|class)\s+/, ""));

    let testPath: string;
    let testContent: string;

    if (testType === "rules") {
      testPath = `tests/rules/${fileName}.test.ts`;
      testContent = `import { describe, it } from "vitest";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

describe("Firestore Rules: ${fileName}", () => {
  it.todo("should allow read for same org");
  it.todo("should deny read for different org");
  it.todo("should deny for unauthenticated");
});`;
    } else if (testType === "e2e") {
      testPath = `tests/e2e/${fileName}.spec.ts`;
      testContent = `import { test, expect } from "@playwright/test";

test.describe("${fileName}", () => {
  test("should load", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Fresh Schedules/);
  });
});`;
    } else {
      testPath = path.join(path.dirname(sourcePath), "__tests__", `${fileName}.test${ext}`);
      testContent = `import { describe, it, expect } from "vitest";

describe("${fileName}", () => {
${exportNames.map(e => `  it("${e} should exist", () => {
    // TODO: test ${e}
  });`).join("\n\n")}
});`;
    }

    const fullTestPath = path.join(REPO_ROOT, testPath);
    await fs.mkdir(path.dirname(fullTestPath), { recursive: true });
    await fs.writeFile(fullTestPath, testContent, "utf-8");

    respond(res, true, { 
      testPath, 
      exports: exportNames 
    });
  } catch (e) {
    respond(res, false, `Error: ${e}`);
  }
});

// RUN COMMAND
app.post("/run", async (req, res) => {
  const { command } = req.body;
  
  const cmds: Record<string, string> = {
    typecheck: "pnpm typecheck",
    lint: "pnpm lint:check",
    "lint:fix": "pnpm lint --fix",
    format: "pnpm format",
    "format:check": "pnpm format:check",
    "test:unit": "pnpm test:unit",
    "test:rules": "pnpm test:rules",
    build: "pnpm build",
    validate: "pnpm validate:patterns"
  };

  if (!cmds[command]) {
    return respond(res, false, { 
      message: "Unknown command",
      available: Object.keys(cmds)
    });
  }

  const result = runCmd(cmds[command]);
  respond(res, result.ok, truncate(result.out));
});

// =============================================================================
// START
// =============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Fresh Schedules GPT API running on http://localhost:${PORT}`);
  console.log(`📁 Repo root: ${REPO_ROOT}`);
});
