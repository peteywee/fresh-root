// [P0][FIREBASE][FIREBASE] Firebase Server
// Tags: P0, FIREBASE, FIREBASE
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized.
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin.app();

  // Use explicit private key env if provided (avoid committing secrets)
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
    return admin.app();
  }

  // Fallback to default application credentials (workload identity / gcloud env)
  try {
    admin.initializeApp();
    return admin.app();
  } catch {
    // If admin cannot initialize (e.g., no credentials), export undefined handles.
    // Callers should handle missing admin (e.g., in local dev use client-side flows/emulators).
    console.warn("Firebase Admin SDK not initialized (missing credentials).");
    return null as unknown as AdminAppType | null;
  }
}

// Infer admin types from runtime helpers to avoid referencing an ambient `admin` namespace
type AdminAppType = ReturnType<typeof admin.app>;
type AdminAuthType = ReturnType<typeof admin.auth>;
type AdminFirestoreType = ReturnType<typeof admin.firestore>;
type AdminStorageType = ReturnType<typeof admin.storage>;

const app: AdminAppType | null = initAdmin();
export const adminSdk = admin;
export const adminAuth: AdminAuthType | undefined = app ? admin.auth() : undefined;
export const adminDb: AdminFirestoreType | undefined = app ? admin.firestore() : undefined;
export const adminStorage: AdminStorageType | undefined = app ? admin.storage() : undefined;

type VerifyIdTokenReturn = AdminAuthType extends { verifyIdToken(token: string): Promise<infer R> }
  ? R
  : unknown;

/**
 * Verifies a Firebase ID token.
 *
 * @param {string} [token] - The ID token to verify.
 * @returns {Promise<VerifyIdTokenReturn>} A promise that resolves with the decoded token.
 * @throws {Error} If the admin auth SDK is not initialized or if no token is provided.
 */
export async function verifyIdToken(token?: string): Promise<VerifyIdTokenReturn> {
  if (!adminAuth) throw new Error("Admin auth not initialized");
  if (!token) throw new Error("No token");
  return adminAuth.verifyIdToken(token);
}

/**
 * Checks if the given claims include manager-level permissions for a specific organization.
 *
 * @param {VerifyIdTokenReturn | Record<string, unknown> | undefined} claims - The user's claims.
 * @param {string} [orgId] - The ID of the organization to check for manager permissions.
 * @returns {boolean} `true` if the user has manager-level claims, otherwise `false`.
 */
export function isManagerClaims(
  claims: VerifyIdTokenReturn | Record<string, unknown> | undefined,
  orgId?: string,
): boolean {
  if (!claims) return false;
  const c = claims as unknown as Record<string, unknown>;
  if (typeof c["role"] === "string" && c["role"] === "manager") return true;
  if (typeof c["custom:role"] === "string" && c["custom:role"] === "manager") return true;
  // check namespaced roles object
  const roles =
    ((claims as unknown as Record<string, unknown>)["roles"] as
      | Record<string, string>
      | undefined) ||
    ((claims as unknown as Record<string, unknown>)["rolesMap"] as
      | Record<string, string>
      | undefined) ||
    ((claims as unknown as Record<string, unknown>)["orgRoles"] as
      | Record<string, string>
      | undefined);
  if (orgId && roles && typeof roles === "object") {
    const r = roles[orgId] || roles[String(orgId)];
    if (r && ["org_owner", "org_admin", "admin", "manager"].includes(r)) return true;
  }
  return false;
}
