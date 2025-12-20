// [P0][APP][ENV] Schema
// Tags: P0, APP, ENV
/**
 * packages/env/src/schema.ts
 *
 * Shared Zod schema for environment variables.
 *
 * IMPORTANT: Keep this module free of imports from other local modules to
 * avoid circular dependencies during bundling (e.g., Next.js app-route build).
 */

import { z } from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // --- Firebase core (minimal; extend as needed to match your real config) ---
  // NOTE: This is a client-exposed value. We keep it optional at the shared
  // schema level so server-only build steps (e.g., Next.js "collect page data")
  // can run in CI even when client env vars are not present.
  //
  // Production runtime validation (see ProdEnvSchema) still requires it.
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),

  // NOTE: FIREBASE_PROJECT_ID is validated only in production runtime,
  // not at build time. This allows builds to succeed without secrets.
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),

  // --- Redis for distributed rate limiting ---
  // Required ONLY when running multi-instance production. Optional in dev/single.
  REDIS_URL: z.string().url().optional(),

  // --- OpenTelemetry exporter endpoint ---
  // Optional. When set, OTEL tracing will be active.
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),

  // --- Observability feature toggles ---
  // Defaults align with: logs enabled, traces disabled.
  OBSERVABILITY_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((v) => v === "true"),

  OBSERVABILITY_HEAD_SAMPLING_RATE: z.coerce.number().optional().default(1),

  OBSERVABILITY_LOGS_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .default("true")
    .transform((v) => v === "true"),
  OBSERVABILITY_LOGS_HEAD_SAMPLING_RATE: z.coerce.number().optional().default(1),
  OBSERVABILITY_LOGS_PERSIST: z
    .enum(["true", "false"])
    .optional()
    .default("true")
    .transform((v) => v === "true"),
  OBSERVABILITY_LOGS_INVOCATION_LOGS: z
    .enum(["true", "false"])
    .optional()
    .default("true")
    .transform((v) => v === "true"),

  OBSERVABILITY_TRACES_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((v) => v === "true"),
  OBSERVABILITY_TRACES_HEAD_SAMPLING_RATE: z.coerce.number().optional().default(1),
  OBSERVABILITY_TRACES_PERSIST: z
    .enum(["true", "false"])
    .optional()
    .default("true")
    .transform((v) => v === "true"),
});

export type Env = z.infer<typeof EnvSchema>;
