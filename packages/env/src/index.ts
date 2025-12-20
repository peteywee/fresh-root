// [P0][APP][ENV] Index
// Tags: P0, APP, ENV
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

import { EnvSchema, type Env } from "./schema";

export { EnvSchema, type Env };

/**
 * Parse and freeze process.env once at startup.
 * Import this from applications instead of touching process.env directly.
 */
export const env = EnvSchema.parse(process.env);

/**
 * Helper type for consumers.
 */
// Re-export production validation utilities
export {
  assertNotProduction,
  assertProduction,
  getMultiInstanceInfo,
  isMultiInstanceEnabled,
  isProduction,
  preFlightChecks,
  validateDevelopmentEnv,
  validateEnvironmentAtStartup,
  validateProductionEnv,
  type ProdEnv,
} from "./production";
