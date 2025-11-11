/**
 * [P1][API][SHARED] Onboarding API Schemas
 * Tags: api, validation, zod, onboarding
 *
 * Overview:
 * - Centralized Zod schemas for all onboarding endpoints
 * - Ensures consistent validation across all ONB routes
 * - Type-safe request/response handling
 */

import { z } from "zod";

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

export const VerifyEligibilityRequestSchema = z.object({
  selfDeclaredRole: z
    .enum([
      "owner_founder_director",
      "manager_supervisor",
      "hr_person",
      "scheduling_lead",
      "operations",
      "other",
    ])
    .describe("User's self-declared role"),
});

export type VerifyEligibilityRequest = z.infer<typeof VerifyEligibilityRequestSchema>;

export const AdminFormRequestSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  taxIdType: z.enum(["ssn", "ein"]),
  taxIdLast4: z.string().regex(/^\d{4}$/, "Must be last 4 digits"),
});

export type AdminFormRequest = z.infer<typeof AdminFormRequestSchema>;

export const CreateNetworkOrgRequestSchema = z.object({
  networkName: z.string().min(2, "Network name too short"),
  orgName: z.string().min(2, "Org name too short"),
  venueName: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type CreateNetworkOrgRequest = z.infer<typeof CreateNetworkOrgRequestSchema>;

export const CreateNetworkCorporateRequestSchema = z.object({
  networkName: z.string().min(2, "Network name too short"),
  corporateName: z.string().min(2, "Corporate name too short"),
  venueName: z.string().optional(),
});

export type CreateNetworkCorporateRequest = z.infer<typeof CreateNetworkCorporateRequestSchema>;

export const ActivateNetworkRequestSchema = z.object({
  networkId: z.string().min(1, "Network ID required"),
});

export type ActivateNetworkRequest = z.infer<typeof ActivateNetworkRequestSchema>;

export const JoinWithTokenRequestSchema = z.object({
  token: z.string().min(1, "Token required"),
});

export type JoinWithTokenRequest = z.infer<typeof JoinWithTokenRequestSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const EligibilityResponseSchema = z.object({
  ok: z.boolean(),
  allowed: z.boolean(),
  reason: z.string().nullable().optional(),
  effectiveRole: z.string().optional(),
});

export type EligibilityResponse = z.infer<typeof EligibilityResponseSchema>;

export const AdminFormResponseSchema = z.object({
  ok: z.boolean(),
  token: z.string().optional(),
  message: z.string().optional(),
});

export type AdminFormResponse = z.infer<typeof AdminFormResponseSchema>;

export const CreateNetworkResponseSchema = z.object({
  ok: z.boolean(),
  networkId: z.string(),
  orgId: z.string(),
  role: z.string(),
});

export type CreateNetworkResponse = z.infer<typeof CreateNetworkResponseSchema>;

export const ActivateNetworkResponseSchema = z.object({
  ok: z.boolean(),
  networkId: z.string(),
  status: z.string(),
});

export type ActivateNetworkResponse = z.infer<typeof ActivateNetworkResponseSchema>;

export const JoinTokenResponseSchema = z.object({
  ok: z.boolean(),
  networkId: z.string(),
  orgId: z.string(),
  role: z.string(),
});

export type JoinTokenResponse = z.infer<typeof JoinTokenResponseSchema>;

// ============================================================================
// ERROR SCHEMAS
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.string()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
