// [P0][TEST][TEST] Vitest Setup tests
// Tags: P0, TEST, TEST
import "@testing-library/jest-dom/vitest";
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
