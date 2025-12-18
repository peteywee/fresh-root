// [P0][TEST][VALIDATORS] Schema Validation Edge Case Testing
// Tags: P0, TEST, EDGE-CASES, VALIDATORS
// Created: 2025-12-17
// Purpose: Test Zod schemas against adversarial inputs

import { ZodSchema, ZodError } from "zod";
import type { LabeledValue, EdgeCaseCategory } from "./generators";

/**
 * Result of validating an edge case against a schema
 */
export interface ValidationResult {
  label: string;
  value: unknown;
  category: EdgeCaseCategory;
  severity: "low" | "medium" | "high" | "critical";
  expectedToReject: boolean;
  actuallyRejected: boolean;
  passed: boolean;
  error?: string;
  zodError?: ZodError;
}

/**
 * Batch validation result summary
 */
export interface ValidationSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  failures: ValidationResult[];
  byCategory: Record<EdgeCaseCategory, { passed: number; failed: number }>;
  bySeverity: Record<string, { passed: number; failed: number }>;
}

/**
 * Validate a single edge case against a Zod schema
 */
export function validateEdgeCase<T>(
  schema: ZodSchema<T>,
  edgeCase: LabeledValue<unknown>
): ValidationResult {
  let actuallyRejected = false;
  let zodError: ZodError | undefined;
  let errorMessage: string | undefined;

  try {
    schema.parse(edgeCase.value);
    actuallyRejected = false;
  } catch (e) {
    actuallyRejected = true;
    if (e instanceof ZodError) {
      zodError = e;
      errorMessage = e.errors.map((err) => err.message).join("; ");
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }
  }

  const passed = edgeCase.shouldReject === actuallyRejected;

  return {
    label: edgeCase.label,
    value: edgeCase.value,
    category: edgeCase.category,
    severity: edgeCase.severity,
    expectedToReject: edgeCase.shouldReject,
    actuallyRejected,
    passed,
    error: errorMessage,
    zodError,
  };
}

/**
 * Validate multiple edge cases against a schema and return summary
 */
export function validateEdgeCases<T>(
  schema: ZodSchema<T>,
  edgeCases: LabeledValue<unknown>[]
): ValidationSummary {
  const results = edgeCases.map((ec) => validateEdgeCase(schema, ec));

  const failures = results.filter((r) => !r.passed);
  const passed = results.filter((r) => r.passed).length;

  // Group by category
  const byCategory = {} as Record<EdgeCaseCategory, { passed: number; failed: number }>;
  for (const result of results) {
    if (!byCategory[result.category]) {
      byCategory[result.category] = { passed: 0, failed: 0 };
    }
    if (result.passed) {
      byCategory[result.category].passed++;
    } else {
      byCategory[result.category].failed++;
    }
  }

  // Group by severity
  const bySeverity = {} as Record<string, { passed: number; failed: number }>;
  for (const result of results) {
    if (!bySeverity[result.severity]) {
      bySeverity[result.severity] = { passed: 0, failed: 0 };
    }
    if (result.passed) {
      bySeverity[result.severity].passed++;
    } else {
      bySeverity[result.severity].failed++;
    }
  }

  return {
    total: results.length,
    passed,
    failed: failures.length,
    passRate: (passed / results.length) * 100,
    failures,
    byCategory,
    bySeverity,
  };
}

/**
 * Create a test suite for a schema's edge case handling
 * Returns a function that can be called inside describe()
 */
export function createEdgeCaseTestSuite<T>(
  schemaName: string,
  schema: ZodSchema<T>,
  edgeCases: LabeledValue<unknown>[],
  options: {
    /** Skip tests for cases that should be accepted */
    onlyRejections?: boolean;
    /** Filter by minimum severity */
    minSeverity?: "low" | "medium" | "high" | "critical";
    /** Filter by category */
    categories?: EdgeCaseCategory[];
  } = {}
): (describe: typeof globalThis.describe, it: typeof globalThis.it, expect: typeof globalThis.expect) => void {
  return (describe, it, expect) => {
    let filteredCases = [...edgeCases];

    if (options.onlyRejections) {
      filteredCases = filteredCases.filter((c) => c.shouldReject);
    }

    if (options.minSeverity) {
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      const minLevel = severityOrder[options.minSeverity];
      filteredCases = filteredCases.filter(
        (c) => severityOrder[c.severity] >= minLevel
      );
    }

    if (options.categories) {
      filteredCases = filteredCases.filter((c) =>
        options.categories!.includes(c.category)
      );
    }

    describe(`${schemaName} edge cases`, () => {
      for (const edgeCase of filteredCases) {
        const testName = edgeCase.shouldReject
          ? `should reject: ${edgeCase.label}`
          : `should accept: ${edgeCase.label}`;

        it(testName, () => {
          const result = validateEdgeCase(schema, edgeCase);
          
          if (!result.passed) {
            const action = edgeCase.shouldReject ? "reject" : "accept";
            const actual = result.actuallyRejected ? "rejected" : "accepted";
            throw new Error(
              `Expected schema to ${action} "${edgeCase.label}" but it was ${actual}. ` +
              `Value: ${JSON.stringify(edgeCase.value)?.slice(0, 100)}. ` +
              `Error: ${result.error || "none"}`
            );
          }

          expect(result.passed).toBe(true);
        });
      }
    });
  };
}

/**
 * Assert that a schema handles all critical security cases correctly
 */
export function assertSecurityEdgeCases<T>(
  schema: ZodSchema<T>,
  edgeCases: LabeledValue<unknown>[]
): void {
  const criticalCases = edgeCases.filter((c) => c.severity === "critical");
  const summary = validateEdgeCases(schema, criticalCases);

  if (summary.failed > 0) {
    const failureDetails = summary.failures
      .map((f) => `  - ${f.label}: expected to ${f.expectedToReject ? "reject" : "accept"}, but ${f.actuallyRejected ? "rejected" : "accepted"}`)
      .join("\n");

    throw new Error(
      `Schema failed ${summary.failed} critical security edge cases:\n${failureDetails}`
    );
  }
}

// ============================================================================
// COMMON SCHEMA TESTERS
// ============================================================================

/**
 * Pre-built edge case sets for common field types
 */
export const CommonFieldEdgeCases = {
  /** Test cases for a required string field (1-255 chars, no injection) */
  requiredString: (minLength = 1, maxLength = 255): LabeledValue<unknown>[] => [
    { label: "Empty string", value: "", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Whitespace only", value: "   ", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Min length", value: "x".repeat(minLength), shouldReject: false, category: "boundary", severity: "low" },
    { label: "Max length", value: "x".repeat(maxLength), shouldReject: false, category: "boundary", severity: "low" },
    { label: "Over max length", value: "x".repeat(maxLength + 1), shouldReject: true, category: "boundary", severity: "low" },
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
    { label: "undefined", value: undefined, shouldReject: true, category: "null", severity: "medium" },
    { label: "Number instead of string", value: 12345, shouldReject: true, category: "type-coercion", severity: "medium" },
    { label: "Unicode emoji", value: "Test 💀 Value", shouldReject: false, category: "unicode", severity: "low" },
    { label: "XSS attempt", value: "<script>alert(1)</script>", shouldReject: true, category: "injection", severity: "critical" },
    { label: "SQL injection", value: "'; DROP TABLE users; --", shouldReject: true, category: "injection", severity: "critical" },
  ],

  /** Test cases for an email field */
  email: (): LabeledValue<unknown>[] => [
    { label: "Valid email", value: "test@example.com", shouldReject: false, category: "boundary", severity: "low" },
    { label: "Empty string", value: "", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Missing @", value: "testexample.com", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Missing domain", value: "test@", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Missing local part", value: "@example.com", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Double @", value: "test@@example.com", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Very long local part", value: "x".repeat(65) + "@example.com", shouldReject: true, category: "overflow", severity: "medium" },
    { label: "Unicode in local", value: "tëst@example.com", shouldReject: false, category: "unicode", severity: "low" },
    { label: "Plus addressing", value: "test+tag@example.com", shouldReject: false, category: "boundary", severity: "low" },
    { label: "Subdomain", value: "test@sub.example.com", shouldReject: false, category: "boundary", severity: "low" },
    { label: "XSS in email", value: "<script>@example.com", shouldReject: true, category: "injection", severity: "critical" },
  ],

  /** Test cases for a positive integer field (e.g., ID, count) */
  positiveInteger: (): LabeledValue<unknown>[] => [
    { label: "Zero", value: 0, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "One", value: 1, shouldReject: false, category: "boundary", severity: "low" },
    { label: "Negative one", value: -1, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Large positive", value: 1000000, shouldReject: false, category: "boundary", severity: "low" },
    { label: "MAX_SAFE_INTEGER", value: Number.MAX_SAFE_INTEGER, shouldReject: false, category: "overflow", severity: "medium" },
    { label: "Over MAX_SAFE_INTEGER", value: Number.MAX_SAFE_INTEGER + 1, shouldReject: true, category: "overflow", severity: "high" },
    { label: "Infinity", value: Infinity, shouldReject: true, category: "overflow", severity: "critical" },
    { label: "NaN", value: NaN, shouldReject: true, category: "type-coercion", severity: "critical" },
    { label: "Float", value: 1.5, shouldReject: true, category: "type-coercion", severity: "medium" },
    { label: "String number", value: "123", shouldReject: true, category: "type-coercion", severity: "medium" },
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
  ],

  /** Test cases for a timestamp field (milliseconds since epoch) */
  timestamp: (): LabeledValue<unknown>[] => [
    { label: "Valid recent timestamp", value: Date.now(), shouldReject: false, category: "boundary", severity: "low" },
    { label: "Unix epoch", value: 0, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Negative timestamp", value: -1, shouldReject: true, category: "boundary", severity: "high" },
    { label: "Year 2000", value: 946684800000, shouldReject: false, category: "boundary", severity: "low" },
    { label: "Year 2038 (32-bit overflow)", value: 2147483647000, shouldReject: false, category: "overflow", severity: "medium" },
    { label: "Year 3000", value: 32503680000000, shouldReject: false, category: "boundary", severity: "low" },
    { label: "JavaScript max date", value: 8640000000000000, shouldReject: true, category: "overflow", severity: "high" },
    { label: "Seconds instead of ms", value: 1702800000, shouldReject: true, category: "type-coercion", severity: "medium" },
    { label: "Infinity", value: Infinity, shouldReject: true, category: "overflow", severity: "critical" },
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
  ],

  /** Test cases for UUID field */
  uuid: (): LabeledValue<unknown>[] => [
    { label: "Valid UUID v4", value: "550e8400-e29b-41d4-a716-446655440000", shouldReject: false, category: "boundary", severity: "low" },
    { label: "Empty string", value: "", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Not a UUID", value: "not-a-uuid", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "UUID without dashes", value: "550e8400e29b41d4a716446655440000", shouldReject: true, category: "boundary", severity: "low" },
    { label: "Uppercase UUID", value: "550E8400-E29B-41D4-A716-446655440000", shouldReject: false, category: "boundary", severity: "low" },
    { label: "UUID with extra chars", value: "550e8400-e29b-41d4-a716-446655440000x", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "SQL injection in UUID", value: "'; DROP TABLE--", shouldReject: true, category: "injection", severity: "critical" },
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
  ],
};

/**
 * Print a validation summary to console (useful for debugging)
 */
export function printValidationSummary(summary: ValidationSummary): void {
  console.log("\n=== Edge Case Validation Summary ===");
  console.log(`Total: ${summary.total}`);
  console.log(`Passed: ${summary.passed} (${summary.passRate.toFixed(1)}%)`);
  console.log(`Failed: ${summary.failed}`);

  if (summary.failed > 0) {
    console.log("\nFailures:");
    for (const failure of summary.failures) {
      console.log(`  ❌ ${failure.label}`);
      console.log(`     Expected: ${failure.expectedToReject ? "reject" : "accept"}`);
      console.log(`     Actual: ${failure.actuallyRejected ? "rejected" : "accepted"}`);
      if (failure.error) {
        console.log(`     Error: ${failure.error}`);
      }
    }
  }

  console.log("\nBy Category:");
  for (const [category, stats] of Object.entries(summary.byCategory)) {
    const emoji = stats.failed > 0 ? "❌" : "✅";
    console.log(`  ${emoji} ${category}: ${stats.passed}/${stats.passed + stats.failed} passed`);
  }

  console.log("\nBy Severity:");
  for (const [severity, stats] of Object.entries(summary.bySeverity)) {
    const emoji = stats.failed > 0 ? "❌" : "✅";
    console.log(`  ${emoji} ${severity}: ${stats.passed}/${stats.passed + stats.failed} passed`);
  }
}
