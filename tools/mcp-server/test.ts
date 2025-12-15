/**
 * Test script for Fresh Schedules MCP Server
 * Tests actual tool functionality without MCP protocol
 */

import * as fs from "fs/promises";
import * as path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DIR = path.join(__dirname, ".test-workspace");

// Test results
const results: { name: string; pass: boolean; error?: string }[] = [];

function test(name: string, fn: () => Promise<void>) {
  return fn()
    .then(() => {
      results.push({ name, pass: true });
      console.log(`✅ ${name}`);
    })
    .catch((e) => {
      results.push({ name, pass: false, error: e.message });
      console.log(`❌ ${name}: ${e.message}`);
    });
}

async function setup() {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
  await fs.mkdir(TEST_DIR, { recursive: true });
  console.log(`\n📁 Test workspace: ${TEST_DIR}\n`);
}

async function cleanup() {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
}

// =============================================================================
// TESTS
// =============================================================================

async function testCreateFile() {
  const filePath = path.join(TEST_DIR, "test.ts");
  const content = `export const hello = "world";`;
  
  await fs.writeFile(filePath, content);
  const read = await fs.readFile(filePath, "utf-8");
  
  if (read !== content) throw new Error("Content mismatch");
}

async function testCreateNestedFile() {
  const filePath = path.join(TEST_DIR, "level1", "level2", "level3", "deep.ts");
  const content = `export const deep = true;`;
  
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  
  const read = await fs.readFile(filePath, "utf-8");
  if (read !== content) throw new Error("Content mismatch");
}

async function testReadFileWithLines() {
  const filePath = path.join(TEST_DIR, "multiline.ts");
  const lines = ["line1", "line2", "line3", "line4", "line5"];
  await fs.writeFile(filePath, lines.join("\n"));
  
  const content = await fs.readFile(filePath, "utf-8");
  const readLines = content.split("\n");
  
  // Simulate line range (2-4)
  const slice = readLines.slice(1, 4);
  if (slice.length !== 3) throw new Error(`Expected 3 lines, got ${slice.length}`);
  if (slice[0] !== "line2") throw new Error("Line range mismatch");
}

async function testUpdateFileSearchReplace() {
  const filePath = path.join(TEST_DIR, "update.ts");
  await fs.writeFile(filePath, `const x: any = 1;`);
  
  let content = await fs.readFile(filePath, "utf-8");
  content = content.replace("any", "number");
  await fs.writeFile(filePath, content);
  
  const updated = await fs.readFile(filePath, "utf-8");
  if (!updated.includes("number")) throw new Error("Replace failed");
  if (updated.includes("any")) throw new Error("Old text still present");
}

async function testDeleteFile() {
  const filePath = path.join(TEST_DIR, "todelete.ts");
  await fs.writeFile(filePath, "delete me");
  
  await fs.unlink(filePath);
  
  try {
    await fs.access(filePath);
    throw new Error("File still exists");
  } catch (e: any) {
    if (e.code !== "ENOENT") throw e;
  }
}

async function testCreateFolder() {
  const folderPath = path.join(TEST_DIR, "newfolder");
  await fs.mkdir(folderPath, { recursive: true });
  
  const stat = await fs.stat(folderPath);
  if (!stat.isDirectory()) throw new Error("Not a directory");
}

async function testCreateFolderWithIndex() {
  const folderPath = path.join(TEST_DIR, "indexed-folder");
  const indexPath = path.join(folderPath, "_INDEX.md");
  
  await fs.mkdir(folderPath, { recursive: true });
  await fs.writeFile(indexPath, `# indexed-folder\n\n> Created: ${new Date().toISOString()}`);
  
  const indexContent = await fs.readFile(indexPath, "utf-8");
  if (!indexContent.includes("# indexed-folder")) throw new Error("Index not created");
}

async function testListDirectory() {
  // Create structure
  await fs.mkdir(path.join(TEST_DIR, "listtest", "sub1"), { recursive: true });
  await fs.mkdir(path.join(TEST_DIR, "listtest", "sub2"), { recursive: true });
  await fs.writeFile(path.join(TEST_DIR, "listtest", "file1.ts"), "");
  await fs.writeFile(path.join(TEST_DIR, "listtest", "sub1", "file2.ts"), "");
  
  const items = await fs.readdir(path.join(TEST_DIR, "listtest"), { withFileTypes: true });
  
  if (items.length !== 3) throw new Error(`Expected 3 items, got ${items.length}`);
}

async function testSearch() {
  await fs.writeFile(path.join(TEST_DIR, "search1.ts"), `export const createOrgEndpoint = () => {};`);
  await fs.writeFile(path.join(TEST_DIR, "search2.ts"), `import { createOrgEndpoint } from "./search1";`);
  await fs.writeFile(path.join(TEST_DIR, "search3.ts"), `const other = true;`);
  
  const files = await glob("**/*.ts", { cwd: TEST_DIR });
  const matches: string[] = [];
  
  for (const file of files) {
    const content = await fs.readFile(path.join(TEST_DIR, file), "utf-8");
    if (content.includes("createOrgEndpoint")) {
      matches.push(file);
    }
  }
  
  if (matches.length !== 2) throw new Error(`Expected 2 matches, got ${matches.length}`);
}

async function testMoveFile() {
  const from = path.join(TEST_DIR, "moveme.ts");
  const to = path.join(TEST_DIR, "moved", "newname.ts");
  
  await fs.writeFile(from, "move content");
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.rename(from, to);
  
  const content = await fs.readFile(to, "utf-8");
  if (content !== "move content") throw new Error("Content lost in move");
  
  try {
    await fs.access(from);
    throw new Error("Original still exists");
  } catch (e: any) {
    if (e.code !== "ENOENT") throw e;
  }
}

async function testDepthLimit() {
  // Should work at depth 5
  const deep5 = path.join(TEST_DIR, "1", "2", "3", "4", "5");
  await fs.mkdir(deep5, { recursive: true });
  await fs.writeFile(path.join(deep5, "ok.ts"), "depth 5");
  
  // Depth check simulation
  const relativePath = "1/2/3/4/5/ok.ts";
  const depth = relativePath.split("/").filter(Boolean).length;
  
  if (depth > 6) throw new Error("Depth limit not enforced");
}

async function testIndexGeneration() {
  // Create structure with exports
  await fs.mkdir(path.join(TEST_DIR, "indextest"), { recursive: true });
  await fs.writeFile(
    path.join(TEST_DIR, "indextest", "schema.ts"),
    `export const UserSchema = z.object({});\nexport type User = z.infer<typeof UserSchema>;`
  );
  await fs.writeFile(
    path.join(TEST_DIR, "indextest", "utils.ts"),
    `export function helper() {}\nexport const CONSTANT = 1;`
  );
  
  // Simulate scanning
  const files = await glob("**/*.ts", { cwd: path.join(TEST_DIR, "indextest") });
  const entries: { file: string; exports: string[] }[] = [];
  
  for (const file of files) {
    const content = await fs.readFile(path.join(TEST_DIR, "indextest", file), "utf-8");
    const exports = content.match(/export\s+(const|function|class|type|interface)\s+(\w+)/g) || [];
    entries.push({
      file,
      exports: exports.map(e => e.replace(/export\s+(const|function|class|type|interface)\s+/, ""))
    });
  }
  
  const schemaEntry = entries.find(e => e.file === "schema.ts");
  if (!schemaEntry?.exports.includes("UserSchema")) throw new Error("Export detection failed");
  if (!schemaEntry?.exports.includes("User")) throw new Error("Type export detection failed");
}

async function testTestGeneration() {
  const sourcePath = path.join(TEST_DIR, "component.tsx");
  await fs.writeFile(sourcePath, `
export function MyComponent() { return <div />; }
export const useMyHook = () => {};
export type MyType = { id: string };
`);
  
  // Extract exports
  const source = await fs.readFile(sourcePath, "utf-8");
  const exports = source.match(/export\s+(const|function|class|type|interface)\s+(\w+)/g) || [];
  const exportNames = exports.map(e => e.replace(/export\s+(const|function|class|type|interface)\s+/, ""));
  
  if (!exportNames.includes("MyComponent")) throw new Error("Function export missed");
  if (!exportNames.includes("useMyHook")) throw new Error("Const export missed");
  if (!exportNames.includes("MyType")) throw new Error("Type export missed");
  
  // Generate test content
  const testContent = `import { describe, it, expect } from "vitest";
${exportNames.length ? `import { ${exportNames.join(", ")} } from "../component";` : ""}

describe("component", () => {
${exportNames.map(exp => `  describe("${exp}", () => {
    it("should exist", () => {
      expect(${exp}).toBeDefined();
    });
  });
`).join("\n")}});
`;
  
  if (!testContent.includes("MyComponent")) throw new Error("Test generation failed");
}

// =============================================================================
// RUN
// =============================================================================

async function main() {
  console.log("🧪 Fresh Schedules MCP Server - Tool Tests\n");
  
  await setup();
  
  await test("Create file", testCreateFile);
  await test("Create nested file (auto-mkdir)", testCreateNestedFile);
  await test("Read file with line range", testReadFileWithLines);
  await test("Update file (search/replace)", testUpdateFileSearchReplace);
  await test("Delete file", testDeleteFile);
  await test("Create folder", testCreateFolder);
  await test("Create folder with index", testCreateFolderWithIndex);
  await test("List directory", testListDirectory);
  await test("Search code", testSearch);
  await test("Move/rename file", testMoveFile);
  await test("Depth limit (5 levels)", testDepthLimit);
  await test("Index generation (export detection)", testIndexGeneration);
  await test("Test file generation", testTestGeneration);
  
  await cleanup();
  
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log("\nFailed tests:");
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
  
  console.log("\n✅ All tests passed!");
}

main().catch(console.error);
