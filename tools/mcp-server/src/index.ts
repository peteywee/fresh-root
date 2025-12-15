/**
 * FRESH SCHEDULES MCP SERVER
 * 
 * Full repo management with:
 * - File CRUD (create, read, update, delete)
 * - Folder management (5 levels max)
 * - Index system (main + mini-indexes)
 * - Test generation
 * - Pattern validation
 * 
 * @version 2.0.0
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";
import { glob } from "glob";

// =============================================================================
// CONFIGURATION
// =============================================================================

const REPO_ROOT = process.env.FRESH_SCHEDULES_ROOT || process.cwd();
const MAX_DEPTH = 5;
const CHARACTER_LIMIT = 50000;
const INDEX_FILE = "REPO_INDEX.md";
const MINI_INDEX_FILE = "_INDEX.md";

// Directories to always ignore
const IGNORE_DIRS = ["node_modules", "dist", ".git", ".next", "coverage", ".turbo"];

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

const server = new McpServer({
  name: "fresh-schedules-mcp-server",
  version: "2.0.0"
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function truncate(content: string, limit = CHARACTER_LIMIT): string {
  if (content.length <= limit) return content;
  const half = Math.floor(limit / 2) - 50;
  return `${content.slice(0, half)}\n\n... [TRUNCATED ${content.length - limit} chars] ...\n\n${content.slice(-half)}`;
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function isDir(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
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

// =============================================================================
// INDEX SYSTEM
// =============================================================================

interface FileEntry {
  path: string;
  type: "file" | "dir";
  size?: number;
  description?: string;
  exports?: string[];
}

async function scanDirectory(dirPath: string, maxDepth = 3): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  const fullPath = path.join(REPO_ROOT, dirPath);
  
  async function scan(currentPath: string, depth: number) {
    if (depth > maxDepth) return;
    
    const items = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      if (IGNORE_DIRS.includes(item.name) || item.name.startsWith(".")) continue;
      
      const itemPath = path.join(currentPath, item.name);
      const relativePath = path.relative(REPO_ROOT, itemPath);
      
      if (item.isDirectory()) {
        entries.push({ path: relativePath, type: "dir" });
        await scan(itemPath, depth + 1);
      } else {
        const stat = await fs.stat(itemPath);
        const entry: FileEntry = {
          path: relativePath,
          type: "file",
          size: stat.size
        };
        
        // Extract exports from TypeScript files
        if (item.name.endsWith(".ts") || item.name.endsWith(".tsx")) {
          try {
            const content = await fs.readFile(itemPath, "utf-8");
            const exports = content.match(/export\s+(const|function|class|type|interface|enum)\s+(\w+)/g);
            if (exports) {
              entry.exports = exports.map(e => e.replace(/export\s+(const|function|class|type|interface|enum)\s+/, ""));
            }
          } catch { /* ignore read errors */ }
        }
        
        entries.push(entry);
      }
    }
  }
  
  await scan(fullPath, 0);
  return entries;
}

function generateIndexContent(dirPath: string, entries: FileEntry[]): string {
  const timestamp = new Date().toISOString();
  const dirs = entries.filter(e => e.type === "dir");
  const files = entries.filter(e => e.type === "file");
  
  let content = `# Index: ${dirPath || "Repository Root"}

> Auto-generated: ${timestamp}  
> Files: ${files.length} | Directories: ${dirs.length}

## Structure

\`\`\`
${dirPath || "."}
`;

  // Build tree
  const tree: Map<string, FileEntry[]> = new Map();
  for (const entry of entries) {
    const parent = path.dirname(entry.path);
    if (!tree.has(parent)) tree.set(parent, []);
    tree.get(parent)!.push(entry);
  }

  function renderTree(dir: string, indent = ""): string {
    let result = "";
    const items = tree.get(dir) || [];
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.path.localeCompare(b.path);
    });
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const isLast = i === items.length - 1;
      const prefix = isLast ? "└── " : "├── ";
      const name = path.basename(item.path);
      
      if (item.type === "dir") {
        result += `${indent}${prefix}${name}/\n`;
        result += renderTree(item.path, indent + (isLast ? "    " : "│   "));
      } else {
        result += `${indent}${prefix}${name}\n`;
      }
    }
    return result;
  }

  content += renderTree(dirPath || ".");
  content += `\`\`\`

## Files

| File | Size | Exports |
|------|------|---------|
`;

  for (const file of files.slice(0, 100)) {
    const name = path.basename(file.path);
    const size = file.size ? `${Math.round(file.size / 1024)}KB` : "-";
    const exports = file.exports?.slice(0, 5).join(", ") || "-";
    content += `| \`${name}\` | ${size} | ${exports} |\n`;
  }

  if (files.length > 100) {
    content += `\n*... and ${files.length - 100} more files*\n`;
  }

  return content;
}

// =============================================================================
// TOOL: READ FILE
// =============================================================================

server.registerTool(
  "fs_read_file",
  {
    title: "Read File",
    description: `Read a file from the repository.

Args:
  - path: Relative path from repo root
  - startLine: Optional start line (1-indexed)
  - endLine: Optional end line

Returns: File contents`,
    inputSchema: z.object({
      path: z.string().describe("Relative path from repo root"),
      startLine: z.number().int().min(1).optional(),
      endLine: z.number().int().min(1).optional()
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ path: filePath, startLine, endLine }) => {
    if (!isPathSafe(filePath)) {
      return { content: [{ type: "text", text: `Error: Path outside repo or too deep (max ${MAX_DEPTH} levels)` }] };
    }

    const fullPath = path.join(REPO_ROOT, filePath);
    if (!await exists(fullPath)) {
      return { content: [{ type: "text", text: `Error: File not found: ${filePath}` }] };
    }

    try {
      let content = await fs.readFile(fullPath, "utf-8");
      
      if (startLine || endLine) {
        const lines = content.split("\n");
        const start = (startLine || 1) - 1;
        const end = endLine || lines.length;
        content = lines.slice(start, end).map((l, i) => `${start + i + 1}: ${l}`).join("\n");
      }

      return { content: [{ type: "text", text: truncate(content) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: CREATE FILE
// =============================================================================

server.registerTool(
  "fs_create_file",
  {
    title: "Create File",
    description: `Create a new file in the repository.

Args:
  - path: Relative path (max 5 levels deep)
  - content: File content
  - overwrite: Allow overwriting existing files (default: false)

Creates parent directories automatically.`,
    inputSchema: z.object({
      path: z.string().describe("Relative path for new file"),
      content: z.string().describe("File content"),
      overwrite: z.boolean().default(false).describe("Allow overwrite")
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
  },
  async ({ path: filePath, content, overwrite }) => {
    if (!isPathSafe(filePath)) {
      return { content: [{ type: "text", text: `Error: Path outside repo or too deep (max ${MAX_DEPTH} levels)` }] };
    }

    const fullPath = path.join(REPO_ROOT, filePath);
    
    if (await exists(fullPath) && !overwrite) {
      return { content: [{ type: "text", text: `Error: File exists. Use overwrite=true to replace.` }] };
    }

    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf-8");
      return { content: [{ type: "text", text: `✅ Created: ${filePath} (${content.length} bytes)` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: UPDATE FILE
// =============================================================================

server.registerTool(
  "fs_update_file",
  {
    title: "Update File",
    description: `Update an existing file with search/replace or full content.

Args:
  - path: File to update
  - search: Text to find (for partial update)
  - replace: Replacement text
  - content: Full new content (if no search/replace)

Use search/replace for surgical edits, content for full replacement.`,
    inputSchema: z.object({
      path: z.string().describe("File path"),
      search: z.string().optional().describe("Text to find"),
      replace: z.string().optional().describe("Replacement text"),
      content: z.string().optional().describe("Full replacement content")
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
  },
  async ({ path: filePath, search, replace, content }) => {
    if (!isPathSafe(filePath)) {
      return { content: [{ type: "text", text: `Error: Path outside repo or too deep` }] };
    }

    const fullPath = path.join(REPO_ROOT, filePath);
    if (!await exists(fullPath)) {
      return { content: [{ type: "text", text: `Error: File not found: ${filePath}` }] };
    }

    try {
      if (content) {
        await fs.writeFile(fullPath, content, "utf-8");
        return { content: [{ type: "text", text: `✅ Replaced entire file: ${filePath}` }] };
      }

      if (search && replace !== undefined) {
        const current = await fs.readFile(fullPath, "utf-8");
        if (!current.includes(search)) {
          return { content: [{ type: "text", text: `Error: Search text not found in file` }] };
        }
        const updated = current.replace(search, replace);
        await fs.writeFile(fullPath, updated, "utf-8");
        return { content: [{ type: "text", text: `✅ Updated: ${filePath} (replaced ${search.length} chars)` }] };
      }

      return { content: [{ type: "text", text: `Error: Provide either content or search+replace` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: DELETE FILE
// =============================================================================

server.registerTool(
  "fs_delete_file",
  {
    title: "Delete File",
    description: `Delete a file from the repository.

Args:
  - path: File to delete
  - confirm: Must be true to delete`,
    inputSchema: z.object({
      path: z.string().describe("File path"),
      confirm: z.boolean().describe("Confirm deletion")
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
  },
  async ({ path: filePath, confirm }) => {
    if (!confirm) {
      return { content: [{ type: "text", text: `Error: Set confirm=true to delete` }] };
    }

    if (!isPathSafe(filePath)) {
      return { content: [{ type: "text", text: `Error: Path outside repo` }] };
    }

    const fullPath = path.join(REPO_ROOT, filePath);
    if (!await exists(fullPath)) {
      return { content: [{ type: "text", text: `Error: File not found` }] };
    }

    try {
      await fs.unlink(fullPath);
      return { content: [{ type: "text", text: `✅ Deleted: ${filePath}` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: CREATE FOLDER
// =============================================================================

server.registerTool(
  "fs_create_folder",
  {
    title: "Create Folder",
    description: `Create a new folder (max 5 levels deep).

Args:
  - path: Folder path to create
  - withIndex: Create a mini-index file (default: true)`,
    inputSchema: z.object({
      path: z.string().describe("Folder path"),
      withIndex: z.boolean().default(true).describe("Create mini-index")
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ path: dirPath, withIndex }) => {
    if (!isPathSafe(dirPath)) {
      return { content: [{ type: "text", text: `Error: Path too deep (max ${MAX_DEPTH} levels)` }] };
    }

    const fullPath = path.join(REPO_ROOT, dirPath);

    try {
      await fs.mkdir(fullPath, { recursive: true });
      
      if (withIndex) {
        const indexContent = `# ${path.basename(dirPath)}

> Created: ${new Date().toISOString()}

## Purpose

[Describe purpose of this folder]

## Contents

*Empty - files will be indexed automatically*
`;
        await fs.writeFile(path.join(fullPath, MINI_INDEX_FILE), indexContent);
      }

      return { content: [{ type: "text", text: `✅ Created folder: ${dirPath}${withIndex ? " (with index)" : ""}` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: LIST DIRECTORY
// =============================================================================

server.registerTool(
  "fs_list",
  {
    title: "List Directory",
    description: `List files and folders in a directory.

Args:
  - path: Directory path (default: root)
  - depth: How deep to list (1-5, default: 2)
  - showHidden: Include hidden files`,
    inputSchema: z.object({
      path: z.string().default(".").describe("Directory path"),
      depth: z.number().int().min(1).max(5).default(2),
      showHidden: z.boolean().default(false)
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ path: dirPath, depth, showHidden }) => {
    const fullPath = path.join(REPO_ROOT, dirPath);
    
    if (!await exists(fullPath)) {
      return { content: [{ type: "text", text: `Error: Directory not found: ${dirPath}` }] };
    }

    try {
      const entries = await scanDirectory(dirPath, depth);
      const tree = generateIndexContent(dirPath, entries);
      return { content: [{ type: "text", text: truncate(tree) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: UPDATE INDEX
// =============================================================================

server.registerTool(
  "fs_update_index",
  {
    title: "Update Index",
    description: `Update the main repo index or a mini-index.

Args:
  - path: Directory to index (default: root for main index)
  - depth: How deep to scan (default: 3)

Creates/updates REPO_INDEX.md at root or _INDEX.md in subdirs.`,
    inputSchema: z.object({
      path: z.string().default(".").describe("Directory to index"),
      depth: z.number().int().min(1).max(5).default(3)
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ path: dirPath, depth }) => {
    try {
      const entries = await scanDirectory(dirPath, depth);
      const content = generateIndexContent(dirPath, entries);
      
      const indexFile = dirPath === "." 
        ? path.join(REPO_ROOT, INDEX_FILE)
        : path.join(REPO_ROOT, dirPath, MINI_INDEX_FILE);
      
      await fs.writeFile(indexFile, content, "utf-8");
      
      const stats = {
        files: entries.filter(e => e.type === "file").length,
        dirs: entries.filter(e => e.type === "dir").length
      };
      
      return { 
        content: [{ 
          type: "text", 
          text: `✅ Updated index: ${dirPath === "." ? INDEX_FILE : path.join(dirPath, MINI_INDEX_FILE)}\n\nIndexed: ${stats.files} files, ${stats.dirs} directories` 
        }] 
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: GET INDEX
// =============================================================================

server.registerTool(
  "fs_get_index",
  {
    title: "Get Index",
    description: `Read the current index file.

Args:
  - path: Directory (default: root for REPO_INDEX.md)

Returns the index content or error if not found.`,
    inputSchema: z.object({
      path: z.string().default(".").describe("Directory")
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ path: dirPath }) => {
    const indexFile = dirPath === "."
      ? path.join(REPO_ROOT, INDEX_FILE)
      : path.join(REPO_ROOT, dirPath, MINI_INDEX_FILE);

    if (!await exists(indexFile)) {
      return { content: [{ type: "text", text: `Index not found. Run fs_update_index to create.` }] };
    }

    try {
      const content = await fs.readFile(indexFile, "utf-8");
      return { content: [{ type: "text", text: content }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: SEARCH CODE
// =============================================================================

server.registerTool(
  "fs_search",
  {
    title: "Search Code",
    description: `Search for patterns in the codebase.

Args:
  - query: Search string or regex
  - path: Directory to search (default: entire repo)
  - filePattern: Glob pattern (default: **/*.{ts,tsx})
  - maxResults: Max results (default: 30)`,
    inputSchema: z.object({
      query: z.string().min(2).describe("Search pattern"),
      path: z.string().default("."),
      filePattern: z.string().default("**/*.{ts,tsx,js,jsx}"),
      maxResults: z.number().int().min(1).max(100).default(30)
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ query, path: searchPath, filePattern, maxResults }) => {
    const fullPath = path.join(REPO_ROOT, searchPath);

    try {
      const files = await glob(filePattern, {
        cwd: fullPath,
        ignore: IGNORE_DIRS.map(d => `${d}/**`)
      });

      const results: string[] = [];
      const regex = new RegExp(query, "gi");

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

      if (results.length === 0) {
        return { content: [{ type: "text", text: `No matches for: ${query}` }] };
      }

      return { content: [{ type: "text", text: `Found ${results.length} matches:\n\n${results.join("\n")}` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: CREATE TEST
// =============================================================================

server.registerTool(
  "fs_create_test",
  {
    title: "Create Test",
    description: `Generate a test file for a source file.

Args:
  - sourcePath: Source file to test
  - testType: unit | rules | e2e (default: unit)

Generates appropriate test structure based on source file type.`,
    inputSchema: z.object({
      sourcePath: z.string().describe("Source file path"),
      testType: z.enum(["unit", "rules", "e2e"]).default("unit")
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
  },
  async ({ sourcePath, testType }) => {
    const fullPath = path.join(REPO_ROOT, sourcePath);
    
    if (!await exists(fullPath)) {
      return { content: [{ type: "text", text: `Error: Source file not found: ${sourcePath}` }] };
    }

    try {
      const source = await fs.readFile(fullPath, "utf-8");
      const fileName = path.basename(sourcePath, path.extname(sourcePath));
      const ext = path.extname(sourcePath);
      
      // Extract exports for test generation
      const exports = source.match(/export\s+(const|function|class|type|interface)\s+(\w+)/g) || [];
      const exportNames = exports.map(e => e.replace(/export\s+(const|function|class|type|interface)\s+/, ""));

      // Determine test location
      let testPath: string;
      let testContent: string;

      if (testType === "rules") {
        testPath = `tests/rules/${fileName}.test.ts`;
        testContent = generateRulesTest(fileName, sourcePath, exportNames);
      } else if (testType === "e2e") {
        testPath = `tests/e2e/${fileName}.spec.ts`;
        testContent = generateE2ETest(fileName, sourcePath);
      } else {
        // Unit test - co-located or in __tests__
        const dir = path.dirname(sourcePath);
        testPath = path.join(dir, "__tests__", `${fileName}.test${ext}`);
        testContent = generateUnitTest(fileName, sourcePath, exportNames);
      }

      const fullTestPath = path.join(REPO_ROOT, testPath);
      await fs.mkdir(path.dirname(fullTestPath), { recursive: true });
      await fs.writeFile(fullTestPath, testContent, "utf-8");

      return { 
        content: [{ 
          type: "text", 
          text: `✅ Created ${testType} test: ${testPath}\n\nExports to test: ${exportNames.join(", ") || "none detected"}` 
        }] 
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

function generateUnitTest(name: string, sourcePath: string, exports: string[]): string {
  const importPath = sourcePath.replace(/\.tsx?$/, "").replace(/^apps\/web\//, "@/");
  
  return `import { describe, it, expect, vi } from "vitest";
${exports.length ? `import { ${exports.join(", ")} } from "${importPath}";` : `// import from "${importPath}";`}

describe("${name}", () => {
${exports.map(exp => `  describe("${exp}", () => {
    it("should exist", () => {
      expect(${exp}).toBeDefined();
    });

    it.todo("should [describe expected behavior]");
  });
`).join("\n") || `  it.todo("add tests for ${name}");
`}});
`;
}

function generateRulesTest(name: string, sourcePath: string, exports: string[]): string {
  return `import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

describe("Firestore Rules: ${name}", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "test-project",
      firestore: {
        rules: \`// Your rules here\`,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe("authenticated user in same org", () => {
    it("should allow read access", async () => {
      const db = testEnv
        .authenticatedContext("user1", { orgId: "org1" })
        .firestore();
      
      // TODO: Add specific collection/document assertions
      await assertSucceeds(
        db.collection("organizations").doc("org1").get()
      );
    });
  });

  describe("authenticated user in different org", () => {
    it("should deny read access", async () => {
      const db = testEnv
        .authenticatedContext("user2", { orgId: "org2" })
        .firestore();
      
      await assertFails(
        db.collection("organizations").doc("org1").get()
      );
    });
  });

  describe("unauthenticated user", () => {
    it("should deny all access", async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      await assertFails(
        db.collection("organizations").doc("org1").get()
      );
    });
  });
});
`;
}

function generateE2ETest(name: string, sourcePath: string): string {
  return `import { test, expect } from "@playwright/test";

test.describe("${name}", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication/setup
    await page.goto("/");
  });

  test("should load successfully", async ({ page }) => {
    // TODO: Add specific assertions
    await expect(page).toHaveTitle(/Fresh Schedules/);
  });

  test.describe("authenticated user", () => {
    test.beforeEach(async ({ page }) => {
      // TODO: Login flow
    });

    test.todo("should [describe user flow]");
  });
});
`;
}

// =============================================================================
// TOOL: RUN COMMAND
// =============================================================================

server.registerTool(
  "fs_run",
  {
    title: "Run Command",
    description: `Run a predefined command.

Commands:
  - typecheck: TypeScript check
  - lint / lint:fix: ESLint
  - format / format:check: Prettier
  - test:unit / test:rules / test:e2e: Tests
  - build: Build project
  - validate: Pattern validation`,
    inputSchema: z.object({
      command: z.enum([
        "typecheck", "lint", "lint:fix", "format", "format:check",
        "test:unit", "test:rules", "test:e2e", "build", "validate"
      ])
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ command }) => {
    const cmds: Record<string, string> = {
      typecheck: "pnpm typecheck",
      lint: "pnpm lint:check",
      "lint:fix": "pnpm lint --fix",
      format: "pnpm format",
      "format:check": "pnpm format:check",
      "test:unit": "pnpm test:unit",
      "test:rules": "pnpm test:rules",
      "test:e2e": "pnpm test:e2e",
      build: "pnpm build",
      validate: "pnpm validate:patterns"
    };

    const result = runCmd(cmds[command]);
    return { 
      content: [{ 
        type: "text", 
        text: `${result.ok ? "✅" : "❌"} ${command}\n\n${truncate(result.out)}` 
      }] 
    };
  }
);

// =============================================================================
// TOOL: MOVE/RENAME
// =============================================================================

server.registerTool(
  "fs_move",
  {
    title: "Move/Rename",
    description: `Move or rename a file/folder.

Args:
  - from: Source path
  - to: Destination path`,
    inputSchema: z.object({
      from: z.string().describe("Source path"),
      to: z.string().describe("Destination path")
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
  },
  async ({ from, to }) => {
    if (!isPathSafe(from) || !isPathSafe(to)) {
      return { content: [{ type: "text", text: `Error: Path outside repo or too deep` }] };
    }

    const fromFull = path.join(REPO_ROOT, from);
    const toFull = path.join(REPO_ROOT, to);

    if (!await exists(fromFull)) {
      return { content: [{ type: "text", text: `Error: Source not found: ${from}` }] };
    }

    try {
      await fs.mkdir(path.dirname(toFull), { recursive: true });
      await fs.rename(fromFull, toFull);
      return { content: [{ type: "text", text: `✅ Moved: ${from} → ${to}` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e}` }] };
    }
  }
);

// =============================================================================
// TOOL: GET SCHEMA
// =============================================================================

server.registerTool(
  "fs_get_schema",
  {
    title: "Get Schema",
    description: `Get a schema definition from packages/types/src/schemas.

Args:
  - name: Schema name (e.g., "Schedule", "Organization")`,
    inputSchema: z.object({
      name: z.string().describe("Schema name")
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ name }) => {
    const schemasDir = path.join(REPO_ROOT, "packages", "types", "src", "schemas");
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
        return { content: [{ type: "text", text: `# ${file}\n\n\`\`\`typescript\n${content}\n\`\`\`` }] };
      }
    }

    // List available schemas
    try {
      const files = await glob("*.ts", { cwd: schemasDir });
      return { 
        content: [{ 
          type: "text", 
          text: `Schema "${name}" not found.\n\nAvailable:\n${files.map(f => `  - ${f}`).join("\n")}` 
        }] 
      };
    } catch {
      return { content: [{ type: "text", text: `Schema not found: ${name}` }] };
    }
  }
);

// =============================================================================
// STDIO TRANSPORT
// =============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Fresh Schedules MCP Server v2.0.0 running`);
  console.error(`Repo root: ${REPO_ROOT}`);
}

main().catch(console.error);
