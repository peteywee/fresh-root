import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

export function initFirebase(projectId: string) {
  if (getApps().length === 0) {
    // Admin SDK will auto-pick GOOGLE_APPLICATION_CREDENTIALS if provided.
    admin.initializeApp({ projectId });
  }
  return {
    admin,
    db: admin.firestore()
  };
}
