// [P0][TEST][GENERATORS] Edge Case Value Generators
// Tags: P0, TEST, EDGE-CASES, GENERATORS
// Created: 2025-12-17
// Purpose: Generate adversarial test values for boundary testing
//
// STABILITY GUARANTEES:
// - Function signatures will not change (only extend)
// - Return type structure will not change
// - Labels are machine-readable and stable

/**
 * Labeled test value for debugging and reporting
 */
export interface LabeledValue<T = unknown> {
  /** Human-readable description of the edge case */
  label: string;
  /** The actual test value */
  value: T;
  /** Expected behavior: should this value be rejected? */
  shouldReject: boolean;
  /** Category for filtering */
  category: EdgeCaseCategory;
  /** Severity of the edge case (security implications) */
  severity: "low" | "medium" | "high" | "critical";
}

export type EdgeCaseCategory =
  | "overflow"
  | "underflow"
  | "unicode"
  | "injection"
  | "null"
  | "empty"
  | "boundary"
  | "type-coercion"
  | "nested"
  | "array"
  | "date"
  | "special-chars";

// ============================================================================
// NUMERIC EDGE CASES
// ============================================================================

/**
 * Generate numeric overflow/underflow test cases
 * Tests: MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, Infinity, -Infinity, NaN, etc.
 */
export function numericEdgeCases(): LabeledValue<number>[] {
  return [
    // Overflow cases
    {
      label: "MAX_SAFE_INTEGER",
      value: Number.MAX_SAFE_INTEGER,
      shouldReject: false, // Valid but edge
      category: "overflow",
      severity: "medium",
    },
    {
      label: "MAX_SAFE_INTEGER + 1 (precision loss)",
      value: Number.MAX_SAFE_INTEGER + 1,
      shouldReject: true,
      category: "overflow",
      severity: "high",
    },
    {
      label: "MAX_VALUE (largest representable)",
      value: Number.MAX_VALUE,
      shouldReject: true,
      category: "overflow",
      severity: "high",
    },
    {
      label: "Positive Infinity",
      value: Infinity,
      shouldReject: true,
      category: "overflow",
      severity: "critical",
    },
    // Underflow cases
    {
      label: "MIN_SAFE_INTEGER",
      value: Number.MIN_SAFE_INTEGER,
      shouldReject: false,
      category: "underflow",
      severity: "medium",
    },
    {
      label: "MIN_SAFE_INTEGER - 1 (precision loss)",
      value: Number.MIN_SAFE_INTEGER - 1,
      shouldReject: true,
      category: "underflow",
      severity: "high",
    },
    {
      label: "Negative Infinity",
      value: -Infinity,
      shouldReject: true,
      category: "underflow",
      severity: "critical",
    },
    // Zero variants
    {
      label: "Positive zero",
      value: 0,
      shouldReject: false,
      category: "boundary",
      severity: "low",
    },
    {
      label: "Negative zero",
      value: -0,
      shouldReject: false, // Usually acceptable
      category: "boundary",
      severity: "low",
    },
    // Special values
    {
      label: "NaN",
      value: NaN,
      shouldReject: true,
      category: "type-coercion",
      severity: "critical",
    },
    {
      label: "Negative one",
      value: -1,
      shouldReject: false, // Context dependent
      category: "boundary",
      severity: "low",
    },
    // Floating point precision
    {
      label: "Smallest positive float",
      value: Number.MIN_VALUE,
      shouldReject: false,
      category: "boundary",
      severity: "low",
    },
    {
      label: "Epsilon (smallest difference from 1)",
      value: Number.EPSILON,
      shouldReject: false,
      category: "boundary",
      severity: "low",
    },
  ];
}

/**
 * Generate timestamp-specific edge cases
 * Tests: Unix epoch, Y2K38, far future, negative timestamps
 */
export function timestampEdgeCases(): LabeledValue<number>[] {
  return [
    {
      label: "Unix epoch (0)",
      value: 0,
      shouldReject: true, // Usually invalid for timestamps
      category: "boundary",
      severity: "medium",
    },
    {
      label: "Negative timestamp",
      value: -1,
      shouldReject: true,
      category: "boundary",
      severity: "high",
    },
    {
      label: "Pre-Unix epoch (1960)",
      value: -315619200000,
      shouldReject: true,
      category: "boundary",
      severity: "medium",
    },
    {
      label: "Y2K38 problem (32-bit overflow)",
      value: 2147483647000, // Jan 19, 2038
      shouldReject: false,
      category: "overflow",
      severity: "high",
    },
    {
      label: "Far future (year 3000)",
      value: 32503680000000,
      shouldReject: false, // Valid but suspicious
      category: "boundary",
      severity: "low",
    },
    {
      label: "Far past (year 1000)",
      value: -30610224000000,
      shouldReject: true,
      category: "boundary",
      severity: "medium",
    },
    {
      label: "Reasonable current time",
      value: Date.now(),
      shouldReject: false,
      category: "boundary",
      severity: "low",
    },
    {
      label: "JavaScript max date",
      value: 8640000000000000,
      shouldReject: true,
      category: "overflow",
      severity: "high",
    },
    {
      label: "JavaScript min date",
      value: -8640000000000000,
      shouldReject: true,
      category: "underflow",
      severity: "high",
    },
  ];
}

// ============================================================================
// STRING EDGE CASES
// ============================================================================

/**
 * Generate string edge cases including unicode, special chars, injection
 */
export function stringEdgeCases(): LabeledValue<string>[] {
  return [
    // Empty and whitespace
    {
      label: "Empty string",
      value: "",
      shouldReject: true,
      category: "empty",
      severity: "medium",
    },
    {
      label: "Single space",
      value: " ",
      shouldReject: true,
      category: "empty",
      severity: "medium",
    },
    {
      label: "Multiple spaces",
      value: "     ",
      shouldReject: true,
      category: "empty",
      severity: "medium",
    },
    {
      label: "Tab character",
      value: "\t",
      shouldReject: true,
      category: "empty",
      severity: "medium",
    },
    {
      label: "Newline only",
      value: "\n",
      shouldReject: true,
      category: "empty",
      severity: "medium",
    },
    {
      label: "Mixed whitespace",
      value: " \t\n\r ",
      shouldReject: true,
      category: "empty",
      severity: "medium",
    },
    // Unicode
    {
      label: "Emoji",
      value: "💀🔥✨",
      shouldReject: false,
      category: "unicode",
      severity: "low",
    },
    {
      label: "RTL text (Arabic)",
      value: "مرحبا",
      shouldReject: false,
      category: "unicode",
      severity: "low",
    },
    {
      label: "Mixed RTL/LTR",
      value: "Hello مرحبا World",
      shouldReject: false,
      category: "unicode",
      severity: "medium",
    },
    {
      label: "Zero-width joiner",
      value: "a\u200Db",
      shouldReject: false,
      category: "unicode",
      severity: "medium",
    },
    {
      label: "Zero-width non-joiner",
      value: "a\u200Cb",
      shouldReject: false,
      category: "unicode",
      severity: "medium",
    },
    {
      label: "Homoglyph attack (Cyrillic 'a')",
      value: "pаypal", // 'а' is Cyrillic
      shouldReject: false, // Should be flagged but not rejected
      category: "unicode",
      severity: "high",
    },
    {
      label: "Unicode NULL",
      value: "test\u0000value",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "Unicode replacement char",
      value: "test\uFFFDvalue",
      shouldReject: false,
      category: "unicode",
      severity: "low",
    },
    // Length extremes
    {
      label: "Very long string (10KB)",
      value: "x".repeat(10240),
      shouldReject: true,
      category: "overflow",
      severity: "medium",
    },
    {
      label: "Very long string (1MB)",
      value: "x".repeat(1048576),
      shouldReject: true,
      category: "overflow",
      severity: "high",
    },
    {
      label: "At max typical limit (255)",
      value: "x".repeat(255),
      shouldReject: false,
      category: "boundary",
      severity: "low",
    },
    {
      label: "Just over max (256)",
      value: "x".repeat(256),
      shouldReject: true,
      category: "boundary",
      severity: "low",
    },
    // Special characters
    {
      label: "Backslash",
      value: "test\\value",
      shouldReject: false,
      category: "special-chars",
      severity: "low",
    },
    {
      label: "Double quotes",
      value: 'test"value',
      shouldReject: false,
      category: "special-chars",
      severity: "low",
    },
    {
      label: "Single quotes",
      value: "test'value",
      shouldReject: false,
      category: "special-chars",
      severity: "low",
    },
    {
      label: "Angle brackets",
      value: "test<script>alert(1)</script>value",
      shouldReject: true, // XSS
      category: "injection",
      severity: "critical",
    },
  ];
}

/**
 * Generate injection-specific test cases (SQL, XSS, command injection)
 */
export function injectionEdgeCases(): LabeledValue<string>[] {
  return [
    // SQL Injection
    {
      label: "SQL injection (single quote)",
      value: "'; DROP TABLE users; --",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "SQL injection (union)",
      value: "' UNION SELECT * FROM users --",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "SQL injection (boolean)",
      value: "' OR '1'='1",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    // XSS
    {
      label: "XSS (script tag)",
      value: "<script>alert('xss')</script>",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "XSS (img onerror)",
      value: '<img src="x" onerror="alert(1)">',
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "XSS (event handler)",
      value: '<div onmouseover="alert(1)">hover</div>',
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "XSS (javascript: URL)",
      value: "javascript:alert(1)",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "XSS (data: URL)",
      value: "data:text/html,<script>alert(1)</script>",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    // Command injection
    {
      label: "Command injection (semicolon)",
      value: "test; rm -rf /",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "Command injection (pipe)",
      value: "test | cat /etc/passwd",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "Command injection (backticks)",
      value: "`rm -rf /`",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "Command injection ($())",
      value: "$(rm -rf /)",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    // Template injection
    {
      label: "Template injection (Handlebars)",
      value: "{{constructor.constructor('return this')()}}",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "Template injection (EJS)",
      value: "<%- global.process.mainModule.require('child_process').execSync('id') %>",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    // Path traversal
    {
      label: "Path traversal (../)",
      value: "../../../etc/passwd",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "Path traversal (encoded)",
      value: "..%2F..%2F..%2Fetc%2Fpasswd",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    // LDAP injection
    {
      label: "LDAP injection",
      value: "*)(uid=*))(|(uid=*",
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    // JSON injection
    {
      label: "JSON injection (property pollution)",
      value: '{"__proto__": {"admin": true}}',
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
  ];
}

// ============================================================================
// ARRAY EDGE CASES
// ============================================================================

/**
 * Generate array edge cases including empty, large, and nested arrays
 */
export function arrayEdgeCases<T>(
  itemGenerator: () => T
): LabeledValue<T[]>[] {
  return [
    {
      label: "Empty array",
      value: [],
      shouldReject: false, // Context dependent
      category: "empty",
      severity: "low",
    },
    {
      label: "Single item",
      value: [itemGenerator()],
      shouldReject: false,
      category: "boundary",
      severity: "low",
    },
    {
      label: "10 items",
      value: Array.from({ length: 10 }, itemGenerator),
      shouldReject: false,
      category: "boundary",
      severity: "low",
    },
    {
      label: "100 items (typical max)",
      value: Array.from({ length: 100 }, itemGenerator),
      shouldReject: false,
      category: "boundary",
      severity: "low",
    },
    {
      label: "1000 items (stress test)",
      value: Array.from({ length: 1000 }, itemGenerator),
      shouldReject: true,
      category: "overflow",
      severity: "medium",
    },
    {
      label: "10000 items (DoS risk)",
      value: Array.from({ length: 10000 }, itemGenerator),
      shouldReject: true,
      category: "overflow",
      severity: "high",
    },
  ];
}

/**
 * Generate deeply nested object edge cases
 */
export function nestedObjectEdgeCases(maxDepth: number = 100): LabeledValue<object>[] {
  const createNestedObject = (depth: number): object => {
    if (depth === 0) return { value: "leaf" };
    return { nested: createNestedObject(depth - 1) };
  };

  return [
    {
      label: "Flat object",
      value: { a: 1, b: 2, c: 3 },
      shouldReject: false,
      category: "nested",
      severity: "low",
    },
    {
      label: "2 levels deep",
      value: createNestedObject(2),
      shouldReject: false,
      category: "nested",
      severity: "low",
    },
    {
      label: "10 levels deep",
      value: createNestedObject(10),
      shouldReject: false,
      category: "nested",
      severity: "low",
    },
    {
      label: "50 levels deep (suspicious)",
      value: createNestedObject(50),
      shouldReject: true,
      category: "nested",
      severity: "medium",
    },
    {
      label: `${maxDepth} levels deep (stack overflow risk)`,
      value: createNestedObject(maxDepth),
      shouldReject: true,
      category: "nested",
      severity: "high",
    },
    {
      label: "Wide object (100 keys)",
      value: Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [`key${i}`, i])
      ),
      shouldReject: false,
      category: "nested",
      severity: "low",
    },
    {
      label: "Very wide object (10000 keys)",
      value: Object.fromEntries(
        Array.from({ length: 10000 }, (_, i) => [`key${i}`, i])
      ),
      shouldReject: true,
      category: "nested",
      severity: "high",
    },
  ];
}

// ============================================================================
// NULL/UNDEFINED EDGE CASES
// ============================================================================

/**
 * Generate null/undefined/missing value edge cases
 */
export function nullishEdgeCases(): LabeledValue<unknown>[] {
  return [
    {
      label: "null",
      value: null,
      shouldReject: true,
      category: "null",
      severity: "medium",
    },
    {
      label: "undefined",
      value: undefined,
      shouldReject: true,
      category: "null",
      severity: "medium",
    },
    {
      label: "String 'null'",
      value: "null",
      shouldReject: false, // Valid string
      category: "type-coercion",
      severity: "low",
    },
    {
      label: "String 'undefined'",
      value: "undefined",
      shouldReject: false, // Valid string
      category: "type-coercion",
      severity: "low",
    },
    {
      label: "Empty object",
      value: {},
      shouldReject: false, // Context dependent
      category: "empty",
      severity: "low",
    },
    {
      label: "Object with null prototype",
      value: Object.create(null),
      shouldReject: false,
      category: "null",
      severity: "medium",
    },
  ];
}

// ============================================================================
// TYPE COERCION EDGE CASES
// ============================================================================

/**
 * Generate type coercion edge cases (values that might be wrongly coerced)
 */
export function typeCoercionEdgeCases(): LabeledValue<unknown>[] {
  return [
    // String to number coercion
    {
      label: "String '0' (falsy when coerced)",
      value: "0",
      shouldReject: false,
      category: "type-coercion",
      severity: "medium",
    },
    {
      label: "String 'false'",
      value: "false",
      shouldReject: false,
      category: "type-coercion",
      severity: "medium",
    },
    {
      label: "String 'true'",
      value: "true",
      shouldReject: false,
      category: "type-coercion",
      severity: "medium",
    },
    {
      label: "String 'NaN'",
      value: "NaN",
      shouldReject: false,
      category: "type-coercion",
      severity: "medium",
    },
    {
      label: "String 'Infinity'",
      value: "Infinity",
      shouldReject: false,
      category: "type-coercion",
      severity: "medium",
    },
    // Array coercion
    {
      label: "Array [1] (coerces to '1')",
      value: [1],
      shouldReject: false,
      category: "type-coercion",
      severity: "low",
    },
    {
      label: "Array [] (coerces to '')",
      value: [],
      shouldReject: false,
      category: "type-coercion",
      severity: "low",
    },
    // Object coercion
    {
      label: "Object {} (coerces to '[object Object]')",
      value: {},
      shouldReject: false,
      category: "type-coercion",
      severity: "low",
    },
    {
      label: "Object with valueOf",
      value: { valueOf: () => 42 },
      shouldReject: false,
      category: "type-coercion",
      severity: "medium",
    },
    {
      label: "Object with toString",
      value: { toString: () => "evil" },
      shouldReject: false,
      category: "type-coercion",
      severity: "medium",
    },
    // Prototype pollution attempts
    {
      label: "__proto__ key",
      value: { __proto__: { admin: true } },
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
    {
      label: "constructor.prototype",
      value: { constructor: { prototype: { admin: true } } },
      shouldReject: true,
      category: "injection",
      severity: "critical",
    },
  ];
}

// ============================================================================
// COMBINED GENERATORS
// ============================================================================

/**
 * Get all edge cases for a specific category
 */
export function getEdgeCasesByCategory(
  category: EdgeCaseCategory
): LabeledValue<unknown>[] {
  const allCases: LabeledValue<unknown>[] = [
    ...numericEdgeCases(),
    ...timestampEdgeCases(),
    ...stringEdgeCases(),
    ...injectionEdgeCases(),
    ...nullishEdgeCases(),
    ...typeCoercionEdgeCases(),
    ...nestedObjectEdgeCases(),
    ...arrayEdgeCases(() => "item"),
  ];

  return allCases.filter((c) => c.category === category);
}

/**
 * Get all edge cases above a certain severity
 */
export function getEdgeCasesBySeverity(
  minSeverity: "low" | "medium" | "high" | "critical"
): LabeledValue<unknown>[] {
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  const minLevel = severityOrder[minSeverity];

  const allCases: LabeledValue<unknown>[] = [
    ...numericEdgeCases(),
    ...timestampEdgeCases(),
    ...stringEdgeCases(),
    ...injectionEdgeCases(),
    ...nullishEdgeCases(),
    ...typeCoercionEdgeCases(),
    ...nestedObjectEdgeCases(),
    ...arrayEdgeCases(() => "item"),
  ];

  return allCases.filter(
    (c) => severityOrder[c.severity] >= minLevel
  );
}

/**
 * Get all critical security-related edge cases
 */
export function getSecurityEdgeCases(): LabeledValue<unknown>[] {
  return getEdgeCasesBySeverity("critical");
}
