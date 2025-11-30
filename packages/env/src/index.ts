/**
 * packages/env/src/index.ts
 *
 * Zod-based environment schema for Fresh Root.
 *
 * This is the central source of truth for environment variables used by
 * applications and services (web, API, workers, etc.).
 *
 * NOTE:
 * - Required vars: app will fail fast if missing.
 * - Optional vars: features that aren't enabled if omitted (e.g., OTEL/Redis).
 */

import { z } from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // --- Firebase core (minimal; extend as needed to match your real config) ---
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  // NOTE: FIREBASE_PROJECT_ID is validated only in production runtime,
  // not at build time. This allows builds to succeed without secrets.
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),

  // --- Redis for distributed rate limiting ---
  // Required ONLY when running multi-instance production. Optional in dev/single.
  REDIS_URL: z.string().url().optional(),

  // --- OpenTelemetry exporter endpoint ---
  // Optional. When set, OTEL tracing will be active.
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional()
});

/**
 * Parse and freeze process.env once at startup.
 * Import this from applications instead of touching process.env directly.
 */
export const env = EnvSchema.parse(process.env);

/**
 * Helper type for consumers.
 */
export type Env = typeof env;

// Re-export production validation utilities
export {
    assertNotProduction, assertProduction, getMultiInstanceInfo, isMultiInstanceEnabled, isProduction, preFlightChecks, validateDevelopmentEnv,
    validateEnvironmentAtStartup, validateProductionEnv, type ProdEnv
} from "./production";
