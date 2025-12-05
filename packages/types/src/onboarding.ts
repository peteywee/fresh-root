// [P1][ONBOARDING][SCHEMA] Onboarding workflow schema
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

export type CreateCorporateOnboarding = z.infer<typeof CreateCorporateOnboardingSchema>;
export type JoinWithToken = z.infer<typeof JoinWithTokenSchema>;

// Payload for creating network with org and venue during admin onboarding
export const CreateNetworkOrgPayloadSchema = z.object({
  basics: z.object({
    orgName: z.string().min(1, "Organization name required"),
    hasCorporateAboveYou: z.boolean().default(false),
    segment: z.string().optional(),
  }),
  venue: z
    .object({
      venueName: z.string().min(1, "Venue name required"),
      timeZone: z.string().default("UTC"),
    })
    .optional(),
  formToken: z.string().min(1, "Form token required"),
});

export type CreateNetworkOrgPayload = z.infer<typeof CreateNetworkOrgPayloadSchema>;

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
export type CreateOrgOnboarding = z.infer<typeof CreateOrgOnboardingSchema>;

export const OnboardingIntent = z.enum(["create_org", "create_corporate", "join_existing"]);
export type OnboardingIntent = z.infer<typeof OnboardingIntent>;

export const OnboardingStatus = z.enum(["not_started", "in_progress", "complete"]);
export type OnboardingStatus = z.infer<typeof OnboardingStatus>;

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
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
