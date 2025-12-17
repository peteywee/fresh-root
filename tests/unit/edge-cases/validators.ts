// [P0][TEST][VALIDATORS] Schema Validation Edge Case Testing
// Tags: P0, TEST, EDGE-CASES, VALIDATORS
// Created: 2025-12-17

import { z, ZodSchema, ZodError } from "zod";
import type { LabeledValue, EdgeCaseCategory } from "./generators.js";

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
export function validateEdgeCase<T>(schema: ZodSchema<T>, edgeCase: LabeledValue<unknown>): ValidationResult {
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
      errorMessage = e.errors?.map((err) => err.message).join("; ") ?? "Validation failed";
    } else if (e instanceof Error) {
      errorMessage = e.message;
    } else {
      errorMessage = "Unknown validation error";
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
export function validateEdgeCases<T>(schema: ZodSchema<T>, edgeCases: LabeledValue<unknown>[]): ValidationSummary {
  const results = edgeCases.map((ec) => validateEdgeCase(schema, ec));

  const failures = results.filter((r) => !r.passed);
  const passed = results.filter((r) => r.passed).length;

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
 * Pre-built edge case sets for common field types
 */
export const CommonFieldEdgeCases = {
  requiredString: (minLength = 1, maxLength = 255): LabeledValue<unknown>[] => [
    { label: "Empty string", value: "", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Whitespace only", value: "   ", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Min length", value: "x".repeat(minLength), shouldReject: false, category: "boundary", severity: "low" },
    { label: "Max length", value: "x".repeat(maxLength), shouldReject: false, category: "boundary", severity: "low" },
    { label: "Over max length", value: "x".repeat(maxLength + 1), shouldReject: true, category: "boundary", severity: "low" },
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
    { label: "undefined", value: undefined, shouldReject: true, category: "null", severity: "medium" },
    { label: "XSS attempt", value: "<script>alert(1)</script>", shouldReject: true, category: "injection", severity: "critical" },
    { label: "SQL injection", value: "'; DROP TABLE users; --", shouldReject: true, category: "injection", severity: "critical" },
  ],

  email: (): LabeledValue<unknown>[] => [
    { label: "Valid email", value: "test@example.com", shouldReject: false, category: "boundary", severity: "low" },
    { label: "Empty string", value: "", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Missing @", value: "testexample.com", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Missing domain", value: "test@", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "XSS in email", value: "<script>@example.com", shouldReject: true, category: "injection", severity: "critical" },
  ],

  positiveInteger: (): LabeledValue<unknown>[] => [
    { label: "Zero", value: 0, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "One", value: 1, shouldReject: false, category: "boundary", severity: "low" },
    { label: "Negative one", value: -1, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "MAX_SAFE_INTEGER", value: Number.MAX_SAFE_INTEGER, shouldReject: false, category: "overflow", severity: "medium" },
    { label: "Infinity", value: Infinity, shouldReject: true, category: "overflow", severity: "critical" },
    { label: "NaN", value: NaN, shouldReject: true, category: "type-coercion", severity: "critical" },
    { label: "Float", value: 1.5, shouldReject: true, category: "type-coercion", severity: "medium" },
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
  ],

  timestamp: (): LabeledValue<unknown>[] => [
    { label: "Valid recent timestamp", value: Date.now(), shouldReject: false, category: "boundary", severity: "low" },
    { label: "Unix epoch", value: 0, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Negative timestamp", value: -1, shouldReject: true, category: "boundary", severity: "high" },
    { label: "Infinity", value: Infinity, shouldReject: true, category: "overflow", severity: "critical" },
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
  ],

  uuid: (): LabeledValue<unknown>[] => [
    { label: "Valid UUID v4", value: "550e8400-e29b-41d4-a716-446655440000", shouldReject: false, category: "boundary", severity: "low" },
    { label: "Empty string", value: "", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Not a UUID", value: "not-a-uuid", shouldReject: true, category: "boundary", severity: "medium" },
    { label: "SQL injection in UUID", value: "'; DROP TABLE--", shouldReject: true, category: "injection", severity: "critical" },
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
  ],
};

/**
 * Print a validation summary to console
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
    }
  }
}
