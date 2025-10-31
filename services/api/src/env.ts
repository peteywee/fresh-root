import { z } from "zod";

// [P0][SECURITY][ENV] Centralized env validation (fail-fast)
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

export type Env = z.infer<typeof EnvSchema>;

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

// Helper to parse comma-separated CORS origins into a trimmed array
export function getCorsOrigins(env: Env): string[] {
  const val = env.CORS_ORIGINS;
  if (!val) return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
