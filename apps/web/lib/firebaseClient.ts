// [P2][FIREBASE][FIREBASE] FirebaseClient
// Tags: P2, FIREBASE, FIREBASE
// Re-export the client-side firebase SDK helpers from the app-level helper so
// other imports (e.g., `../../lib/firebaseClient`) can remain stable.
export { firebaseApp as app, auth, db, storage, analytics } from "../app/lib/firebaseClient";
