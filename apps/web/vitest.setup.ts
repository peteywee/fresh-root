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
// Set environment variables directly instead of replacing the `process` global
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "test-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "test.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "test-project";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "test-project.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456";
process.env.NODE_ENV = process.env.NODE_ENV || "test";

// Start Next.js dev server in tests by default so integration tests can run
// locally without requiring explicit START_NEXT_IN_TESTS=true. CI still
// controls it via environment variables in workflows.
process.env.START_NEXT_IN_TESTS = process.env.START_NEXT_IN_TESTS || "true";

// Some browser Request objects in the Happy DOM polyfill may not implement
// addEventListener which some libraries (e.g. idb) expect. Ensure it exists
// so tests that rely on IndexedDB don't throw a TypeError.
try {
  const RequestProto = (globalThis as any).Request?.prototype;
  if (RequestProto && typeof RequestProto.addEventListener !== "function") {
    RequestProto.addEventListener = function () {
      // No-op fallback to satisfy libraries that call addEventListener on Request
    };
  }
} catch {}

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
