import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized.
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin.app();

  // Use explicit private key env if provided (avoid committing secrets)
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      projectId
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
    console.warn('Firebase Admin SDK not initialized (missing credentials).');
    return null as unknown as admin.app.App;
  }
}

const app = initAdmin();
export const adminSdk = admin;
export const adminAuth = app ? admin.auth() : undefined;
export const adminDb = app ? admin.firestore() : undefined;
export const adminStorage = app ? admin.storage() : undefined;

export async function verifyIdToken(token?: string) {
  if (!adminAuth) throw new Error('Admin auth not initialized');
  if (!token) throw new Error('No token');
  return adminAuth.verifyIdToken(token);
}

export function isManagerClaims(claims: admin.auth.DecodedIdToken, orgId?: string) {
  if (!claims) return false;
  if (claims.role === 'manager' || (claims as unknown as Record<string, unknown>)['custom:role'] === 'manager') return true;
  // check namespaced roles object
  const roles = (claims as unknown as Record<string, unknown>)['roles'] as Record<string, string> | undefined
    || (claims as unknown as Record<string, unknown>)['rolesMap'] as Record<string, string> | undefined
    || (claims as unknown as Record<string, unknown>)['orgRoles'] as Record<string, string> | undefined;
  if (orgId && roles && typeof roles === 'object') {
    const r = roles[orgId] || roles[String(orgId)];
    if (r && ['org_owner', 'org_admin', 'admin', 'manager'].includes(r)) return true;
  }
  return false;
}
