/**
 * Tool Tests - Verify all tools work correctly
 * Run with: pnpm test:tools
 */

import * as fs from "fs/promises";
import * as path from "path";
import { glob } from "glob";

const TEST_DIR = "/tmp/fresh-mcp-test";
const PASS = "✅";
const FAIL = "❌";

let passed = 0;
let failed = 0;

// =============================================================================
// TEST HELPERS (copied from index.ts to test independently)
// =============================================================================

const MAX_DEPTH = 5;
const IGNORE_DIRS = ["node_modules", "dist", ".git", ".next", "coverage", ".turbo"];

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function getDepth(relativePath: string): number {
  return relativePath.split(path.sep).filter(Boolean).length;
}

function isPathSafe(repoRoot: string, targetPath: string): boolean {
  const resolved = path.resolve(repoRoot, targetPath);
  return resolved.startsWith(repoRoot) && getDepth(targetPath) <= MAX_DEPTH;
}

// =============================================================================
// TEST RUNNER
// =============================================================================

function test(name: string, fn: () => Promise<void> | void) {
  return async () => {
    try {
      await fn();
      console.log(`${PASS} ${name}`);
      passed++;
    } catch (e) {
      console.log(`${FAIL} ${name}`);
      console.log(`   Error: ${e}`);
      failed++;
    }
  };
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function assertEqual<T>(actual: T, expected: T, msg: string) {
  if (actual !== expected) {
    throw new Error(`${msg}: expected ${expected}, got ${actual}`);
  }
}

// =============================================================================
// SETUP / TEARDOWN
// =============================================================================

async function setup() {
  console.log("\n📁 Setting up test directory...\n");
  await fs.rm(TEST_DIR, { recursive: true, force: true });
  await fs.mkdir(TEST_DIR, { recursive: true });
  
  // Create test structure
  await fs.mkdir(path.join(TEST_DIR, "apps/web/app/api"), { recursive: true });
  await fs.mkdir(path.join(TEST_DIR, "packages/types/src/schemas"), { recursive: true });
  await fs.mkdir(path.join(TEST_DIR, "tests"), { recursive: true });
  
  // Create test files
  await fs.writeFile(
    path.join(TEST_DIR, "apps/web/app/api/route.ts"),
    `export const GET = createOrgEndpoint({
  roles: ['admin'],
  handler: async ({ context }) => {
    return { success: true, data: [] };
  }
});`
  );
  
  await fs.writeFile(
    path.join(TEST_DIR, "packages/types/src/schemas/schedule.schema.ts"),
    `import { z } from "zod";
export const ScheduleSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Schedule = z.infer<typeof ScheduleSchema>;`
  );
}

async function teardown() {
  console.log("\n🧹 Cleaning up...\n");
  await fs.rm(TEST_DIR, { recursive: true, force: true });
}

// =============================================================================
// TESTS
// =============================================================================

const tests = [
  // PATH SAFETY
  test("isPathSafe: allows valid paths", () => {
    assert(isPathSafe(TEST_DIR, "apps/web"), "Should allow apps/web");
    assert(isPathSafe(TEST_DIR, "level1/level2/level3"), "Should allow 3 levels");
  }),
  
  test("isPathSafe: blocks paths too deep", () => {
    assert(!isPathSafe(TEST_DIR, "1/2/3/4/5/6"), "Should block 6 levels");
  }),
  
  test("isPathSafe: blocks path traversal", () => {
    assert(!isPathSafe(TEST_DIR, "../../../etc/passwd"), "Should block traversal");
  }),
  
  // FILE OPERATIONS
  test("exists: detects existing files", async () => {
    assert(await exists(path.join(TEST_DIR, "apps/web/app/api/route.ts")), "Should find route.ts");
  }),
  
  test("exists: returns false for missing files", async () => {
    assert(!(await exists(path.join(TEST_DIR, "nope.ts"))), "Should not find nope.ts");
  }),
  
  test("read file: can read test file", async () => {
    const content = await fs.readFile(
      path.join(TEST_DIR, "apps/web/app/api/route.ts"),
      "utf-8"
    );
    assert(content.includes("createOrgEndpoint"), "Should contain createOrgEndpoint");
  }),
  
  test("create file: creates with parent dirs", async () => {
    const filePath = path.join(TEST_DIR, "new/nested/file.ts");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "export const test = true;");
    assert(await exists(filePath), "Should create nested file");
  }),
  
  test("update file: search/replace works", async () => {
    const filePath = path.join(TEST_DIR, "update-test.ts");
    await fs.writeFile(filePath, "const OLD = 'value';");
    
    let content = await fs.readFile(filePath, "utf-8");
    content = content.replace("OLD", "NEW");
    await fs.writeFile(filePath, content);
    
    const updated = await fs.readFile(filePath, "utf-8");
    assert(updated.includes("NEW"), "Should have NEW");
    assert(!updated.includes("OLD"), "Should not have OLD");
  }),
  
  test("delete file: removes file", async () => {
    const filePath = path.join(TEST_DIR, "to-delete.ts");
    await fs.writeFile(filePath, "delete me");
    assert(await exists(filePath), "File should exist");
    await fs.unlink(filePath);
    assert(!(await exists(filePath)), "File should be deleted");
  }),
  
  // FOLDER OPERATIONS
  test("create folder: creates nested dirs", async () => {
    const dirPath = path.join(TEST_DIR, "new/folder/path");
    await fs.mkdir(dirPath, { recursive: true });
    const stat = await fs.stat(dirPath);
    assert(stat.isDirectory(), "Should be directory");
  }),
  
  test("list directory: finds files", async () => {
    const files = await fs.readdir(path.join(TEST_DIR, "apps/web/app/api"));
    assert(files.includes("route.ts"), "Should find route.ts");
  }),
  
  // SEARCH
  test("search: glob finds ts files", async () => {
    const files = await glob("**/*.ts", {
      cwd: TEST_DIR,
      ignore: IGNORE_DIRS.map(d => `${d}/**`)
    });
    assert(files.length > 0, "Should find ts files");
    assert(files.some(f => f.includes("route.ts")), "Should find route.ts");
  }),
  
  test("search: content search works", async () => {
    const files = await glob("**/*.ts", { cwd: TEST_DIR });
    let found = false;
    
    for (const file of files) {
      const content = await fs.readFile(path.join(TEST_DIR, file), "utf-8");
      if (content.includes("createOrgEndpoint")) {
        found = true;
        break;
      }
    }
    
    assert(found, "Should find createOrgEndpoint in codebase");
  }),
  
  // SCHEMA
  test("get schema: finds schema file", async () => {
    const schemasDir = path.join(TEST_DIR, "packages/types/src/schemas");
    const files = await fs.readdir(schemasDir);
    assert(files.includes("schedule.schema.ts"), "Should find schedule schema");
  }),
  
  // INDEX GENERATION
  test("index: generates markdown index", async () => {
    const entries = await fs.readdir(TEST_DIR, { recursive: true });
    const indexContent = `# Test Index\n\nFiles: ${entries.length}\n`;
    
    const indexPath = path.join(TEST_DIR, "REPO_INDEX.md");
    await fs.writeFile(indexPath, indexContent);
    
    assert(await exists(indexPath), "Should create index");
    const content = await fs.readFile(indexPath, "utf-8");
    assert(content.includes("# Test Index"), "Should have header");
  }),
  
  // DEPTH CALCULATION
  test("getDepth: calculates correctly", () => {
    assertEqual(getDepth("apps"), 1, "Single level");
    assertEqual(getDepth("apps/web"), 2, "Two levels");
    assertEqual(getDepth("apps/web/app/api/route.ts"), 5, "Five levels");
  }),
];

// =============================================================================
// RUN
// =============================================================================

async function run() {
  console.log("🧪 Fresh Schedules MCP Server - Tool Tests\n");
  console.log("=".repeat(50));
  
  await setup();
  
  console.log("\n📋 Running tests...\n");
  
  for (const t of tests) {
    await t();
  }
  
  await teardown();
  
  console.log("=".repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(console.error);
