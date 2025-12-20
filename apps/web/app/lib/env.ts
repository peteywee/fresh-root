// [P0][CLIENT][ENV] Client-side environment validation with build-tolerant fallback
// Tags: P0, CLIENT, ENV, VALIDATION, NEXTJS
import { z } from "zod";

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),
  NEXT_PUBLIC_USE_EMULATORS: z.enum(["true", "false"]).optional().default("false"),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

let cachedEnv: ClientEnv | null = null;

function isNextProductionBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function explainIssues(issues: { path: readonly PropertyKey[]; message: string }[]) {
  return issues
    .map((issue) => {
      const path = issue.path
        .map((p) => (typeof p === "symbol" ? p.toString() : String(p)))
        .join(".");
      return `  - ${path}: ${issue.message}`;
    })
    .join("\n");
}

export function loadClientEnv(options?: { allowDuringBuild?: boolean }): ClientEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = ClientEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = explainIssues(parsed.error.issues);

    const allowDuringBuild = options?.allowDuringBuild ?? isNextProductionBuildPhase();

    if (allowDuringBuild) {
      console.warn(
        `[env.client] Skipping strict client env validation during Next build phase.\n${errors}`,
      );

      const env: ClientEnv = {
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
        NEXT_PUBLIC_USE_EMULATORS:
          (process.env.NEXT_PUBLIC_USE_EMULATORS as "true" | "false" | undefined) ?? "false",
      };

      cachedEnv = env;
      return env;
    }

    console.error(`[env.client] Environment validation failed:\n${errors}`);
    throw new Error("Invalid client environment configuration");
  }

  cachedEnv = parsed.data;
  return parsed.data;
}

export function useEmulators(env: ClientEnv): boolean {
  return env.NEXT_PUBLIC_USE_EMULATORS === "true";
}

export function getClientEnv(): ClientEnv {
  return loadClientEnv({ allowDuringBuild: isNextProductionBuildPhase() });
}
