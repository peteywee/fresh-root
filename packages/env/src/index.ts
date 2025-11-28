// [P0][APP][ENV] Index
// Tags: P0, APP, ENV
import { z } from "zod";

const bool = z.enum(["true", "false"]).transform((v) => v === "true");

const SharedSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1),

  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_APP_ENV: z.string().optional(),

  FIREBASE_EMULATORS: z.string().optional().default("false").pipe(bool),
  FIREBASE_EMULATOR_HOST: z.string().optional().default("127.0.0.1"),
  FIREBASE_AUTH_EMULATOR_PORT: z.string().optional().default("9099"),
  FIRESTORE_EMULATOR_PORT: z.string().optional().default("8080"),
  FIREBASE_STORAGE_EMULATOR_PORT: z.string().optional().default("9199"),
});

const AdminEitherSchema = z.union([
  z.object({
    GOOGLE_APPLICATION_CREDENTIALS_B64: z.string().min(10),
  }),
  z.object({
    FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
    FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
    FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(40),
  }),
]);

const EnvSchema = SharedSchema.and(AdminEitherSchema);

const parsed = EnvSchema.safeParse(process.env as Record<string, string | undefined>);
if (!parsed.success) {
  const formatted = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(
    `❌ Environment validation failed.\nPlease check your .env settings:\n${formatted}`,
  );
}

type Shared = z.infer<typeof SharedSchema>;
type AdminEither = z.infer<typeof AdminEitherSchema>;
type Env = Shared & AdminEither;

const env = parsed.data as Env;

export function getAdminCredentials(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  if ("GOOGLE_APPLICATION_CREDENTIALS_B64" in env) {
    const json = Buffer.from(env.GOOGLE_APPLICATION_CREDENTIALS_B64, "base64").toString("utf8");
    const parsedJson = JSON.parse(json);
    return {
      projectId: parsedJson.project_id,
      clientEmail: parsedJson.client_email,
      privateKey: parsedJson.private_key,
    };
  }
  const pk = (env as Record<string, string>).FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");
  return {
    projectId: (env as Record<string, string>).FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: (env as Record<string, string>).FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: pk,
  };
}

export const ENV = {
  FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: env.FIREBASE_STORAGE_BUCKET,

  NEXT_PUBLIC_FIREBASE_API_KEY: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,

  NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME ?? "App",
  NEXT_PUBLIC_APP_ENV: env.NEXT_PUBLIC_APP_ENV ?? "local",

  FIREBASE_EMULATORS: env.FIREBASE_EMULATORS,
  FIREBASE_EMULATOR_HOST: env.FIREBASE_EMULATOR_HOST,
  FIREBASE_AUTH_EMULATOR_PORT: env.FIREBASE_AUTH_EMULATOR_PORT,
  FIRESTORE_EMULATOR_PORT: env.FIRESTORE_EMULATOR_PORT,
  FIREBASE_STORAGE_EMULATOR_PORT: env.FIREBASE_STORAGE_EMULATOR_PORT,
} as const;
