// [P2][APP][CODE] Onboarding
// Tags: P2, APP, CODE
import { z } from "zod";

/**
 * Schema for creating a new corporate onboarding request.
 * @property {string} corporateName - The legal name of the corporation.
 * @property {string} [brandName] - The brand name, if different from the legal name.
 * @property {string} [formToken] - A token associated with the form submission for verification.
 */
export const CreateCorporateOnboardingSchema = z.object({
  corporateName: z.string().min(1),
  brandName: z.string().optional(),
  formToken: z.string().optional(),
});

/**
 * Schema for joining an organization using a token.
 * @property {string} joinToken - The token used to join the organization.
 */
export const JoinWithTokenSchema = z.object({
  joinToken: z.string().min(1),
});

export type CreateCorporateOnboarding = z.infer<typeof CreateCorporateOnboardingSchema>;
export type JoinWithToken = z.infer<typeof JoinWithTokenSchema>;
