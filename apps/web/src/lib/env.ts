// [P0][SECURITY][ENV] Client-side environment validation for Next.js web app
// Tags: P0, SECURITY, ENV, VALIDATION, NEXTJS, CLIENT
// Note: Only NEXT_PUBLIC_ variables are exposed to the client bundle.

import { z } from "zod";

/**
 * Client-side environment schema.
 * Only NEXT_PUBLIC_ prefixed variables are available in the browser.
 */
const ClientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_USE_EMULATORS: z.enum(["true", "false"]).optional().default("false"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional().default(""),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

/**
 * Validated client-side environment variables.
 * This object contains all the client-side environment variables,
 * validated against the `ClientEnvSchema`.
 * It will throw an error if any required variables are missing or invalid.
 */
export const webEnv: ClientEnv = ClientEnvSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_USE_EMULATORS: process.env.NEXT_PUBLIC_USE_EMULATORS,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

/**
 * A helper function to determine if the application should use Firebase emulators.
 *
 * @returns {boolean} `true` if emulators should be used, otherwise `false`.
 */
export function useEmulators(): boolean {
  return webEnv.NEXT_PUBLIC_USE_EMULATORS === "true";
}
