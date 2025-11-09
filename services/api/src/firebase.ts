// [P0][SECURITY][FIREBASE] Firebase Admin SDK singleton initialization
// Tags: P0, SECURITY, FIREBASE, ADMIN_SDK
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

/**
 * @description Initializes the Firebase Admin SDK, ensuring that it is only initialized once.
 * This function handles credentials from either a JSON string or the default application credentials.
 * @param {string} projectId - The Firebase project ID.
 * @param {string} [googleCredsJson] - An optional JSON string containing the Google service account credentials.
 * @returns {{admin: typeof admin, db: admin.firestore.Firestore}} An object containing the initialized Firebase admin instance and the Firestore database instance.
 */
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

/**
 * @description A convenience function to get the Firebase Admin Authentication service instance.
 * @returns {admin.auth.Auth} The Firebase Admin Authentication service instance.
 */
export function getAdminAuth() {
  return admin.auth();
}
