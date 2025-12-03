/**
 * AI-Powered Test Auto-Generation System
 * Analyzes code structure and automatically generates comprehensive tests
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface RouteAnalysis {
  filePath: string;
  method: string;
  endpoint: string;
  requiredParams: string[];
  optionalParams: string[];
  requiredPermissions: string[];
  validationSchema?: any;
  responseSchema?: any;
  errorCases: string[];
}

interface GeneratedTest {
  filePath: string;
  testCode: string;
  coverage: string[];
}

/**
 * Analyzes a TypeScript source file and extracts route metadata
 */
export function analyzeRouteFile(filePath: string): RouteAnalysis | null {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const analysis: Partial<RouteAnalysis> = {
    filePath,
    requiredParams: [],
    optionalParams: [],
    requiredPermissions: [],
    errorCases: [],
  };

  // Determine HTTP method from route structure
  const fileContent = sourceCode.toLowerCase();
  if (fileContent.includes('export async function get')) analysis.method = 'GET';
  else if (fileContent.includes('export async function post')) analysis.method = 'POST';
  else if (fileContent.includes('export async function put')) analysis.method = 'PUT';
  else if (fileContent.includes('export async function patch')) analysis.method = 'PATCH';
  else if (fileContent.includes('export async function delete')) analysis.method = 'DELETE';

  // Extract endpoint from file path
  const apiPath = filePath.match(/app\/api\/(.+)\/route\.ts$/)?.[1];
  if (apiPath) {
    analysis.endpoint = '/' + apiPath.replace(/\[(\w+)\]/g, ':$1');
  }

  // Analyze AST for validation and permissions
  function visit(node: ts.Node) {
    // Find validation schemas
    if (ts.isCallExpression(node)) {
      const text = node.expression.getText(sourceFile);
      if (text.includes('parse') || text.includes('safeParse')) {
        // Extract schema validation
        const arg = node.arguments[0];
        if (arg) {
          const schemaText = arg.getText(sourceFile);
          // Extract required fields from schema
          const requiredMatches = schemaText.matchAll(/(\w+):\s*z\./g);
          for (const match of requiredMatches) {
            if (!analysis.requiredParams!.includes(match[1])) {
              analysis.requiredParams!.push(match[1]);
            }
          }
        }
      }

      // Find permission checks
      if (text.includes('requireRole') || text.includes('hasPermission')) {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteral(arg)) {
          analysis.requiredPermissions!.push(arg.text);
        }
      }
    }

    // Find error cases
    if (ts.isCallExpression(node)) {
      const text = node.expression.getText(sourceFile);
      if (text === 'NextResponse.json') {
        const statusArg = node.arguments[1];
        if (statusArg && ts.isObjectLiteralExpression(statusArg)) {
          statusArg.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) &&
                prop.name.getText(sourceFile) === 'status' &&
                ts.isNumericLiteral(prop.initializer)) {
              const status = parseInt(prop.initializer.text);
              if (status >= 400) {
                analysis.errorCases!.push(`HTTP ${status}`);
              }
            }
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return analysis.endpoint ? analysis as RouteAnalysis : null;
}

/**
 * Generates comprehensive test cases for a route
 */
export function generateTestsForRoute(analysis: RouteAnalysis): GeneratedTest {
  const testFilePath = analysis.filePath.replace('/route.ts', '/__tests__/auto-generated.test.ts');
  const relativePath = path.relative(process.cwd(), analysis.filePath);

  const coverage: string[] = [];
  const testCases: string[] = [];

  // Generate happy path test
  testCases.push(`
  it('should successfully ${analysis.method} ${analysis.endpoint}', async () => {
    const { auth, db } = initializeTestFirebase();
    const user = await createTestUser(auth);
    const session = await extractSessionCookie(/* create session */);

    ${analysis.requiredParams.length > 0 ? `
    const validPayload = {
      ${analysis.requiredParams.map(p => `${p}: 'test-${p}'`).join(',\n      ')}
    };
    ` : ''}

    const response = await apiRequest(
      '${analysis.endpoint}',
      {
        method: '${analysis.method}',
        ${analysis.requiredParams.length > 0 ? 'body: JSON.stringify(validPayload),' : ''}
      },
      session
    );

    expect(response.status).toBe(${analysis.method === 'POST' ? '201' : '200'});
    const data = await response.json();
    expect(data).toMatchObject({
      ${analysis.requiredParams.map(p => `${p}: expect.any(String)`).join(',\n      ')}
    });
  });`);
  coverage.push('Happy path');

  // Generate authentication test
  testCases.push(`
  it('should return 401 when not authenticated', async () => {
    const response = await apiRequest(
      '${analysis.endpoint}',
      { method: '${analysis.method}' },
      null // No session
    );

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toMatch(/authentication|unauthorized/i);
  });`);
  coverage.push('Authentication required');

  // Generate permission tests
  if (analysis.requiredPermissions.length > 0) {
    testCases.push(`
  it('should return 403 when user lacks required permissions', async () => {
    const { auth, db } = initializeTestFirebase();
    const user = await createTestUser(auth);
    // Create user with insufficient permissions (staff role)
    const org = await createTestOrganization(db);
    await createTestMembership(db, { userId: user.uid, organizationId: org.id, role: 'staff' });
    const session = await extractSessionCookie(/* create session */);

    const response = await apiRequest(
      '${analysis.endpoint}',
      { method: '${analysis.method}' },
      session
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toMatch(/permission|forbidden/i);
  });`);
    coverage.push(`Permission check: ${analysis.requiredPermissions.join(', ')}`);
  }

  // Generate validation tests
  if (analysis.requiredParams.length > 0) {
    testCases.push(`
  it('should return 400 when required parameters are missing', async () => {
    const { auth } = initializeTestFirebase();
    const user = await createTestUser(auth);
    const session = await extractSessionCookie(/* create session */);

    const response = await apiRequest(
      '${analysis.endpoint}',
      {
        method: '${analysis.method}',
        body: JSON.stringify({}), // Empty payload
      },
      session
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/validation|required/i);
  });`);
    coverage.push('Input validation');

    // Generate invalid data type test
    testCases.push(`
  it('should return 400 when parameters have invalid types', async () => {
    const { auth } = initializeTestFirebase();
    const user = await createTestUser(auth);
    const session = await extractSessionCookie(/* create session */);

    const invalidPayload = {
      ${analysis.requiredParams.map(p => `${p}: 12345 // Invalid type`).join(',\n      ')}
    };

    const response = await apiRequest(
      '${analysis.endpoint}',
      {
        method: '${analysis.method}',
        body: JSON.stringify(invalidPayload),
      },
      session
    );

    expect(response.status).toBe(400);
  });`);
    coverage.push('Type validation');
  }

  // Generate edge case tests
  testCases.push(`
  it('should handle concurrent requests safely', async () => {
    const { auth } = initializeTestFirebase();
    const user = await createTestUser(auth);
    const session = await extractSessionCookie(/* create session */);

    ${analysis.requiredParams.length > 0 ? `
    const payload = {
      ${analysis.requiredParams.map(p => `${p}: 'concurrent-test-${p}'`).join(',\n      ')}
    };
    ` : ''}

    // Make 5 concurrent requests
    const requests = Array(5).fill(null).map(() =>
      apiRequest(
        '${analysis.endpoint}',
        {
          method: '${analysis.method}',
          ${analysis.requiredParams.length > 0 ? 'body: JSON.stringify(payload),' : ''}
        },
        session
      )
    );

    const responses = await Promise.all(requests);

    // All should succeed or fail gracefully
    responses.forEach(response => {
      expect([200, 201, 409, 429]).toContain(response.status);
    });
  });`);
  coverage.push('Concurrent request handling');

  const testCode = `/**
 * AUTO-GENERATED TESTS
 * Generated by AI Test Intelligence System
 * Source: ${relativePath}
 *
 * Coverage: ${coverage.join(', ')}
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initializeTestFirebase,
  cleanup,
  createTestUser,
  createTestOrganization,
  createTestMembership,
  apiRequest,
  extractSessionCookie,
} from '../../../e2e/setup';

describe('${analysis.endpoint} - Auto-Generated Tests', () => {
  beforeEach(async () => {
    await initializeTestFirebase();
  });

  afterEach(async () => {
    await cleanup();
  });

  ${testCases.join('\n\n  ')}
});
`;

  return {
    filePath: testFilePath,
    testCode,
    coverage,
  };
}

/**
 * Scans entire codebase and generates tests for all routes
 */
export async function autoGenerateAllTests(apiDir: string = 'apps/web/app/api'): Promise<GeneratedTest[]> {
  const routeFiles = await glob(`${apiDir}/**/route.ts`, {
    ignore: ['**/node_modules/**', '**/__tests__/**'],
  });

  const generatedTests: GeneratedTest[] = [];

  for (const routeFile of routeFiles) {
    console.log(`Analyzing ${routeFile}...`);
    const analysis = analyzeRouteFile(routeFile);

    if (analysis) {
      const test = generateTestsForRoute(analysis);
      generatedTests.push(test);

      // Create test directory if it doesn't exist
      const testDir = path.dirname(test.filePath);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Write the test file
      fs.writeFileSync(test.filePath, test.testCode);
      console.log(`✅ Generated ${test.filePath} with ${test.coverage.length} test cases`);
    }
  }

  return generatedTests;
}

/**
 * CLI entry point for auto-generation
 */
if (require.main === module) {
  autoGenerateAllTests().then(tests => {
    console.log(`\n🎉 Successfully generated ${tests.length} test files!`);
    console.log('\nCoverage Summary:');
    tests.forEach(test => {
      console.log(`  ${test.filePath}`);
      test.coverage.forEach(c => console.log(`    ✓ ${c}`));
    });
  }).catch(console.error);
}
