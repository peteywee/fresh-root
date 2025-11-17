// [P0][INTEGRITY][VALIDATION] Schemas
// Tags: P0, INTEGRITY, VALIDATION
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
export const AdminFormRequestSchema = z.object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    taxIdType: z.enum(["ssn", "ein"]),
    taxIdLast4: z.string().regex(/^\d{4}$/, "Must be last 4 digits"),
});
export const CreateNetworkOrgRequestSchema = z.object({
    networkName: z.string().min(2, "Network name too short"),
    orgName: z.string().min(2, "Org name too short"),
    venueName: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
});
export const CreateNetworkCorporateRequestSchema = z.object({
    networkName: z.string().min(2, "Network name too short"),
    corporateName: z.string().min(2, "Corporate name too short"),
    venueName: z.string().optional(),
});
export const ActivateNetworkRequestSchema = z.object({
    networkId: z.string().min(1, "Network ID required"),
});
export const JoinWithTokenRequestSchema = z.object({
    token: z.string().min(1, "Token required"),
});
// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================
export const EligibilityResponseSchema = z.object({
    ok: z.boolean(),
    allowed: z.boolean(),
    reason: z.string().nullable().optional(),
    effectiveRole: z.string().optional(),
});
export const AdminFormResponseSchema = z.object({
    ok: z.boolean(),
    token: z.string().optional(),
    message: z.string().optional(),
});
export const CreateNetworkResponseSchema = z.object({
    ok: z.boolean(),
    networkId: z.string(),
    orgId: z.string(),
    role: z.string(),
});
export const ActivateNetworkResponseSchema = z.object({
    ok: z.boolean(),
    networkId: z.string(),
    status: z.string(),
});
export const JoinTokenResponseSchema = z.object({
    ok: z.boolean(),
    networkId: z.string(),
    orgId: z.string(),
    role: z.string(),
});
// ============================================================================
// ERROR SCHEMAS
// ============================================================================
export const ErrorResponseSchema = z.object({
    error: z.string(),
    details: z.record(z.string()).optional(),
});
