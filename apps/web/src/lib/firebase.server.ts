// [P0][FIREBASE][FIREBASE] Firebase Server
// Tags: P0, FIREBASE, FIREBASE
/**
 * Minimal server-side Firebase Admin stub for tests and local development.
 *
 * In production you can replace this with a real Firebase Admin initialisation
 * that uses service account credentials. For now, we keep everything optional
 * so tests can freely mock this module without pulling in the full admin SDK.
 */

import type { Firestore } from "firebase-admin/firestore";
import type { App } from "firebase-admin/app";

// These are intentionally `undefined` by default so that:
// - Unit/integration tests can vi.mock this module and supply fakes.
// - Local dev won't accidentally try to talk to production Firestore.
export const adminDb: Firestore | undefined = undefined;
export const adminSdk: App | undefined = undefined;
