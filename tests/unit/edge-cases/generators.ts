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
 */
export function numericEdgeCases(): LabeledValue<number>[] {
  return [
    { label: "MAX_SAFE_INTEGER", value: Number.MAX_SAFE_INTEGER, shouldReject: false, category: "overflow", severity: "medium" },
    { label: "MAX_SAFE_INTEGER + 1", value: Number.MAX_SAFE_INTEGER + 1, shouldReject: true, category: "overflow", severity: "high" },
    { label: "MAX_VALUE", value: Number.MAX_VALUE, shouldReject: true, category: "overflow", severity: "high" },
    { label: "Positive Infinity", value: Infinity, shouldReject: true, category: "overflow", severity: "critical" },
    { label: "MIN_SAFE_INTEGER", value: Number.MIN_SAFE_INTEGER, shouldReject: false, category: "underflow", severity: "medium" },
    { label: "MIN_SAFE_INTEGER - 1", value: Number.MIN_SAFE_INTEGER - 1, shouldReject: true, category: "underflow", severity: "high" },
    { label: "Negative Infinity", value: -Infinity, shouldReject: true, category: "underflow", severity: "critical" },
    { label: "Positive zero", value: 0, shouldReject: false, category: "boundary", severity: "low" },
    { label: "Negative zero", value: -0, shouldReject: false, category: "boundary", severity: "low" },
    { label: "NaN", value: NaN, shouldReject: true, category: "type-coercion", severity: "critical" },
    { label: "Negative one", value: -1, shouldReject: false, category: "boundary", severity: "low" },
    { label: "Smallest positive float", value: Number.MIN_VALUE, shouldReject: false, category: "boundary", severity: "low" },
    { label: "Epsilon", value: Number.EPSILON, shouldReject: false, category: "boundary", severity: "low" },
  ];
}

/**
 * Generate timestamp-specific edge cases
 */
export function timestampEdgeCases(): LabeledValue<number>[] {
  return [
    { label: "Unix epoch (0)", value: 0, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Negative timestamp", value: -1, shouldReject: true, category: "boundary", severity: "high" },
    { label: "Pre-Unix epoch (1960)", value: -315619200000, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Y2K38 problem", value: 2147483647000, shouldReject: false, category: "overflow", severity: "high" },
    { label: "Far future (year 3000)", value: 32503680000000, shouldReject: false, category: "boundary", severity: "low" },
    { label: "Far past (year 1000)", value: -30610224000000, shouldReject: true, category: "boundary", severity: "medium" },
    { label: "Reasonable current time", value: Date.now(), shouldReject: false, category: "boundary", severity: "low" },
    { label: "JavaScript max date", value: 8640000000000000, shouldReject: true, category: "overflow", severity: "high" },
    { label: "JavaScript min date", value: -8640000000000000, shouldReject: true, category: "underflow", severity: "high" },
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
    { label: "Empty string", value: "", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Single space", value: " ", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Multiple spaces", value: "     ", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Tab character", value: "\t", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Newline only", value: "\n", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Mixed whitespace", value: " \t\n\r ", shouldReject: true, category: "empty", severity: "medium" },
    { label: "Emoji", value: "💀🔥✨", shouldReject: false, category: "unicode", severity: "low" },
    { label: "RTL text (Arabic)", value: "مرحبا", shouldReject: false, category: "unicode", severity: "low" },
    { label: "Mixed RTL/LTR", value: "Hello مرحبا World", shouldReject: false, category: "unicode", severity: "medium" },
    { label: "Zero-width joiner", value: "a\u200Db", shouldReject: false, category: "unicode", severity: "medium" },
    { label: "Unicode NULL", value: "test\u0000value", shouldReject: true, category: "injection", severity: "critical" },
    { label: "Very long string (10KB)", value: "x".repeat(10240), shouldReject: true, category: "overflow", severity: "medium" },
    { label: "At max typical limit (255)", value: "x".repeat(255), shouldReject: false, category: "boundary", severity: "low" },
    { label: "Just over max (256)", value: "x".repeat(256), shouldReject: true, category: "boundary", severity: "low" },
    { label: "XSS script tag", value: "<script>alert(1)</script>", shouldReject: true, category: "injection", severity: "critical" },
  ];
}

/**
 * Generate injection-specific test cases
 */
export function injectionEdgeCases(): LabeledValue<string>[] {
  return [
    { label: "SQL injection (single quote)", value: "'; DROP TABLE users; --", shouldReject: true, category: "injection", severity: "critical" },
    { label: "SQL injection (union)", value: "' UNION SELECT * FROM users --", shouldReject: true, category: "injection", severity: "critical" },
    { label: "SQL injection (boolean)", value: "' OR '1'='1", shouldReject: true, category: "injection", severity: "critical" },
    { label: "XSS (script tag)", value: "<script>alert('xss')</script>", shouldReject: true, category: "injection", severity: "critical" },
    { label: "XSS (img onerror)", value: '<img src="x" onerror="alert(1)">', shouldReject: true, category: "injection", severity: "critical" },
    { label: "XSS (javascript: URL)", value: "javascript:alert(1)", shouldReject: true, category: "injection", severity: "critical" },
    { label: "Command injection (semicolon)", value: "test; rm -rf /", shouldReject: true, category: "injection", severity: "critical" },
    { label: "Command injection (pipe)", value: "test | cat /etc/passwd", shouldReject: true, category: "injection", severity: "critical" },
    { label: "Path traversal (../)", value: "../../../etc/passwd", shouldReject: true, category: "injection", severity: "critical" },
    { label: "JSON injection (__proto__)", value: '{"__proto__": {"admin": true}}', shouldReject: true, category: "injection", severity: "critical" },
  ];
}

// ============================================================================
// ARRAY EDGE CASES
// ============================================================================

/**
 * Generate array edge cases
 */
export function arrayEdgeCases<T>(itemGenerator: () => T): LabeledValue<T[]>[] {
  return [
    { label: "Empty array", value: [], shouldReject: false, category: "empty", severity: "low" },
    { label: "Single item", value: [itemGenerator()], shouldReject: false, category: "boundary", severity: "low" },
    { label: "100 items", value: Array.from({ length: 100 }, itemGenerator), shouldReject: false, category: "boundary", severity: "low" },
    { label: "1000 items", value: Array.from({ length: 1000 }, itemGenerator), shouldReject: true, category: "overflow", severity: "medium" },
    { label: "10000 items", value: Array.from({ length: 10000 }, itemGenerator), shouldReject: true, category: "overflow", severity: "high" },
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
    { label: "Flat object", value: { a: 1, b: 2, c: 3 }, shouldReject: false, category: "nested", severity: "low" },
    { label: "2 levels deep", value: createNestedObject(2), shouldReject: false, category: "nested", severity: "low" },
    { label: "10 levels deep", value: createNestedObject(10), shouldReject: false, category: "nested", severity: "low" },
    { label: "50 levels deep", value: createNestedObject(50), shouldReject: true, category: "nested", severity: "medium" },
    { label: `${maxDepth} levels deep`, value: createNestedObject(maxDepth), shouldReject: true, category: "nested", severity: "high" },
    { label: "Wide object (100 keys)", value: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i])), shouldReject: false, category: "nested", severity: "low" },
    { label: "Very wide object (10000 keys)", value: Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`key${i}`, i])), shouldReject: true, category: "nested", severity: "high" },
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
    { label: "null", value: null, shouldReject: true, category: "null", severity: "medium" },
    { label: "undefined", value: undefined, shouldReject: true, category: "null", severity: "medium" },
    { label: "String 'null'", value: "null", shouldReject: false, category: "type-coercion", severity: "low" },
    { label: "String 'undefined'", value: "undefined", shouldReject: false, category: "type-coercion", severity: "low" },
    { label: "Empty object", value: {}, shouldReject: false, category: "empty", severity: "low" },
    { label: "Object with null prototype", value: Object.create(null), shouldReject: false, category: "null", severity: "medium" },
  ];
}

// ============================================================================
// TYPE COERCION EDGE CASES
// ============================================================================

/**
 * Generate type coercion edge cases
 */
export function typeCoercionEdgeCases(): LabeledValue<unknown>[] {
  // Create object with __proto__ as a real enumerable key
  const protoObject = Object.create(null);
  Object.defineProperty(protoObject, "__proto__", {
    value: { admin: true },
    enumerable: true,
    writable: true,
    configurable: true,
  });

  return [
    { label: "String '0'", value: "0", shouldReject: false, category: "type-coercion", severity: "medium" },
    { label: "String 'false'", value: "false", shouldReject: false, category: "type-coercion", severity: "medium" },
    { label: "String 'true'", value: "true", shouldReject: false, category: "type-coercion", severity: "medium" },
    { label: "String 'NaN'", value: "NaN", shouldReject: false, category: "type-coercion", severity: "medium" },
    { label: "Array [1]", value: [1], shouldReject: false, category: "type-coercion", severity: "low" },
    { label: "__proto__ key", value: protoObject, shouldReject: true, category: "injection", severity: "critical" },
    { label: "constructor.prototype", value: { constructor: { prototype: { admin: true } } }, shouldReject: true, category: "injection", severity: "critical" },
  ];
}

// ============================================================================
// COMBINED GENERATORS
// ============================================================================

/**
 * Get all edge cases for a specific category
 */
export function getEdgeCasesByCategory(category: EdgeCaseCategory): LabeledValue<unknown>[] {
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
export function getEdgeCasesBySeverity(minSeverity: "low" | "medium" | "high" | "critical"): LabeledValue<unknown>[] {
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

  return allCases.filter((c) => severityOrder[c.severity] >= minLevel);
}

/**
 * Get all critical security-related edge cases
 */
export function getSecurityEdgeCases(): LabeledValue<unknown>[] {
  return getEdgeCasesBySeverity("critical");
}
