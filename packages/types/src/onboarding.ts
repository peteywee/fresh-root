// [P2][APP][CODE] Onboarding
// Tags: P2, APP, CODE
import { z } from "zod";

export const CreateCorporateOnboardingSchema = z.object({
  corporateName: z.string().min(1),
  brandName: z.string().optional(),
  formToken: z.string().optional(),
});

export const JoinWithTokenSchema = z.object({
  joinToken: z.string().min(1),
});

export const CreateNetworkOrgSchema = z.object({
  orgName: z.string().min(1, "Organization name is required"),
  venueName: z.string().min(1, "Venue name is required"),
  formToken: z.string().min(1, "Form token is required"),
});

export const CreateNetworkOrgResponseSchema = z.object({
  ok: z.literal(true),
  networkId: z.string(),
  orgId: z.string(),
  venueId: z.string(),
  status: z.string(),
});

export type CreateCorporateOnboarding = z.infer<typeof CreateCorporateOnboardingSchema>;
export type JoinWithToken = z.infer<typeof JoinWithTokenSchema>;
export type CreateNetworkOrg = z.infer<typeof CreateNetworkOrgSchema>;
export type CreateNetworkOrgResponse = z.infer<typeof CreateNetworkOrgResponseSchema>;
