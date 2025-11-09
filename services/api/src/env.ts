// [P0][SECURITY][ENV] Centralized environment validation with fail-fast
// Tags: P0, SECURITY, ENV, VALIDATION
import { z } from "zod";

/**
 * @description Defines the schema for environment variables using Zod.
 * This ensures that the application has the required configuration to run and provides default values for optional variables.
 */
const EnvSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Firebase / credentials
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID required"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS_JSON: z.string().optional(),

  // Observability / optional integrations
  SENTRY_DSN: z.string().optional(),
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.string().optional(),

  // Edge / CORS / Cache
  CORS_ORIGINS: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Rate limit (optional)
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional(),
});

/**
 * @description Represents the validated and typed environment variables for the application.
 */
export type Env = z.infer<typeof EnvSchema>;

/**
 * @description Loads and validates the environment variables from `process.env`.
 * If the validation fails, it logs a descriptive error message and exits the process.
 * This function also performs additional runtime checks, such as ensuring CORS_ORIGINS is set in production.
 * @returns {Env} The validated and typed environment variables.
 */
export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const msgs = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    // Fail fast with clear message
    console.error(`[env] invalid configuration: ${msgs}`);
    process.exit(1);
  }
  const env = parsed.data;

  // Additional runtime assertions
  // Require CORS_ORIGINS in production
  if (env.NODE_ENV === "production") {
    if (!env.CORS_ORIGINS || env.CORS_ORIGINS.trim().length === 0) {
      console.error("[env] CORS_ORIGINS required in production");
      process.exit(1);
    }
  }

  return env;
}

/**
 * @description A helper function that parses the comma-separated `CORS_ORIGINS` environment variable into an array of strings.
 * @param {Env} env - The application's environment variables.
 * @returns {string[]} An array of allowed CORS origins.
 */
export function getCorsOrigins(env: Env): string[] {
  const val = env.CORS_ORIGINS;
  if (!val) return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
