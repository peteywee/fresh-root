// [P0][TEST][MATCHERS] Custom Vitest Matchers for Edge Case Testing
// Tags: P0, TEST, EDGE-CASES, MATCHERS
// Created: 2025-12-17
// Purpose: Extend Vitest with edge-case-specific matchers

import { z, ZodSchema } from "zod";
import type { LabeledValue } from "./generators";
import { validateEdgeCase, validateEdgeCases } from "./validators";

/**
 * Custom matcher declarations for TypeScript
 * Add to vitest.d.ts or global.d.ts
 */
declare module "vitest" {
  interface Assertion<T = unknown> {
    /** Assert that a Zod schema rejects this value */
    toBeRejectedBySchema(schema: ZodSchema): void;
    /** Assert that a Zod schema accepts this value */
    toBeAcceptedBySchema(schema: ZodSchema): void;
    /** Assert that a schema handles all edge cases correctly */
    toHandleEdgeCases(edgeCases: LabeledValue<unknown>[]): void;
    /** Assert that a schema handles all critical security cases */
    toHandleSecurityCases(edgeCases: LabeledValue<unknown>[]): void;
  }

  interface AsymmetricMatchersContaining {
    /** Match any value that would be rejected by the schema */
    rejectedBySchema(schema: ZodSchema): unknown;
    /** Match any value that would be accepted by the schema */
    acceptedBySchema(schema: ZodSchema): unknown;
  }
}

/**
 * Install custom matchers - call in vitest.setup.ts
 * 
 * @example
 * // vitest.setup.ts
 * import { installEdgeCaseMatchers } from "./tests/unit/edge-cases/matchers";
 * installEdgeCaseMatchers();
 */
export function installEdgeCaseMatchers(): void {
  // Only import expect in test context
  const { expect } = require("vitest") as typeof import("vitest");

  expect.extend({
    toBeRejectedBySchema(received: unknown, schema: ZodSchema) {
      const result = schema.safeParse(received);
      const pass = !result.success;

      return {
        pass,
        message: () =>
          pass
            ? `Expected value NOT to be rejected by schema, but it was rejected with: ${
                !result.success ? JSON.stringify(result.error.errors) : ""
              }`
            : `Expected value to be rejected by schema, but it was accepted. Value: ${JSON.stringify(received)}`,
      };
    },

    toBeAcceptedBySchema(received: unknown, schema: ZodSchema) {
      const result = schema.safeParse(received);
      const pass = result.success;

      return {
        pass,
        message: () =>
          pass
            ? `Expected value NOT to be accepted by schema, but it was accepted`
            : `Expected value to be accepted by schema, but it was rejected with: ${
                !result.success ? JSON.stringify(result.error.errors) : ""
              }`,
      };
    },

    toHandleEdgeCases(received: ZodSchema, edgeCases: LabeledValue<unknown>[]) {
      const summary = validateEdgeCases(received, edgeCases);
      const pass = summary.failed === 0;

      const failureDetails = summary.failures
        .map(
          (f) =>
            `  - ${f.label} [${f.severity}]: expected ${
              f.expectedToReject ? "reject" : "accept"
            }, got ${f.actuallyRejected ? "rejected" : "accepted"}`
        )
        .join("\n");

      return {
        pass,
        message: () =>
          pass
            ? `Expected schema to fail some edge cases, but it passed all ${summary.total}`
            : `Schema failed ${summary.failed}/${summary.total} edge cases:\n${failureDetails}`,
      };
    },

    toHandleSecurityCases(received: ZodSchema, edgeCases: LabeledValue<unknown>[]) {
      const criticalCases = edgeCases.filter((c) => c.severity === "critical");
      const summary = validateEdgeCases(received, criticalCases);
      const pass = summary.failed === 0;

      const failureDetails = summary.failures
        .map(
          (f) =>
            `  ⚠️ SECURITY: ${f.label}: expected ${
              f.expectedToReject ? "reject" : "accept"
            }, got ${f.actuallyRejected ? "rejected" : "accepted"}`
        )
        .join("\n");

      return {
        pass,
        message: () =>
          pass
            ? `Expected schema to fail some security cases, but it passed all ${summary.total}`
            : `SECURITY VULNERABILITY: Schema failed ${summary.failed}/${summary.total} critical cases:\n${failureDetails}`,
      };
    },
  });
}

// ============================================================================
// HELPER FUNCTIONS FOR TESTING
// ============================================================================

/**
 * Create a test case generator for a specific schema
 * Useful for parametrized testing
 */
export function createSchemaTestCases<T>(
  schema: ZodSchema<T>,
  edgeCases: LabeledValue<unknown>[]
): Array<{
  name: string;
  value: unknown;
  shouldPass: boolean;
  category: string;
  severity: string;
}> {
  return edgeCases.map((ec) => ({
    name: ec.label,
    value: ec.value,
    shouldPass: !ec.shouldReject,
    category: ec.category,
    severity: ec.severity,
  }));
}

/**
 * Run edge case tests using test.each pattern
 * 
 * @example
 * const cases = createSchemaTestCases(MySchema, stringEdgeCases());
 * runEdgeCaseTests(cases, MySchema);
 */
export function runEdgeCaseTests<T>(
  testCases: ReturnType<typeof createSchemaTestCases>,
  schema: ZodSchema<T>
): void {
  const { describe, it, expect } = require("vitest") as typeof import("vitest");

  describe("Edge case validation", () => {
    for (const testCase of testCases) {
      const prefix = testCase.shouldPass ? "✅" : "❌";
      const action = testCase.shouldPass ? "accept" : "reject";

      it(`${prefix} should ${action}: ${testCase.name}`, () => {
        const result = schema.safeParse(testCase.value);

        if (testCase.shouldPass) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    }
  });
}

/**
 * Generate a Vitest snapshot of edge case behavior
 * Useful for tracking changes in schema validation over time
 */
export function snapshotEdgeCaseBehavior<T>(
  schema: ZodSchema<T>,
  edgeCases: LabeledValue<unknown>[]
): Record<string, { accepted: boolean; error?: string }> {
  const snapshot: Record<string, { accepted: boolean; error?: string }> = {};

  for (const ec of edgeCases) {
    const result = schema.safeParse(ec.value);
    snapshot[ec.label] = {
      accepted: result.success,
      error: !result.success
        ? result.error.errors.map((e) => e.message).join("; ")
        : undefined,
    };
  }

  return snapshot;
}
