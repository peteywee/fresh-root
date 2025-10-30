import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("4000"),
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID required"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(), // optional if auth via env vars
  NODE_ENV: z.enum(["development","test","production"]).default("development")
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const msgs = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
    // Fail fast with clear message
    console.error(`[env] invalid configuration: ${msgs}`);
    process.exit(1);
  }
  return parsed.data;
}
