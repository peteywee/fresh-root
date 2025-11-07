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

export type CreateCorporateOnboarding = z.infer<typeof CreateCorporateOnboardingSchema>;
export type JoinWithToken = z.infer<typeof JoinWithTokenSchema>;
