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

  if (!credsJson && !credsB64) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64 must be set");
  }

  if (credsB64) {
    try {
      const decoded = Buffer.from(credsB64, "base64").toString("utf8");
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch (e) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64 is not valid base64 or JSON");
    }
  }

  if (!credsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON must be set");
  }

  try {
    return JSON.parse(credsJson) as Record<string, unknown>;
  } catch (e) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON");
  }
}

export function getFirebaseAdminApp(): App {
  if (!app) {
    const projectId = getFirebaseProjectId();
    const serviceAccount = getServiceAccount();

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
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
