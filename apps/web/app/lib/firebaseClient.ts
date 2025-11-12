// [P0][FIREBASE][FIREBASE] FirebaseClient
// Tags: P0, FIREBASE, FIREBASE
/**
 * @fileoverview
 * Client-side Firebase initialization and configuration.
 * Validates environment variables and provides singleton Firebase app instance.
 */
import { getApp, getApps, initializeApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { z } from "zod";

// Validate expected NEXT_PUBLIC_ env vars used to initialize Firebase.
const EnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

const rawEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cfg = undefined as undefined | FirebaseOptions;

try {
  const parsed = EnvSchema.parse(rawEnv);
  cfg = {
    apiKey: parsed.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: parsed.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: parsed.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: parsed.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: parsed.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: parsed.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    appId: parsed.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
} catch (err) {
  // In dev this will surface useful messages but won't crash the server build.
  // Consumers should still ensure they set the NEXT_PUBLIC_FIREBASE_* vars.

  console.warn("Firebase env validation failed:", err);
}

// Initialize exactly once on the client. Only attempt initialize if cfg is valid.
export const firebaseApp = ((): ReturnType<typeof getApp> | undefined => {
  if (typeof window === "undefined") return undefined;

  // In development, if validation failed, provide a harmless fallback config so the
  // client can initialize Firebase for local dev UI/testing without requiring secrets.
  if (!cfg && process.env.NODE_ENV === "development") {
    console.warn("Firebase env vars not set; using development fallback config for local testing");
    cfg = {
      apiKey: "fake-api-key",
      authDomain: "localhost",
      projectId: "local-demo",
      storageBucket: undefined,
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:000000000000",
      measurementId: undefined,
    };
  }

  if (!cfg) return undefined;
  return getApps().length ? getApp() : initializeApp(cfg);
})();

// Export auth and db instances
export const auth = firebaseApp ? getAuth(firebaseApp) : undefined;
export const db = firebaseApp ? getFirestore(firebaseApp) : undefined;
export const storage = firebaseApp ? getStorage(firebaseApp) : undefined;

// Conditionally initialize analytics when available and measurementId present
export const analytics = ((): ReturnType<typeof getAnalytics> | undefined => {
  try {
    if (typeof window === "undefined") return undefined;
    if (!firebaseApp) return undefined;
    // Only init analytics if measurementId is present on the config
    // @ts-ignore - access config via getApp().options
    const measurementId = (firebaseApp as any).options?.measurementId;
    if (!measurementId) return undefined;
    return getAnalytics(firebaseApp);
  } catch (err) {
    console.warn("Firebase analytics init failed:", err);
    return undefined;
  }
})();
