// [P1][CONFIG][CODE] Feature flags with Zod validation
// Tags: P1, CONFIG, CODE, FEATURE_FLAGS, VALIDATION

import { z } from "zod";

const FeatureFlagsSchema = z.object({
  REAL_AUTH: z.boolean(),
  FIRESTORE_WRITES: z.boolean(),
  NEW_NAVIGATION: z.boolean(),
  PUBLISH_ENABLED: z.boolean(),
});

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

function parseEnvBoolean(value: string | undefined): boolean {
  return value === "true";
}

export const FLAGS: FeatureFlags = FeatureFlagsSchema.parse({
  REAL_AUTH: parseEnvBoolean(process.env.NEXT_PUBLIC_FEATURE_REAL_AUTH),
  FIRESTORE_WRITES: parseEnvBoolean(process.env.NEXT_PUBLIC_FEATURE_FIRESTORE_WRITES),
  NEW_NAVIGATION: parseEnvBoolean(process.env.NEXT_PUBLIC_FEATURE_NEW_NAVIGATION),
  PUBLISH_ENABLED: parseEnvBoolean(process.env.NEXT_PUBLIC_FEATURE_PUBLISH_ENABLED),
});
