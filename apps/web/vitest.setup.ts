// [P0][TEST][TEST] Vitest Setup tests
// Tags: P0, TEST, TEST
import "@testing-library/jest-dom/vitest";
// Polyfill IndexedDB for tests that use idb in a DOM-like environment
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach, afterAll, vi } from "vitest";

import { shutdownRateLimiter } from "./src/lib/api/rate-limit";

// Minimal typing for IDB request-like objects used in the shims below.
type IDBRequestLike = {
  addEventListener?: (type: string, listener: (ev: unknown) => void) => void;
  removeEventListener?: (type: string, listener?: (ev: unknown) => void) => void;
  onsuccess?: (ev?: unknown) => void;
  onerror?: (ev?: unknown) => void;
  result?: unknown;
  [k: string]: unknown;
};

// Some versions of fake-indexeddb do not implement `deleteDatabase` which
// @firebase/util may call during tests. Provide a minimal shim so tests
// that rely on indexedDB teardown don't throw uncaught exceptions.
try {
  // Ensure `self` exists like a browser environment (some libs reference `self`)
  (globalThis as typeof globalThis & { self?: typeof globalThis }).self =
    (globalThis as typeof globalThis & { self?: typeof globalThis }).self ?? globalThis;

  const gw = globalThis as typeof globalThis & { indexedDB?: IDBFactory; setImmediate?: (fn: () => void) => void };
  const idb = gw.indexedDB;
  if (idb && typeof (idb as unknown as { deleteDatabase?: unknown }).deleteDatabase !== "function") {
    const makeDeleteDatabase = () => {
      return function (_name?: string) {
        const listeners: Array<(ev: unknown) => void> = [];
        const req: {
          onsuccess: ((ev?: unknown) => void) | undefined;
          onerror: ((ev?: unknown) => void) | undefined;
          result: unknown;
          addEventListener: (type: string, fn: (ev?: unknown) => void) => void;
          removeEventListener: (_: string, fn?: (ev?: unknown) => void) => void;
          dispatchEvent: (ev: unknown) => boolean;
        } = {
          onsuccess: undefined,
          onerror: undefined,
          result: undefined,
          addEventListener: (type: string, fn: (ev?: unknown) => void) => {
            listeners.push(fn);
          },
          removeEventListener: (_: string, fn?: (ev?: unknown) => void) => {
            if (!fn) return;
            const i = listeners.indexOf(fn);
            if (i !== -1) listeners.splice(i, 1);
          },
          dispatchEvent: (ev: unknown) => {
            for (const l of [...listeners]) {
              try {
                l(ev);
              } catch {
                // swallow listener errors in shim
              }
            }
            return true;
          },
        };
        const schedule = gw.setImmediate ?? ((fn: () => void) => setTimeout(fn, 0));
        schedule(() => {
          try {
            req.result = undefined;
            req.dispatchEvent({ type: "success", target: req });
            req.onsuccess && req.onsuccess({ target: req });
          } catch {
            req.onerror && req.onerror({ target: req });
          }
        });

        return req;
      };
    };

    // Try to define the shim directly on the existing indexedDB object so we
    // don't replace the instance (which could break method binding).
      try {
        Object.defineProperty(idb, "deleteDatabase", {
          value: makeDeleteDatabase(),
          configurable: true,
          writable: true,
        });
      } catch {
        // If defineProperty fails (rare), fall back to assignment.
        try {
          (idb as unknown as { deleteDatabase?: unknown }).deleteDatabase = makeDeleteDatabase();
        } catch {
          /* non-fatal */
        }
      }
  }
} catch {
  // best-effort shim; if this fails it's non-fatal for test setup
}

// Diagnostic probe (logs only during test runs) to help identify if the
// global indexedDB open request exposes `addEventListener` as expected.
try {
  const gwProbe = globalThis as unknown as { indexedDB?: IDBFactory };
  const probeReq = gwProbe.indexedDB?.open?.("__vitest_probe__", 1) as unknown as IDBRequestLike | undefined;
  if (probeReq && typeof probeReq.addEventListener !== "undefined") {
     
    console.debug(
      "vitest.setup: probe indexedDB.open addEventListener=",
      typeof (probeReq as any).addEventListener,
    );
  }
} catch {
  /* ignore */
}

// Ensure that indexedDB.open and indexedDB.deleteDatabase return request-like
// objects with `addEventListener`/`removeEventListener` methods. Some test
// environments or versions of fake-indexeddb may return objects missing these
// helpers; wrap the original functions to guarantee shape.
try {
  const gw = globalThis as unknown as { indexedDB?: IDBFactory; setImmediate?: (fn: () => void) => void };
  const idbFactory = gw.indexedDB;
  if (idbFactory) {
    const realOpen = idbFactory.open?.bind(idbFactory);
    if (realOpen) {
      idbFactory.open = (function (name: string, version?: number) {
        const req = realOpen(name, version) as unknown;
        const reqLike = req as IDBRequestLike;
        if (req && typeof reqLike.addEventListener !== "function") {
          // Provide a minimal EventTarget-like adapter around the request.
          const listeners: Array<(ev: unknown) => void> = [];
          reqLike.addEventListener = (type: string, fn: (ev: unknown) => void) => listeners.push(fn);
          reqLike.removeEventListener = (type: string, fn?: (ev: unknown) => void) => {
            if (!fn) return;
            const i = listeners.indexOf(fn as any);
            if (i !== -1) listeners.splice(i, 1);
          };
          // Route dispatch to both addEventListener listeners and onsuccess/onerror
          const schedule = gw.setImmediate ?? ((fn: () => void) => setTimeout(fn, 0));
          schedule(() => {
            try {
              for (const l of [...listeners]) l({ type: "success", target: req });
              if (typeof reqLike.onsuccess === "function") reqLike.onsuccess({ target: req });
            } catch {
              if (typeof reqLike.onerror === "function") reqLike.onerror({ target: req });
            }
          });
        }
        return req as unknown as IDBRequestLike;
      } as unknown) as typeof idbFactory.open;
    }

    const realDelete = idbFactory.deleteDatabase?.bind(idbFactory);
    if (realDelete) {
      idbFactory.deleteDatabase = (function (name: string) {
        const req = realDelete(name) as unknown;
        const reqLike = req as IDBRequestLike;
        if (req && typeof reqLike.addEventListener !== "function") {
          const listeners: Array<(ev: unknown) => void> = [];
          reqLike.addEventListener = (type: string, fn: (ev: unknown) => void) => listeners.push(fn);
          reqLike.removeEventListener = (type: string, fn?: (ev: unknown) => void) => {
            if (!fn) return;
            const i = listeners.indexOf(fn as (ev: unknown) => void);
            if (i !== -1) listeners.splice(i, 1);
          };
          const schedule = gw.setImmediate ?? ((fn: () => void) => setTimeout(fn, 0));
          schedule(() => {
            for (const l of [...listeners]) l({ type: "success", target: req });
            if (typeof reqLike.onsuccess === "function") reqLike.onsuccess({ target: req });
          });
        }
        return req as unknown as IDBRequestLike;
      } as unknown) as typeof idbFactory.deleteDatabase;
    }
  }
} catch {
  /* non-fatal */
}

// Make vi globally available
declare global {
  const vi: (typeof import("vitest"))["vi"];
}

// Set Firebase environment variables for tests without replacing `process`
Object.assign(process.env, {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test-project.appspot.com",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abcdef123456",
  NODE_ENV: "test",
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

// Prevent the real firebase-admin and its subpackages from loading during tests.
// Some server code imports `firebase-admin/app`, `firebase-admin/auth`, and `firebase-admin/firestore`.
vi.mock("firebase-admin/app", () => ({
  initializeApp: () => ({}),
  cert: (v: unknown) => v,
}));
vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({}),
}));
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({ collection: () => ({ doc: () => ({}) }) }),
}));

// Ensure our instrumentation entrypoint is a no-op in tests.
vi.mock("./instrumentation", () => ({ register: () => {} }));
vi.mock("@/instrumentation", () => ({ register: () => {} }));

// Ensure our local firebase-admin wrapper is mocked in tests. Many server
// modules import `@/lib/firebase-admin` which would otherwise attempt to
// initialize the real admin SDK. Provide simple stubs for the common helpers.
vi.mock("@/lib/firebase-admin", () => ({
  getFirebaseAdminApp: () => ({ name: "vitest-admin-app" }),
  getFirebaseAdminAuth: () => ({}),
  getFirebaseAdminDb: () => ({ collection: () => ({ doc: () => ({}) }) }),
}));

// Provide an in-memory KV mock for tests so we avoid interacting with fake
// IndexedDB/openDB in unit tests that don't need persistence.
vi.mock("@/src/lib/storage/kv", () => {
  const store = new Map();
  return {
    kvSet: async (key: string, value: unknown) => {
      store.set(key, value);
    },
    kvGet: async (key: string) => {
      return store.has(key) ? store.get(key) : null;
    },
    kvDelete: async (key: string) => {
      store.delete(key);
    },
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Ensure any runtime singletons (timers, intervals) are cleaned up after tests
afterAll(() => {
  try {
    shutdownRateLimiter();
  } catch {
    // best-effort
  }
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
