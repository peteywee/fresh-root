// [P2][APP][CODE] Errors
// Tags: P2, APP, CODE
/**
 * [P1][TYPES][ERRORS] Shared error response types
 * Tags: types, api, errors
 *
 * Overview:
 * - Defines a canonical ErrorResponse shape for APIs
 * - Central place to register stable error codes used across endpoints
 */

import { z } from "zod";

// Central list of stable error codes used in onboarding + infra.
// Extend this union as you standardize more endpoints.
export const ErrorCode = z.enum([
  // Onboarding eligibility
  "ONB_ELIGIBILITY_EMAIL_UNVERIFIED",
  "ONB_ELIGIBILITY_ROLE_DENIED",
  "ONB_ELIGIBILITY_RATE_LIMITED",
  "ONB_ELIGIBILITY_INTERNAL_ERROR",

  // Network activation
  "ONB_ACTIVATE_FORBIDDEN",
  "ONB_ACTIVATE_ALREADY_ACTIVE",
  "ONB_ACTIVATE_INVALID_STATE",

  // Generic / infra
  "GEN_NOT_AUTHENTICATED",
  "GEN_FORBIDDEN",
  "GEN_INTERNAL_ERROR",
]);

export type ErrorCode = z.infer<typeof ErrorCode>;

export const ErrorResponseSchema = z.object({
  error: z.string(), // human-readable summary
  code: ErrorCode.optional(), // stable machine-friendly code
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
