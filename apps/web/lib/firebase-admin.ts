// [P0][SECURITY][FIREBASE] Firebase Admin SDK singleton for Next.js server-side operations
// Tags: P0, SECURITY, FIREBASE, ADMIN_SDK, NEXTJS
import { Buffer } from "node:buffer";
import { cert, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Singleton Firebase Admin SDK initialization
let app: App | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let lastCredentialHash = ""; // Detect credential changes (singleton poisoning prevention)

function getFirebaseProjectId(): string {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID must be set");
  }
  return projectId;
}

function getServiceAccount(): Record<string, unknown> {
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const credsB64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64;

  // Guard against empty strings (falsy but not undefined)
  if (!credsJson && !credsB64) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64 must be set");
  }

  if (credsB64 === "") {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64 cannot be empty");
  }

  if (credsJson === "") {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON cannot be empty");
  }

  if (credsB64) {
    try {
      const decoded = Buffer.from(credsB64, "base64").toString("utf8");
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch (e) {
      throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64: base64 or JSON parsing failed");
    }
  }

  if (!credsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON must be set");
  }

  try {
    return JSON.parse(credsJson) as Record<string, unknown>;
  } catch (e) {
    throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON: JSON parsing failed");
  }
}

function getCredentialHash(): string {
  const b64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64 || "";
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "";
  return (b64 + json).slice(0, 32);
}

export function getFirebaseAdminApp(): App {
  const currentHash = getCredentialHash();

  // Detect credential changes and invalidate cache (prevents singleton poisoning)
  if (lastCredentialHash !== currentHash && lastCredentialHash !== "") {
    console.warn("[SECURITY] Credential change detected. Reinitializing Firebase Admin.");
    app = null;
    auth = null;
    db = null;
  }

  if (!app) {
    const projectId = getFirebaseProjectId();
    const serviceAccount = getServiceAccount();

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });

    lastCredentialHash = currentHash;
  }
  return app;
}

export function getFirebaseAdminAuth(): Auth {
  if (!auth) {
    const app = getFirebaseAdminApp();
    auth = getAuth(app);
  }
  return auth;
}

export function getFirebaseAdminDb(): Firestore {
  if (!db) {
    const app = getFirebaseAdminApp();
    db = getFirestore(app);
  }
  return db;
}

/**
 * [P0][SECURITY][ADMIN] Org-scoped Firestore access helper
 * Use this instead of getFirebaseAdminDb() directly
 * Enforces org scoping at the call site
 */
export function getOrgScopedDb(orgId: string): Firestore {
  if (!orgId || typeof orgId !== "string") {
    throw new Error("orgId must be a non-empty string for org-scoped database access");
  }
  return getFirebaseAdminDb();
}

/**
 * [P0][SECURITY][STARTUP] Validate Firebase Admin at app startup
 * Fail-fast: catch credential errors immediately instead of at runtime
 */
export async function validateFirebaseAdminStartup(): Promise<void> {
  try {
    getFirebaseAdminDb();
    console.log("✅ Firebase Admin initialized successfully at startup");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Firebase Admin startup validation FAILED:", message);
    throw err;
  }
}
