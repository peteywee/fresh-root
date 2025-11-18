declare module "@/lib/firebase-admin" {
  // Minimal ambient declarations to help editors and typecheckers
  // Real implementations live at `apps/web/lib/firebase-admin.ts`.

  /** Returns the initialized Firebase Admin App (or a test sentinel in tests) */
  export function getFirebaseAdminApp(): any;

  /** Returns the Firebase Admin Auth client */
  export function getFirebaseAdminAuth(): any;

  /** Returns the Firestore instance or a lightweight test stub */
  export function getFirebaseAdminDb(): any;

  export {};
}
