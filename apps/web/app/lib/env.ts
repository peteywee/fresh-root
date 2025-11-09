// [P0][CLIENT][ENV] Client-side environment validation with fail-fast
// Tags: P0, CLIENT, ENV, VALIDATION, NEXTJS
// Comprehensive Zod-based environment validation for all client-side variables.
// This module must be imported only on the client side (components, client actions).

import { z } from "zod";

/**
 * Client-side environment schema with comprehensive validation.
 * Enforces required variables and provides sensible defaults where appropriate.
 */
const ClientEnvSchema = z.object({
  // === Firebase Client SDK ===
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),

  // === Development & Testing ===
  NEXT_PUBLIC_USE_EMULATORS: z.enum(["true", "false"]).optional().default("false"),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

/**
 * Cached, validated client environment.
 * Initialized lazily on first access.
 */
let cachedEnv: ClientEnv | null = null;

/**
 * Loads and validates the client-side environment variables.
 * This function fails fast if any required variables are missing or invalid.
 *
 * @throws {Error} If environment validation fails.
 * @returns {ClientEnv} The validated and typed client environment object.
 */
export function loadClientEnv(): ClientEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = ClientEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`[env.client] Environment validation failed:\n${errors}`);
    throw new Error("Invalid client environment configuration");
  }

  const env = parsed.data;

  cachedEnv = env;
  return env;
}

/**
 * A helper function to check if Firebase emulators should be used.
 *
 * @param {ClientEnv} env - The client environment object.
 * @returns {boolean} `true` if emulators are enabled, otherwise `false`.
 */
export function useEmulators(env: ClientEnv): boolean {
  return env.NEXT_PUBLIC_USE_EMULATORS === "true";
}

// Validate environment immediately in non-production environments
// This ensures early detection of config issues during development
if (process.env.NODE_ENV !== "production") {
  try {
    loadClientEnv();
    // Environment validated successfully
  } catch (error) {
    console.error("[env.client] Failed to validate client environment:", error);
    // Allow development to continue with warnings
  }
}

/**
 * Exported validated environment object.
 * Use this for accessing environment variables throughout the client-side code.
 */
export const ENV = loadClientEnv();
