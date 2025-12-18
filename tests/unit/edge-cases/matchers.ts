// [P0][TEST][MATCHERS] Custom Vitest Matchers for Edge Case Testing
// Tags: P0, TEST, EDGE-CASES, MATCHERS
// Created: 2025-12-17

import { expect } from "vitest";
import type { ZodSchema } from "zod";
import type { LabeledValue } from "./generators.js";
import { validateEdgeCases, type ValidationSummary } from "./validators.js";

interface EdgeCaseMatcherResult {
  pass: boolean;
  message: () => string;
}

/**
 * Custom matcher: toBeRejectedBySchema
 * Checks that a value is rejected by a Zod schema
 */
export function toBeRejectedBySchema<T>(
  this: ReturnType<typeof expect>,
  received: unknown,
  schema: ZodSchema<T>
): EdgeCaseMatcherResult {
  const result = schema.safeParse(received);

  if (!result.success) {
    return {
      pass: true,
      message: () => `Expected value to NOT be rejected by schema, but it was rejected: ${result.error.message}`,
    };
  }

  return {
    pass: false,
    message: () => `Expected value to be rejected by schema, but it was accepted`,
  };
}

/**
 * Custom matcher: toBeAcceptedBySchema
 * Checks that a value is accepted by a Zod schema
 */
export function toBeAcceptedBySchema<T>(
  this: ReturnType<typeof expect>,
  received: unknown,
  schema: ZodSchema<T>
): EdgeCaseMatcherResult {
  const result = schema.safeParse(received);

  if (result.success) {
    return {
      pass: true,
      message: () => `Expected value to NOT be accepted by schema, but it was accepted`,
    };
  }

  return {
    pass: false,
    message: () => `Expected value to be accepted by schema, but it was rejected: ${result.error.message}`,
  };
}

/**
 * Custom matcher: toHandleEdgeCases
 * Checks that a schema correctly handles all edge cases
 */
export function toHandleEdgeCases<T>(
  this: ReturnType<typeof expect>,
  schema: ZodSchema<T>,
  edgeCases: LabeledValue<unknown>[]
): EdgeCaseMatcherResult {
  const summary: ValidationSummary = validateEdgeCases(schema, edgeCases);

  if (summary.failed === 0) {
    return {
      pass: true,
      message: () => `Expected schema to NOT handle all edge cases, but all ${summary.total} passed`,
    };
  }

  const failureDetails = summary.failures
    .map((f) => `  - ${f.label}: expected ${f.expectedToReject ? "reject" : "accept"}, got ${f.actuallyRejected ? "rejected" : "accepted"}`)
    .join("\n");

  return {
    pass: false,
    message: () => `Expected schema to handle all edge cases, but ${summary.failed}/${summary.total} failed:\n${failureDetails}`,
  };
}

/**
 * Custom matcher: toHandleCriticalEdgeCases
 * Checks that a schema handles all critical security edge cases
 */
export function toHandleCriticalEdgeCases<T>(
  this: ReturnType<typeof expect>,
  schema: ZodSchema<T>,
  edgeCases: LabeledValue<unknown>[]
): EdgeCaseMatcherResult {
  const criticalCases = edgeCases.filter((ec) => ec.severity === "critical");
  const summary: ValidationSummary = validateEdgeCases(schema, criticalCases);

  if (summary.failed === 0) {
    return {
      pass: true,
      message: () => `Expected schema to NOT handle all critical edge cases, but all ${summary.total} passed`,
    };
  }

  const failureDetails = summary.failures
    .map((f) => `  - ${f.label}: expected ${f.expectedToReject ? "reject" : "accept"}, got ${f.actuallyRejected ? "rejected" : "accepted"}`)
    .join("\n");

  return {
    pass: false,
    message: () => `Expected schema to handle all critical edge cases, but ${summary.failed}/${summary.total} failed:\n${failureDetails}`,
  };
}

// Extend Vitest types
declare module "vitest" {
  interface Assertion<T> {
    toBeRejectedBySchema<S>(schema: ZodSchema<S>): T;
    toBeAcceptedBySchema<S>(schema: ZodSchema<S>): T;
    toHandleEdgeCases(edgeCases: LabeledValue<unknown>[]): T;
    toHandleCriticalEdgeCases(edgeCases: LabeledValue<unknown>[]): T;
  }
}

/**
 * Register all custom matchers with Vitest
 */
export function registerEdgeCaseMatchers(): void {
  expect.extend({
    toBeRejectedBySchema,
    toBeAcceptedBySchema,
    toHandleEdgeCases,
    toHandleCriticalEdgeCases,
  });
}
