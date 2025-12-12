// [P0][TEST][TEST] Vitest Setup tests
// Tags: P0, TEST, TEST
import "@testing-library/jest-dom/vitest";
// Polyfill IndexedDB for tests that use idb in a DOM-like environment
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Make vi globally available
declare global {
  const vi: (typeof import("vitest"))["vi"];
}

// Mock Firebase environment variables for tests
vi.stubGlobal("process", {
  ...process,
  env: {
    ...process.env,
    NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test-project.appspot.com",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abcdef123456",
    NODE_ENV: "test",
  },
});

// Global mock for server-side firebase wrapper to avoid importing firebase-admin
// in unit tests which can be heavy and may emit environment warnings.
vi.mock("@/src/lib/firebase.server", () => {
  return {
    adminDb: undefined,
    adminSdk: {
      firestore: {
        Timestamp: {
          now: () => ({ toDate: () => new Date(), toMillis: () => Date.now() }),
        },
      },
    },
  };
});

// Mock firebase-admin auth & firestore in the global test setup to simplify
// integrations that use createOrgEndpoint and Firestore membership checks.
vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    verifySessionCookie: async (_cookie: string) => ({
      uid: "test-user-1",
      email: "test@example.com",
      email_verified: true,
      customClaims: {},
    }),
    verifyIdToken: async (_token: string) => ({
      uid: "test-user-1",
      email: "test@example.com",
      email_verified: true,
      customClaims: {},
    }),
  }),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collectionGroup: (_name: string) => ({
      where: function () {
        return this as any;
      },
      limit: function () {
        return this as any;
      },
      get: async function () {
        return {
          empty: false,
          docs: [
            {
              id: "membership-test",
              data: () => ({ uid: "test-user-1", orgId: "org-test", role: "manager" }),
            },
          ],
        };
      },
    }),
  }),
}));

vi.mock("firebase-admin", () => ({
  getAuth: () => ({
    verifySessionCookie: async (_cookie: string) => ({
      uid: "test-user-1",
      email: "test@example.com",
      email_verified: true,
      customClaims: {},
    }),
    verifyIdToken: async (_token: string) => ({
      uid: "test-user-1",
      email: "test@example.com",
      email_verified: true,
      customClaims: {},
    }),
  }),
  getFirestore: () => ({
    collectionGroup: (_name: string) => ({
      where: function () {
        return this as any;
      },
      limit: function () {
        return this as any;
      },
      get: async function () {
        return {
          empty: false,
          docs: [
            {
              id: "membership-test",
              data: () => ({ uid: "test-user-1", orgId: "org-test", role: "manager" }),
            },
          ],
        };
      },
    }),
  }),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
