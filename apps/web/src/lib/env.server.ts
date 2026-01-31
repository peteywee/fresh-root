// [P0][SECURITY][ENV] Server-side environment validation with fail-fast
// Tags: P0, SECURITY, ENV, VALIDATION, SERVER, NEXTJS
// Comprehensive Zod-based environment validation for all server-side variables.
// This module must be imported only on the server side (API routes, server actions, instrumentation).

import { z } from "zod";

/**
 * Server-side environment schema with comprehensive validation.
 * Enforces required variables and provides sensible defaults where appropriate.
 */
const ServerEnvSchema = z.object({
  // === Core Runtime ===
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("3000"),

  // === Firebase Admin SDK ===
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required for admin SDK"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS_JSON: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "GOOGLE_APPLICATION_CREDENTIALS_JSON must be valid JSON" },
    ),

  // === Session & Security ===
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters for security"),
  SESSION_COOKIE_MAX_AGE: z
    .string()
    .optional()
    .default("604800000") // 7 days in milliseconds
    .transform((val) => parseInt(val, 10)),

  // === Backup & Cron ===
  BACKUP_CRON_TOKEN: z.string().optional(),
  FIRESTORE_BACKUP_BUCKET: z.string().optional(),

  // === Cache & Storage ===
  REDIS_URL: z.string().url().optional(),
  
  // === Upstash Redis (Rate Limiting) ===
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  USE_REDIS_RATE_LIMIT: z.enum(["true", "false"]).optional().default("false"),

  // === CORS & Rate Limiting ===
  CORS_ORIGINS: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .default("60000") // 1 minute
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z
    .string()
    .optional()
    .default("100")
    .transform((val) => parseInt(val, 10)),

  // === Observability ===
  OBSERVABILITY_TRACES_ENABLED: z.enum(["true", "false"]).optional().default("false"),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_EXPORTER_OTLP_HEADERS: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().optional().default("fresh-schedules-web"),

  // === Development & Testing ===
  NEXT_PUBLIC_USE_EMULATORS: z.enum(["true", "false"]).optional().default("false"),
  BYPASS_ONBOARDING_GUARD: z.enum(["true", "false"]).optional().default("false"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

/**
 * Cached, validated server environment.
 * Initialized lazily on first access.
 */
let cachedEnv: ServerEnv | null = null;

/**
 * Load and validate server-side environment variables.
 * Fails fast with clear error messages if required variables are missing or invalid.
 *
 * @throws {Error} If environment validation fails
 * @returns Validated and typed environment object
 */
export function loadServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = ServerEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`[env.server] Environment validation failed:\n${errors}`);
    throw new Error(`Invalid server environment configuration:\n${errors}`);
  }

  let env = parsed.data;

  // Backward-compatible support for legacy var name.
  // Prefer OTEL_EXPORTER_OTLP_ENDPOINT (standard / used elsewhere in repo),
  // but accept OTEL_EXPORTER_OTLP_TRACES_ENDPOINT if present.
  const legacyTracesEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT && legacyTracesEndpoint) {
    const legacyParsed = z.string().url().safeParse(legacyTracesEndpoint);
    if (legacyParsed.success) {
      env = { ...env, OTEL_EXPORTER_OTLP_ENDPOINT: legacyTracesEndpoint };
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = legacyTracesEndpoint;
      console.warn(
        "[env.server] OTEL_EXPORTER_OTLP_TRACES_ENDPOINT is deprecated; use OTEL_EXPORTER_OTLP_ENDPOINT instead",
      );
    } else {
      console.error("[env.server] OTEL_EXPORTER_OTLP_TRACES_ENDPOINT must be a valid URL when set");
      throw new Error("Invalid OTEL_EXPORTER_OTLP_TRACES_ENDPOINT");
    }
  }

  // === Additional runtime validations ===

  // Require credentials in production
  if (env.NODE_ENV === "production") {
    if (!env.GOOGLE_APPLICATION_CREDENTIALS && !env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.error(
        "[env.server] Production requires GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_APPLICATION_CREDENTIALS_JSON",
      );
      throw new Error("Missing Firebase admin credentials in production");
    }

    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
      console.error("[env.server] Production requires SESSION_SECRET with at least 32 characters");
      throw new Error("Invalid SESSION_SECRET in production");
    }

    if (!env.CORS_ORIGINS || env.CORS_ORIGINS.trim().length === 0) {
      console.error("[env.server] Production requires CORS_ORIGINS to be configured");
      throw new Error("Missing CORS_ORIGINS in production");
    }
    
    // Validate Redis configuration for multi-instance deployments
    if (env.USE_REDIS_RATE_LIMIT === "true") {
      if (!env.UPSTASH_REDIS_REST_URL && !env.REDIS_URL) {
        console.error(
          "[env.server] Production with USE_REDIS_RATE_LIMIT=true requires either UPSTASH_REDIS_REST_URL or REDIS_URL",
        );
        throw new Error("Missing Redis configuration for rate limiting in production");
      }
      
      if (env.UPSTASH_REDIS_REST_URL && !env.UPSTASH_REDIS_REST_TOKEN) {
        console.error("[env.server] UPSTASH_REDIS_REST_URL requires UPSTASH_REDIS_REST_TOKEN");
        throw new Error("Missing UPSTASH_REDIS_REST_TOKEN in production");
      }
    } else if (env.UPSTASH_REDIS_REST_URL || env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn(
        "[env.server] Upstash Redis credentials provided but USE_REDIS_RATE_LIMIT is not enabled. Set USE_REDIS_RATE_LIMIT=true to use Redis rate limiting.",
      );
    }
  }

  // Warn if backup token is missing in production
  if (env.NODE_ENV === "production" && !env.BACKUP_CRON_TOKEN) {
    console.warn("[env.server] BACKUP_CRON_TOKEN not set - backup endpoint will be unsecured");
  }

  cachedEnv = env;
  return env;
}

/**
 * Helper to parse comma-separated CORS origins into a trimmed array.
 *
 * @param env Server environment object
 * @returns Array of CORS origin strings
 */
export function getCorsOrigins(env: ServerEnv): string[] {
  const val = env.CORS_ORIGINS;
  if (!val) return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Helper to check if Firebase emulators should be used.
 *
 * @param env Server environment object
 * @returns true if emulators are enabled
 */
export function useEmulators(env: ServerEnv): boolean {
  return env.NEXT_PUBLIC_USE_EMULATORS === "true";
}

/**
 * Helper to get parsed Firebase credentials from JSON string.
 *
 * @param env Server environment object
 * @returns Parsed credentials object or null
 */
export function getFirebaseCredentials(env: ServerEnv): Record<string, unknown> | null {
  const json = env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Validate environment immediately in non-production environments
// This ensures early detection of config issues during development
if (process.env.NODE_ENV !== "production") {
  try {
    loadServerEnv();
    // Environment validated successfully
  } catch (error) {
    console.error("[env.server] Failed to validate server environment:", error);
    // Allow development to continue with warnings
  }
}
