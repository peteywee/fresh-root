// [P0][SECURITY][FIREBASE] Firebase Admin SDK singleton for Next.js server-side operations
// Tags: P0, SECURITY, FIREBASE, ADMIN_SDK, NEXTJS
// NOTE: this module avoids requiring the `firebase-admin` packages at top-level
// so importing it in test environments or edge contexts does not pull heavy
// native deps. The real SDK is loaded lazily when needed.

// Detect test environment so we can avoid initializing the real admin SDK
const __IS_TEST_ENV = process.env.NODE_ENV === "test" || !!process.env.VITEST || process.env.NEXT_TELEMETRY_DISABLED === "1";

// Detect browser/runtime that should never load server-only admin SDK.
const __IS_BROWSER = typeof window !== "undefined" && typeof process === "undefined";

// Singleton Firebase Admin SDK initialization (lazy-loaded)
let _app: any | null = null;
let _auth: any | null = null;
let _db: any | null = null;

function getFirebaseProjectId(): string {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID must be set");
  }
  return projectId;
}

function getServiceAccount(): Record<string, unknown> {
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON must be set");
  }
  try {
    return JSON.parse(credsJson) as Record<string, unknown>;
  } catch (e) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON");
  }
}

export function getFirebaseAdminApp(): any {
  if (__IS_BROWSER && !__IS_TEST_ENV) {
    throw new Error("getFirebaseAdminApp: server-only module was imported in a browser context");
  }

  if (__IS_TEST_ENV) {
    // Return a lightweight test sentinel instead of initializing the real SDK.
    return { name: "vitest-admin-app" } as any;
  }

  if (!_app) {
    // Require the admin SDK lazily to avoid heavy top-level initialization.
    // Use require() to preserve Node resolution semantics in both CJS/ESM.
     
    const adminApp = require("firebase-admin/app");
    const { cert, initializeApp } = adminApp;

    const projectId = getFirebaseProjectId();
    const serviceAccount = getServiceAccount();

    _app = initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }
  return _app;
}

export function getFirebaseAdminAuth(): any {
  if (__IS_BROWSER && !__IS_TEST_ENV) {
    throw new Error("getFirebaseAdminAuth: server-only module was imported in a browser context");
  }

  if (__IS_TEST_ENV) return {} as any;

  if (!_auth) {
    const app = getFirebaseAdminApp();
     
    const adminAuth = require("firebase-admin/auth");
    const { getAuth } = adminAuth;
    _auth = getAuth(app);
  }
  return _auth;
}

export function getFirebaseAdminDb(): any {
  if (__IS_BROWSER && !__IS_TEST_ENV) {
    throw new Error("getFirebaseAdminDb: server-only module was imported in a browser context");
  }

  if (__IS_TEST_ENV) {
    // Minimal in-memory stub for test runs. Tests that need advanced Firestore
    // semantics should provide their own mocks.
    const dbMock = {
      collection: (_name: string) => ({
        doc: (_id?: string) => ({
          async set(_data: unknown) {
            return { writeTime: new Date() };
          },
          async get() {
            return { exists: false, data: () => undefined };
          },
          async update() {
            return {};
          },
          async delete() {
            return {};
          },
        }),
        where: () => ({ async get() { return { docs: [] }; } }),
      }),
    };
    return dbMock;
  }

  if (!_db) {
    const app = getFirebaseAdminApp();
     
    const adminFs = require("firebase-admin/firestore");
    const { getFirestore } = adminFs;
    _db = getFirestore(app);
  }
  return _db;
}
