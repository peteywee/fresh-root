// [P0][TEST][SCHEMAS] Edge Case Test Schemas
// Tags: P0, TEST, EDGE-CASES, SCHEMAS
// Created: 2025-12-17
// Purpose: Pre-built schemas with edge case handling for common patterns
//
// USAGE: Import these schemas or use them as reference for your own schemas
// Each schema is designed to handle edge cases safely

import { z } from "zod";

/**
 * Safe string schema with injection protection
 * Use for names, titles, descriptions
 */
export const SafeStringSchema = z
  .string()
  .min(1, "String cannot be empty")
  .max(255, "String too long (max 255 characters)")
  .refine((val) => val.trim().length > 0, "String cannot be only whitespace")
  .refine((val) => !val.includes("\u0000"), "NULL bytes not allowed")
  .refine((val) => !/<script/i.test(val), "HTML script tags not allowed")
  .refine((val) => !/javascript:/i.test(val), "JavaScript URLs not allowed")
  .refine((val) => !/on\w+\s*=/i.test(val), "Event handlers not allowed")
  .refine((val) => !/<\s*img[^>]*>/i.test(val), "HTML img tags not allowed");

/**
 * Safe email schema with comprehensive validation
 */
export const SafeEmailSchema = z
  .string()
  .email("Invalid email format")
  .max(254, "Email too long (max 254 characters)")
  .refine((val) => !/<script/i.test(val), "Invalid characters in email")
  .transform((val) => val.toLowerCase().trim());

/**
 * Safe positive integer schema
 * Use for IDs, counts, quantities
 */
export const SafePositiveIntegerSchema = z
  .number()
  .int("Must be an integer")
  .positive("Must be positive")
  .finite("Must be finite")
  .safe("Number too large for safe integer representation");

/**
 * Safe timestamp schema (milliseconds since epoch)
 * Rejects timestamps before 2000 and after 2100
 */
export const SafeTimestampSchema = z
  .number()
  .int("Timestamp must be an integer")
  .positive("Timestamp must be positive")
  .finite("Timestamp must be finite")
  .refine(
    (val) => val >= 946684800000, // Jan 1, 2000
    "Timestamp too old (before year 2000)",
  )
  .refine(
    (val) => val <= 4102444800000, // Jan 1, 2100
    "Timestamp too far in future (after year 2100)",
  );

/**
 * Safe UUID schema
 */
export const SafeUUIDSchema = z
  .string()
  .uuid("Invalid UUID format")
  .refine((val) => val.length === 36, "UUID must be exactly 36 characters");

/**
 * Check if an object has prototype pollution attempts
 * This is a standalone function because z.record has Zod 4 edge cases
 */
export function hasPrototypePollution(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) return false;

  // Check for __proto__ as own property
  if (Object.hasOwn(obj, "__proto__")) return true;

  // Check for prototype key
  if (Object.hasOwn(obj, "prototype")) return true;

  // Check for constructor with prototype (pollution vector)
  const rec = obj as Record<string, unknown>;
  const c = rec["constructor"];
  if (c && typeof c === "object" && c !== null && "prototype" in c) {
    return true;
  }

  return false;
}

/**
 * Safe JSON object schema (protects against prototype pollution)
 * Note: Use z.object for specific schemas; this is for loose object validation
 */
export const SafeObjectSchema = z
  .object({})
  .passthrough()
  .refine((obj) => !hasPrototypePollution(obj), "Prototype pollution attempt detected");

/**
 * Safe array schema with length limits
 */
export function SafeArraySchema<T extends z.ZodTypeAny>(itemSchema: T, maxItems = 100) {
  return z.array(itemSchema).max(maxItems, `Array too long (max ${maxItems} items)`);
}

/**
 * Safe nested object schema with depth limit
 */
export function SafeNestedSchema<T extends z.ZodRawShape>(shape: T, maxDepth = 10) {
  // Note: This is a simplified version. For true depth limiting,
  // you'd need a custom recursive schema.
  return z.object(shape).refine((obj) => {
    const depth = calculateDepth(obj);
    return depth <= maxDepth;
  }, `Object nesting too deep (max ${maxDepth} levels)`);
}

/**
 * Calculate the depth of a nested object
 */
function calculateDepth(obj: unknown, currentDepth = 0): number {
  if (currentDepth > 100) return currentDepth; // Prevent stack overflow
  if (typeof obj !== "object" || obj === null) return currentDepth;

  let maxChildDepth = currentDepth;
  for (const value of Object.values(obj)) {
    const childDepth = calculateDepth(value, currentDepth + 1);
    maxChildDepth = Math.max(maxChildDepth, childDepth);
  }

  return maxChildDepth;
}

// ============================================================================
// COMPOSITE SCHEMAS FOR COMMON PATTERNS
// ============================================================================

/**
 * Standard API input for creating resources
 * Name + optional description
 */
export const CreateResourceInputSchema = z.object({
  name: SafeStringSchema,
  description: SafeStringSchema.optional(),
});

/**
 * Standard pagination input
 */
export const PaginationInputSchema = z.object({
  page: SafePositiveIntegerSchema.default(1),
  limit: SafePositiveIntegerSchema.max(100).default(20),
  cursor: z.string().optional(),
});

/**
 * Standard date range input
 */
export const DateRangeInputSchema = z
  .object({
    startTime: SafeTimestampSchema,
    endTime: SafeTimestampSchema,
  })
  .refine((data) => data.endTime > data.startTime, "End time must be after start time");

/**
 * Standard ID parameter (UUID or string ID)
 */
export const IDParamSchema = z.union([
  SafeUUIDSchema,
  z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid ID format"),
]);

// ============================================================================
// SCHEMA HARDENING UTILITIES
// ============================================================================

/**
 * Wrap any schema with common safety checks
 */
export function hardenSchema<T extends z.ZodTypeAny>(schema: T): T {
  // Type coercion: we're just adding refinements, not changing the type
  return schema.refine((val) => {
    // Reject if it's a string containing potential injection
    if (typeof val === "string") {
      if (/<script/i.test(val)) return false;
      if (/javascript:/i.test(val)) return false;
      if (/data:text\/html/i.test(val)) return false;
    }
    return true;
  }, "Potential injection detected") as T;
}

/**
 * Create a schema that rejects prototype pollution
 */
export function safeObject<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).refine((obj) => {
    const keys = Object.keys(obj);
    const dangerousKeys = ["__proto__", "constructor", "prototype"];
    return !keys.some((k) => dangerousKeys.includes(k));
  }, "Dangerous object keys detected");
}
