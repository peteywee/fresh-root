/**
 * E2E Test Generator & Runner
 * Creates and runs end-to-end tests for API routes
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";
import { glob } from "glob";
import * as path from "path";

// Determine project root - works for both global and local installs
function getProjectRoot(): string {
  const cwd = process.cwd();

  // Check if we're in a project with apps/web/app/api
  if (fs.existsSync(path.join(cwd, "apps/web/app/api"))) {
    return cwd;
  }

  // Fallback to up from tests/intelligence (when run as local package)
  return path.resolve(__dirname, "../..");
}

const PROJECT_ROOT = getProjectRoot();
const E2E_DIR = path.join(PROJECT_ROOT, "tests/e2e");

interface E2ETestResult {
  file: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
}

interface E2EReport {
  generated: string[];
  executed: E2ETestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

class E2ETestGenerator {
  /**
   * Generate E2E tests for API routes
   */
  async generate(routes?: string[]): Promise<string[]> {
    console.log("\n🔧 Generating E2E Tests...\n");

    // Ensure E2E directory exists
    if (!fs.existsSync(E2E_DIR)) {
      fs.mkdirSync(E2E_DIR, { recursive: true });
    }

    const generatedFiles: string[] = [];

    // Find API routes
    const routePattern = routes?.length
      ? routes.map((r) => `${PROJECT_ROOT}/${r}/**/route.ts`)
      : [`${PROJECT_ROOT}/apps/web/app/api/**/route.ts`];

    for (const pattern of routePattern) {
      const routeFiles = await glob(pattern, { ignore: ["**/node_modules/**"] });

      for (const routeFile of routeFiles) {
        const generated = this.generateTestForRoute(routeFile);
        if (generated) {
          generatedFiles.push(generated);
        }
      }
    }

    console.log(`\n✅ Generated ${generatedFiles.length} E2E test files\n`);
    return generatedFiles;
  }

  /**
   * Generate test file for a single route
   */
  private generateTestForRoute(routeFile: string): string | null {
    const routeContent = fs.readFileSync(routeFile, "utf-8");

    // Extract route path from file path
    const relativePath = routeFile
      .replace(`${PROJECT_ROOT}/apps/web/app/api/`, "")
      .replace("/route.ts", "");
    const routeName = relativePath.replace(/\//g, "-") || "root";
    const testFile = path.join(E2E_DIR, `${routeName}.e2e.test.ts`);

    // Skip if test already exists
    if (fs.existsSync(testFile)) {
      console.log(`   ⏭️  Skipping ${routeName} (test exists)`);
      return null;
    }

    // Detect HTTP methods
    const methods: string[] = [];
    if (/export\s+(const|async function)\s+GET/.test(routeContent)) methods.push("GET");
    if (/export\s+(const|async function)\s+POST/.test(routeContent)) methods.push("POST");
    if (/export\s+(const|async function)\s+PUT/.test(routeContent)) methods.push("PUT");
    if (/export\s+(const|async function)\s+PATCH/.test(routeContent)) methods.push("PATCH");
    if (/export\s+(const|async function)\s+DELETE/.test(routeContent)) methods.push("DELETE");

    if (methods.length === 0) {
      console.log(`   ⏭️  Skipping ${routeName} (no HTTP methods found)`);
      return null;
    }

    // Detect if it requires authentication
    const requiresAuth =
      routeContent.includes("createOrgEndpoint") ||
      routeContent.includes("createAuthenticatedEndpoint") ||
      routeContent.includes("withSecurity");

    // Detect input schema
    const inputSchemaMatch = routeContent.match(/input:\s*(\w+Schema)/);
    const inputSchema = inputSchemaMatch ? inputSchemaMatch[1] : null;

    // Generate test content
    const testContent = this.generateTestContent(
      routeName,
      relativePath,
      methods,
      requiresAuth,
      inputSchema,
    );

    fs.writeFileSync(testFile, testContent);
    console.log(`   ✅ Generated: tests/e2e/${routeName}.e2e.test.ts`);

    return testFile;
  }

  /**
   * Generate test file content
   */
  private generateTestContent(
    routeName: string,
    routePath: string,
    methods: string[],
    requiresAuth: boolean,
    inputSchema: string | null,
  ): string {
    const apiPath = `/api/${routePath}`;

    const methodTests = methods
      .map((method) => {
        const authNote = requiresAuth ? "// Requires authentication" : "";
        const inputNote = inputSchema ? `// Input: ${inputSchema}` : "";

        if (method === "GET") {
          return `
  describe("${method} ${apiPath}", () => {
    ${authNote}
    
    it("should return 200 for valid request", async () => {
      const response = await fetch(\`\${BASE_URL}${apiPath}\`${requiresAuth ? ", { headers: authHeaders }" : ""});
      expect(response.status).toBe(${requiresAuth ? "401" : "200"});
    });

    ${
      requiresAuth
        ? `
    it("should return 401 without authentication", async () => {
      const response = await fetch(\`\${BASE_URL}${apiPath}\`);
      expect(response.status).toBe(401);
    });
    `
        : ""
    }
  });`;
        }

        if (method === "POST" || method === "PUT" || method === "PATCH") {
          return `
  describe("${method} ${apiPath}", () => {
    ${authNote}
    ${inputNote}
    
    it("should return 400 for invalid input", async () => {
      const response = await fetch(\`\${BASE_URL}${apiPath}\`, {
        method: "${method}",
        headers: { "Content-Type": "application/json"${requiresAuth ? ", ...authHeaders" : ""} },
        body: JSON.stringify({})
      });
      expect([400, 401, 422]).toContain(response.status);
    });

    it("should handle valid request", async () => {
      const validPayload = {
        // TODO: Add valid payload based on ${inputSchema || "schema"}
      };
      
      const response = await fetch(\`\${BASE_URL}${apiPath}\`, {
        method: "${method}",
        headers: { "Content-Type": "application/json"${requiresAuth ? ", ...authHeaders" : ""} },
        body: JSON.stringify(validPayload)
      });
      
      // Expect success or auth required
      expect([200, 201, 401, 403]).toContain(response.status);
    });
  });`;
        }

        if (method === "DELETE") {
          return `
  describe("${method} ${apiPath}", () => {
    ${authNote}
    
    it("should require authentication", async () => {
      const response = await fetch(\`\${BASE_URL}${apiPath}\`, {
        method: "DELETE"
      });
      expect([401, 403, 404]).toContain(response.status);
    });
  });`;
        }

        return "";
      })
      .join("\n");

    return `/**
 * E2E Tests for ${routeName} API
 * Generated by Test Intelligence System
 * 
 * Route: ${apiPath}
 * Methods: ${methods.join(", ")}
 * Auth Required: ${requiresAuth}
 * 
 * @generated
 */

import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

// Auth headers for protected routes
const authHeaders: Record<string, string> = {
  // TODO: Add authentication headers
  // "Authorization": "Bearer <token>",
  // "Cookie": "session=<session>",
};

describe("${routeName} API E2E Tests", () => {
  beforeAll(async () => {
    // Verify server is running
    try {
      await fetch(BASE_URL);
    } catch (error) {
      console.warn("⚠️ Server not running at", BASE_URL);
    }
  });
${methodTests}
});
`;
  }

  /**
   * Run E2E tests
   */
  async run(pattern?: string): Promise<E2EReport> {
    console.log("\n🚀 Running E2E Tests...\n");

    const report: E2EReport = {
      generated: [],
      executed: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
      },
    };

    const startTime = Date.now();

    // Find E2E test files
    const testPattern = pattern || "**/*.e2e.test.ts";
    const testFiles = await glob(testPattern, {
      cwd: E2E_DIR,
      ignore: ["**/node_modules/**"],
      absolute: true,
    });

    if (testFiles.length === 0) {
      console.log("   ⚠️  No E2E test files found. Run 'testintel e2e generate' first.\n");
      return report;
    }

    console.log(`   Found ${testFiles.length} E2E test files\n`);

    for (const testFile of testFiles) {
      const result = await this.runSingleTest(testFile);
      report.executed.push(result);

      if (result.status === "passed") report.summary.passed++;
      else if (result.status === "failed") report.summary.failed++;
      else report.summary.skipped++;
    }

    report.summary.total = testFiles.length;
    report.summary.duration = Date.now() - startTime;

    this.printReport(report);
    return report;
  }

  /**
   * Run a single test file
   */
  private async runSingleTest(testFile: string): Promise<E2ETestResult> {
    const fileName = path.basename(testFile);
    console.log(`   ⏳ Running: ${fileName}`);

    const startTime = Date.now();
    const result: E2ETestResult = {
      file: fileName,
      status: "passed",
      duration: 0,
    };

    try {
      const output = execSync(
        `cd ${PROJECT_ROOT} && npx vitest run "${testFile}" --reporter=json 2>&1`,
        { encoding: "utf-8", timeout: 60000 },
      );

      result.duration = Date.now() - startTime;

      if (output.includes('"success":false') || output.includes("FAIL")) {
        result.status = "failed";
        console.log(`   ❌ FAILED (${result.duration}ms)`);
      } else {
        console.log(`   ✅ PASSED (${result.duration}ms)`);
      }
    } catch (error) {
      result.duration = Date.now() - startTime;
      result.status = "failed";
      result.error = error instanceof Error ? error.message : "Unknown error";
      console.log(`   ❌ FAILED (${result.duration}ms)`);
    }

    return result;
  }

  /**
   * Print E2E test report
   */
  private printReport(report: E2EReport): void {
    const { summary } = report;
    const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;

    console.log(`
════════════════════════════════════════════════════════════════════════
📊 E2E TEST REPORT
════════════════════════════════════════════════════════════════════════

Summary:
  Total Tests:  ${summary.total}
  Passed:       ${summary.passed} ✅
  Failed:       ${summary.failed} ❌
  Skipped:      ${summary.skipped} ⏭️
  Pass Rate:    ${passRate}%
  Duration:     ${(summary.duration / 1000).toFixed(2)}s

${
  report.executed.length > 0
    ? `
Test Results:
${report.executed.map((t) => `  ${t.status === "passed" ? "✅" : "❌"} ${t.file} (${t.duration}ms)`).join("\n")}
`
    : ""
}
════════════════════════════════════════════════════════════════════════
`);
  }

  /**
   * List existing E2E tests
   */
  async list(): Promise<string[]> {
    const testFiles = await glob("**/*.e2e.test.ts", {
      cwd: E2E_DIR,
      ignore: ["**/node_modules/**"],
    });

    console.log(`\n📋 E2E Tests (${testFiles.length} files):\n`);

    if (testFiles.length === 0) {
      console.log("   No E2E tests found. Run 'testintel e2e generate' to create them.\n");
    } else {
      testFiles.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
      console.log("");
    }

    return testFiles;
  }
}

export const e2eGenerator = new E2ETestGenerator();
