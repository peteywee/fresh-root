// [P0][APP][ENV] Production
// Tags: P0, APP, ENV
/**
 * packages/env/src/production.ts
 *
 * Production-specific environment validation and checks.
 *
 * This module ensures that critical production infrastructure is properly
 * configured BEFORE your app boots. It runs early in app initialization
 * and will throw if production requirements aren't met.
 *
 * Philosophy: Fail fast and loudly. Better to crash at startup than run
 * with broken production configuration that silently fails under load.
 */

import { z } from "zod";

import { EnvSchema, type Env } from "./schema";

/* ============================================================================ */
/* Production Environment Requirements                                         */
/* ============================================================================ */

/**
 * Strictly validate production environment variables.
 *
 * Production requires:
 * - REDIS_URL must be set (multi-instance safe rate limiting, caching, etc.)
 * - NODE_ENV must be explicitly "production"
 * - No optional values; all critical infra must be configured
 */
export const ProdEnvSchema = EnvSchema.extend({
  NODE_ENV: z.literal("production"),
  REDIS_URL: z.string().url().describe("Redis URL required for production"),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
});

export type ProdEnv = z.infer<typeof ProdEnvSchema>;

/* ============================================================================ */
/* Validation Functions                                                        */
/* ============================================================================ */

/**
 * Check if we're in production mode.
 *
 * @param env - Environment object from packages/env
 * @returns true if NODE_ENV is "production"
 */
export function isProduction(env: Env): boolean {
  return env.NODE_ENV === "production";
}

/**
 * Check if multi-instance support is enabled.
 *
 * Multi-instance means:
 * - Multiple processes/containers running your app
 * - Need shared state (rate limiting, caching, sessions)
 * - Requires Redis or similar distributed backend
 *
 * @param env - Environment object
 * @returns true if REDIS_URL is configured
 */
export function isMultiInstanceEnabled(env: Env): boolean {
  return Boolean(env.REDIS_URL);
}

/**
 * Validate production environment strictly.
 *
 * Throws if:
 * - NODE_ENV is "production" but REDIS_URL is not set
 * - Any required production config is missing
 *
 * @param env - Environment object
 * @throws {ZodError} if production validation fails
 * @returns Validated production environment
 */
export function validateProductionEnv(env: Env): ProdEnv {
  if (!isProduction(env)) {
    throw new Error(
      `Expected NODE_ENV="production" but got "${env.NODE_ENV}". ` +
        `Use validateDevelopmentEnv() for non-production environments.`,
    );
  }

  try {
    return ProdEnvSchema.parse(env);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const missing = err.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n  ");

      throw new Error(
        `Production environment validation failed:\n  ${missing}\n\n` +
          `Required for production:\n` +
          `  - REDIS_URL (for multi-instance rate limiting, caching, sessions)\n` +
          `  - NEXT_PUBLIC_FIREBASE_API_KEY\n` +
          `  - FIREBASE_PROJECT_ID\n` +
          `  - NODE_ENV="production"`,
      );
    }
    throw err;
  }
}

/**
 * Validate development environment.
 *
 * Development allows:
 * - NODE_ENV to be "development" or "test"
 * - REDIS_URL to be optional (uses in-memory fallback)
 *
 * @param env - Environment object
 * @throws {Error} if in production mode (use validateProductionEnv instead)
 */
export function validateDevelopmentEnv(env: Env): void {
  if (isProduction(env)) {
    throw new Error(
      `NODE_ENV is "production" but using development validator. ` +
        `Use validateProductionEnv() instead.`,
    );
  }
}

/* ============================================================================ */
/* Startup Checks                                                              */
/* ============================================================================ */

/**
 * Run all startup checks for the current environment.
 *
 * This should be called early in app initialization (e.g., in layout.tsx or
 * instrumentation.ts).
 *
 * Behavior:
 * - Production: validates strict requirements, throws if missing
 * - Development: validates loosely, warns if optional infra missing
 *
 * @param env - Environment object
 * @throws {Error} if critical production config is missing
 */
export function validateEnvironmentAtStartup(env: Env): void {
  if (isProduction(env)) {
    // Strict validation for production
    validateProductionEnv(env);

    console.log(
      "✅ Production environment validated. " +
        "Multi-instance support enabled (Redis configured).",
    );
  } else {
    // Loose validation for development
    validateDevelopmentEnv(env);

    if (isMultiInstanceEnabled(env)) {
      console.log(
        "✅ Development environment with Redis configured. " + "Using distributed rate limiting.",
      );
    } else {
      console.log(
        "⚠️ Development environment without Redis. " +
          "Using in-memory rate limiting (single process only).",
      );
    }
  }
}

/* ============================================================================ */
/* Infrastructure Checks                                                       */
/* ============================================================================ */

/**
 * Check if the app is configured for multi-instance deployment.
 *
 * Multi-instance scenarios:
 * - Load-balanced behind nginx/HAProxy
 * - Kubernetes with multiple replicas
 * - Multiple servers/containers
 *
 * If multi-instance but Redis not configured: rate limiting will be broken.
 *
 * @param env - Environment object
 * @returns Object with multi-instance info
 */
export function getMultiInstanceInfo(env: Env): {
  isMultiInstance: boolean;
  riskLevel: "safe" | "warn" | "critical";
  message: string;
} {
  const isMulti = isMultiInstanceEnabled(env);
  const isProd = isProduction(env);

  if (isMulti && isProd) {
    return {
      isMultiInstance: true,
      riskLevel: "safe",
      message: "Multi-instance production deployment with Redis. Rate limiting is distributed.",
    };
  }

  if (isMulti && !isProd) {
    return {
      isMultiInstance: true,
      riskLevel: "warn",
      message: "Redis enabled in development. Using distributed rate limiting (unnecessary).",
    };
  }

  if (!isMulti && isProd) {
    return {
      isMultiInstance: false,
      riskLevel: "critical",
      message:
        "CRITICAL: Production deployment without Redis. " +
        "Rate limiting is per-instance (BROKEN for multi-instance).\n" +
        "Set REDIS_URL for distributed rate limiting.",
    };
  }

  return {
    isMultiInstance: false,
    riskLevel: "safe",
    message: "Single-instance development. In-memory rate limiting is sufficient.",
  };
}

/* ============================================================================ */
/* Pre-Flight Checks (Run These Before Accepting Traffic)                     */
/* ============================================================================ */

/**
 * Comprehensive pre-flight checklist before accepting traffic.
 *
 * Run this in your app initialization (before health checks pass).
 * Fails fast if critical infrastructure is misconfigured.
 *
 * @param env - Environment object
 * @throws {Error} if any critical check fails
 */
export function preFlightChecks(env: Env): void {
  const checks: Array<{
    name: string;
    check: () => boolean;
    message: string;
  }> = [
    {
      name: "Environment validation",
      check: () => {
        validateEnvironmentAtStartup(env);
        return true;
      },
      message: "Environment configuration validated",
    },
    {
      name: "Multi-instance check",
      check: () => {
        const info = getMultiInstanceInfo(env);
        if (info.riskLevel === "critical") {
          throw new Error(info.message);
        }
        return true;
      },
      message: "Multi-instance configuration OK",
    },
    {
      name: "Firebase config",
      check: () => {
        return Boolean(env.NEXT_PUBLIC_FIREBASE_API_KEY && env.FIREBASE_PROJECT_ID);
      },
      message: "Firebase credentials configured",
    },
  ];

  for (const { name, check, message } of checks) {
    try {
      check();
      console.log(`  ✅ ${message}`);
    } catch (err) {
      console.error(`  ❌ ${name} failed`);
      throw err;
    }
  }

  console.log("\n✅ All pre-flight checks passed. Ready to accept traffic.\n");
}

/* ============================================================================ */
/* Explicit Production Guard                                                  */
/* ============================================================================ */

/**
 * Guard that throws if NOT in production.
 *
 * Use this to mark functions that should ONLY run in production:
 *
 * @example
 *   export async function captureAnalytics() {
 *     assertProduction(env);
 *     // Now safe to use production-only APIs
 *   }
 *
 * @param env - Environment object
 * @throws {Error} if not in production
 */
export function assertProduction(env: Env): asserts env is ProdEnv {
  if (!isProduction(env)) {
    throw new Error(
      `Production-only code called in ${env.NODE_ENV} environment. ` +
        `This should only run with NODE_ENV="production".`,
    );
  }

  // Also validate required production fields
  validateProductionEnv(env);
}

/**
 * Guard that throws if in production.
 *
 * Use this to mark functions that should ONLY run in development:
 *
 * @example
 *   export function seedTestData() {
 *     assertNotProduction(env);
 *     // Safe to use test data
 *   }
 *
 * @param env - Environment object
 * @throws {Error} if in production
 */
export function assertNotProduction(env: Env): void {
  if (isProduction(env)) {
    throw new Error(
      `Development-only code called in production environment. ` +
        `This should never run with NODE_ENV="production".`,
    );
  }
}
