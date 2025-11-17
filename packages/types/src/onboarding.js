// [P2][SCHEMA][ONBOARDING] Onboarding validation schemas
// Tags: P2, SCHEMA, ONBOARDING, ZOD
/**
 * @fileoverview
 * Zod schemas for user onboarding flows (v14).
 * Defines request/response contracts for creating orgs, corporate networks, and joining with tokens.
 * Also defines the canonical OnboardingState shape stored in users/{uid}.onboarding.
 */
import { z } from "zod";
export const CreateCorporateOnboardingSchema = z.object({
    corporateName: z.string().min(1),
    brandName: z.string().optional(),
    formToken: z.string().optional(),
});
export const JoinWithTokenSchema = z.object({
    joinToken: z.string().min(1),
});
// Schema for creating an organization during onboarding (v14)
export const CreateOrgOnboardingSchema = z.object({
    orgName: z.string().min(1),
    venueName: z.string().min(1),
    formToken: z.string().min(1),
    location: z
        .object({
        street1: z.string().optional(),
        street2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        countryCode: z.string().min(2).max(2),
        timeZone: z.string().min(1),
    })
        .optional(),
});
export const OnboardingIntent = z.enum(["create_org", "create_corporate", "join_existing"]);
export const OnboardingStatus = z.enum(["not_started", "in_progress", "complete"]);
export const OnboardingStateSchema = z.object({
    status: OnboardingStatus,
    intent: OnboardingIntent.optional(),
    stage: z.enum(["profile", "admin_form", "network_created", "joined_workspace"]).optional(),
    primaryNetworkId: z.string().optional(),
    primaryOrgId: z.string().optional(),
    primaryVenueId: z.string().optional(),
    completedAt: z.number().int().positive().optional(),
    lastUpdatedAt: z.number().int().positive().optional(),
});
