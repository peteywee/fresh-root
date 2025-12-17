// [P0][TEST][SCHEMAS] Edge Case Test Schemas
// Tags: P0, TEST, EDGE-CASES, SCHEMAS
// Created: 2025-12-17

import { z } from "zod";

/**
 * Safe string schema with injection protection
 * Rejects: empty, XSS, javascript: URLs, HTML tags with event handlers, NULL bytes
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
 * Safe email schema
 */
export const SafeEmailSchema = z
  .string()
  .email("Invalid email format")
  .max(254, "Email too long")
  .refine((val) => !/<script/i.test(val), "Invalid characters in email")
  .transform((val) => val.toLowerCase().trim());

/**
 * Safe positive integer schema
 */
export const SafePositiveIntegerSchema = z
  .number()
  .int("Must be an integer")
  .positive("Must be positive")
  .finite("Must be finite")
  .safe("Number too large for safe integer representation");

/**
 * Safe timestamp schema (milliseconds since epoch, 2000-2100)
 */
export const SafeTimestampSchema = z
  .number()
  .int("Timestamp must be an integer")
  .positive("Timestamp must be positive")
  .finite("Timestamp must be finite")
  .refine((val) => val >= 946684800000, "Timestamp too old (before year 2000)")
  .refine((val) => val <= 4102444800000, "Timestamp too far in future (after year 2100)");

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
 * Standard date range input
 */
export const DateRangeInputSchema = z
  .object({
    startTime: SafeTimestampSchema,
    endTime: SafeTimestampSchema,
  })
  .refine((data) => data.endTime > data.startTime, "End time must be after start time");
