// [P0][SECURITY][FIREBASE] Firebase Admin SDK singleton for Next.js server-side operations
// Tags: P0, SECURITY, FIREBASE, ADMIN_SDK, NEXTJS
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
// Singleton Firebase Admin SDK initialization
let app = null;
let auth = null;
let db = null;
function getFirebaseProjectId() {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
        throw new Error("FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID must be set");
    }
    return projectId;
}
function getServiceAccount() {
    const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credsJson) {
        throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON must be set");
    }
    try {
        return JSON.parse(credsJson);
    }
    catch (e) {
        throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON");
    }
}
export function getFirebaseAdminApp() {
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
export function getFirebaseAdminAuth() {
    if (!auth) {
        const app = getFirebaseAdminApp();
        auth = getAuth(app);
    }
    return auth;
}
export function getFirebaseAdminDb() {
    if (!db) {
        const app = getFirebaseAdminApp();
        db = getFirestore(app);
    }
    return db;
}
