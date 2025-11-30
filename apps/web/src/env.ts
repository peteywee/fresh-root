/**
 * apps/web/src/env.ts
 *
 * App-level environment accessor for the Next.js web app.
 * Uses the shared packages/env schema so all required env vars are validated
 * at startup.
 */

import { env as sharedEnv, type Env as SharedEnv } from "@packages/env";

/**
 * Export env for use throughout the web app.
 *
 * Example:
 *   import { env } from "@/src/env";
 *   console.log(env.NODE_ENV);
 */
export const env = sharedEnv;

export type Env = SharedEnv;
