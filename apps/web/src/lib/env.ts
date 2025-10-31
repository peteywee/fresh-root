// [P0][SECURITY][ENV] Client-side env helper for Next.js (compile-time)
// Note: Only NEXT_PUBLIC_ variables are exposed to the client bundle.

export type WebEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  NEXT_PUBLIC_FIREBASE_APP_ID?: string;
  NEXT_PUBLIC_USE_EMULATORS?: string;
};

function read(name: keyof WebEnv, required = true): string | undefined {
  const v = process.env[name as string];
  if (required && (!v || v.length === 0)) {
    throw new Error(`[web env] missing ${name}`);
  }
  return v;
}

export const webEnv: WebEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: read("NEXT_PUBLIC_FIREBASE_API_KEY")!,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: read("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")!,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: read("NEXT_PUBLIC_FIREBASE_PROJECT_ID")!,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: read("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", false),
  NEXT_PUBLIC_FIREBASE_APP_ID: read("NEXT_PUBLIC_FIREBASE_APP_ID", false),
  NEXT_PUBLIC_USE_EMULATORS: read("NEXT_PUBLIC_USE_EMULATORS", false),
};
