import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// [P0][SECURITY][FIREBASE] Admin singleton init using env JSON when provided
export function initFirebase(projectId: string, googleCredsJson?: string) {
  if (getApps().length === 0) {
    if (googleCredsJson) {
      try {
        const creds = JSON.parse(googleCredsJson);
        admin.initializeApp({
          credential: admin.credential.cert(creds),
          projectId,
        });
      } catch (e) {
        console.warn(
          "[firebase] Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON, falling back to default credentials",
        );
        admin.initializeApp({ projectId });
      }
    } else {
      // Admin SDK will auto-pick GOOGLE_APPLICATION_CREDENTIALS if provided.
      admin.initializeApp({ projectId });
    }
  }
  return {
    admin,
    db: admin.firestore(),
  };
}

export function getAdminAuth() {
  return admin.auth();
}
