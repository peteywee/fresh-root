// [P0][SECURITY][FIREBASE] Firebase Admin SDK singleton initialization
// Tags: P0, SECURITY, FIREBASE, ADMIN_SDK
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

export function initFirebase(projectId: string, googleCredsJson?: string) {
  if (getApps().length === 0) {
    if (googleCredsJson) {
      try {
        const creds = JSON.parse(googleCredsJson);
        admin.initializeApp({
          credential: admin.credential.cert(creds),
          projectId,
        });
      } catch (_e) {
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
