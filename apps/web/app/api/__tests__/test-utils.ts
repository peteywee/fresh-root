// [P0][TEST][UTIL] Shared API test utilities for Next.js API testing
// Tags: P0, TEST, UTIL
/**
 * Shared test utilities for API route testing
 *
 * This module provides mock builders and helpers for testing API endpoints
 * built with @fresh-schedules/api-framework.
 */

import { NextRequest, NextResponse } from "next/server";
import { vi } from "vitest";

import type { OrgRole } from "@fresh-schedules/types";

// =============================================================================
// TYPES
// =============================================================================

export interface AuthContext {
  userId: string;
  email: string;
  emailVerified: boolean;
  customClaims: Record<string, unknown>;
}

export interface OrgContext {
  orgId: string;
  role: OrgRole;
  membershipId: string;
}

export interface MockRequestOptions {
  body?: unknown;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}

export interface MockFirebaseUser {
  uid: string;
  email: string;
  email_verified: boolean;
  customClaims?: Record<string, unknown>;
}

export interface MockDocumentSnapshot {
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
  id: string;
  ref: { id: string; path: string };
}

export interface MockCollectionReference {
  doc: (docId?: string) => MockDocumentReference;
  where: (...args: unknown[]) => MockCollectionReference;
  orderBy: (...args: unknown[]) => MockCollectionReference;
  limit: (n: number) => MockCollectionReference;
  offset: (n: number) => MockCollectionReference;
  get: () => Promise<MockQuerySnapshot>;
  count: () => { get: () => Promise<{ data: () => { count: number } }> };
}

export interface MockDocumentReference {
  id: string;
  path: string;
  get: () => Promise<MockDocumentSnapshot>;
  set: (data: Record<string, unknown>, options?: unknown) => Promise<void>;
  update: (data: Record<string, unknown>) => Promise<void>;
  delete: () => Promise<void>;
}

export interface MockQuerySnapshot {
  empty: boolean;
  docs: MockDocumentSnapshot[];
  forEach: (callback: (doc: MockDocumentSnapshot) => void) => void;
}

export interface MockFirestore {
  collection: (path: string) => MockCollectionReference;
  collectionGroup: (name: string) => MockCollectionReference;
  doc: (path: string) => MockDocumentReference;
  runTransaction: <T>(fn: (transaction: MockTransaction) => Promise<T>) => Promise<T>;
  batch: () => MockWriteBatch;
  _setMockData: (path: string, data: Record<string, unknown>) => void;
  _getMockData: (path: string) => Record<string, unknown> | undefined;
  _clearMockData: () => void;
}

export interface MockTransaction {
  get: (ref: MockDocumentReference) => Promise<MockDocumentSnapshot>;
  set: (ref: MockDocumentReference, data: Record<string, unknown>) => void;
  update: (ref: MockDocumentReference, data: Record<string, unknown>) => void;
  delete: (ref: MockDocumentReference) => void;
}

export interface MockWriteBatch {
  set: (ref: MockDocumentReference, data: Record<string, unknown>) => MockWriteBatch;
  update: (ref: MockDocumentReference, data: Record<string, unknown>) => MockWriteBatch;
  delete: (ref: MockDocumentReference) => MockWriteBatch;
  commit: () => Promise<void>;
}

export interface MockFirebaseAuth {
  verifySessionCookie: (cookie: string, checkRevoked?: boolean) => Promise<MockFirebaseUser>;
  verifyIdToken: (token: string, checkRevoked?: boolean) => Promise<MockFirebaseUser>;
  createSessionCookie: (idToken: string, options?: unknown) => Promise<string>;
  createCustomToken: (uid: string, claims?: Record<string, unknown>) => Promise<string>;
  createUser: (data: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<{ uid: string; email: string; displayName?: string }>;
  deleteUser: (uid: string) => Promise<void>;
  getUserByEmail: (email: string) => Promise<MockFirebaseUser>;
  getUser: (uid: string) => Promise<MockFirebaseUser>;
}

// =============================================================================
// MOCK REQUEST BUILDER
// =============================================================================

/**
 * Creates a mock NextRequest for API testing.
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param url - The URL path (e.g., '/api/users' or full URL)
 * @param options - Optional configuration for body, cookies, headers, searchParams
 *
 * @example
 * ```ts
 * const request = createMockRequest('POST', '/api/users', {
 *   body: { name: 'John' },
 *   cookies: { session: 'valid-session-token' },
 *   headers: { 'x-org-id': 'org-123', 'x-csrf-token': 'csrf-token' }
 * });
 * ```
 */
export function createMockRequest(
  method: string,
  url: string,
  options: MockRequestOptions = {},
): NextRequest {
  const { body, headers = {}, cookies = {}, searchParams = {} } = options;

  // Build URL with search params
  const baseUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  const urlObj = new URL(baseUrl);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Build headers
  const requestHeaders = new Headers(headers);
  if (body && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  // Create request init
  const init: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== "GET" && method !== "HEAD") {
    init.body = JSON.stringify(body);
  }

  const request = new NextRequest(
    urlObj.toString(),
    init as RequestInit & { signal?: AbortSignal },
  );

  // Mock cookies
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });

  return request;
}

// =============================================================================
// MOCK AUTH CONTEXT
// =============================================================================

/**
 * Creates a mock AuthContext for testing authenticated endpoints.
 *
 * @param userId - The user's unique identifier
 * @param claims - Optional custom claims to include
 *
 * @example
 * ```ts
 * const authContext = createMockAuthContext('user-123', { isAdmin: true });
 * ```
 */
export function createMockAuthContext(
  userId: string,
  claims: Record<string, unknown> = {},
): AuthContext {
  return {
    userId,
    email: `${userId}@example.com`,
    emailVerified: true,
    customClaims: claims,
  };
}

// =============================================================================
// MOCK ORG CONTEXT
// =============================================================================

/**
 * Creates a mock OrgContext for testing organization-scoped endpoints.
 *
 * @param orgId - The organization's unique identifier
 * @param role - The user's role in the organization
 * @param membershipId - Optional membership document ID
 *
 * @example
 * ```ts
 * const orgContext = createMockOrgContext('org-123', 'admin');
 * const staffContext = createMockOrgContext('org-456', 'staff', 'membership-789');
 * ```
 */
export function createMockOrgContext(
  orgId: string,
  role: OrgRole,
  membershipId?: string,
): OrgContext {
  return {
    orgId,
    role,
    membershipId: membershipId ?? `membership-${orgId}-${Date.now()}`,
  };
}

// =============================================================================
// MOCK FIREBASE ADMIN
// =============================================================================

/**
 * Creates mock implementations for firebase-admin modules.
 * Returns an object with mock functions that can be used with vi.mock().
 *
 * @example
 * ```ts
 * const { mockAuth, mockFirestore, setupMocks } = mockFirebaseAdmin();
 *
 * // Configure mock user for auth
 * mockAuth.setUser({ uid: 'user-123', email: 'test@example.com', email_verified: true });
 *
 * // Set mock data in Firestore
 * mockFirestore._setMockData('users/user-123', { name: 'John' });
 *
 * // Apply mocks in beforeEach
 * beforeEach(() => {
 *   setupMocks();
 * });
 * ```
 */
export function mockFirebaseAdmin() {
  // Internal mock data storage
  const firestoreData = new Map<string, Record<string, unknown>>();
  let currentUser: MockFirebaseUser | null = null;

  // ===================
  // FIRESTORE MOCK
  // ===================

  const createMockDocRef = (path: string): MockDocumentReference => ({
    id: path.split("/").pop() || "mock-id",
    path,
    get: async () => {
      const data = firestoreData.get(path);
      return {
        exists: !!data,
        data: () => data,
        id: path.split("/").pop() || "mock-id",
        ref: { id: path.split("/").pop() || "mock-id", path },
      };
    },
    set: async (data: Record<string, unknown>) => {
      firestoreData.set(path, data);
    },
    update: async (data: Record<string, unknown>) => {
      const existing = firestoreData.get(path) || {};
      firestoreData.set(path, { ...existing, ...data });
    },
    delete: async () => {
      firestoreData.delete(path);
    },
  });

  const createMockCollection = (collectionPath: string): MockCollectionReference => ({
    doc: (docId?: string) => createMockDocRef(`${collectionPath}/${docId || `doc-${Date.now()}`}`),
    where: function () {
      return this;
    },
    orderBy: function () {
      return this;
    },
    limit: function () {
      return this;
    },
    offset: function () {
      return this;
    },
    get: async () => ({
      empty: true,
      docs: [],
      forEach: () => {},
    }),
    count: () => ({
      get: async () => ({ data: () => ({ count: 0 }) }),
    }),
  });

  const mockFirestore: MockFirestore = {
    collection: createMockCollection,
    collectionGroup: createMockCollection,
    doc: createMockDocRef,
    runTransaction: async <T>(fn: (transaction: MockTransaction) => Promise<T>): Promise<T> => {
      const mockTransaction: MockTransaction = {
        get: async (ref: MockDocumentReference) => {
          const data = firestoreData.get(ref.path);
          return {
            exists: !!data,
            data: () => data,
            id: ref.id,
            ref: { id: ref.id, path: ref.path },
          };
        },
        set: (ref: MockDocumentReference, data: Record<string, unknown>) => {
          firestoreData.set(ref.path, data);
        },
        update: (ref: MockDocumentReference, data: Record<string, unknown>) => {
          const existing = firestoreData.get(ref.path) || {};
          firestoreData.set(ref.path, { ...existing, ...data });
        },
        delete: (ref: MockDocumentReference) => {
          firestoreData.delete(ref.path);
        },
      };
      return fn(mockTransaction);
    },
    batch: () => {
      const operations: Array<() => void> = [];
      const batchInstance: MockWriteBatch = {
        set: function (ref: MockDocumentReference, data: Record<string, unknown>) {
          operations.push(() => firestoreData.set(ref.path, data));
          return this;
        },
        update: function (ref: MockDocumentReference, data: Record<string, unknown>) {
          operations.push(() => {
            const existing = firestoreData.get(ref.path) || {};
            firestoreData.set(ref.path, { ...existing, ...data });
          });
          return this;
        },
        delete: function (ref: MockDocumentReference) {
          operations.push(() => firestoreData.delete(ref.path));
          return this;
        },
        commit: async () => {
          operations.forEach((op) => op());
        },
      };
      return batchInstance;
    },
    _setMockData: (path: string, data: Record<string, unknown>) => {
      firestoreData.set(path, data);
    },
    _getMockData: (path: string) => firestoreData.get(path),
    _clearMockData: () => {
      firestoreData.clear();
    },
  };

  // ===================
  // AUTH MOCK
  // ===================

  const mockAuth: MockFirebaseAuth & { setUser: (user: MockFirebaseUser | null) => void } = {
    setUser: (user: MockFirebaseUser | null) => {
      currentUser = user;
    },
    verifySessionCookie: async (cookie: string) => {
      if (!currentUser || !cookie) {
        const error = new Error("Invalid session cookie");
        (error as any).code = "auth/invalid-session-cookie";
        throw error;
      }
      return currentUser;
    },
    verifyIdToken: async (token: string) => {
      if (!currentUser || !token) {
        const error = new Error("Invalid ID token");
        (error as any).code = "auth/invalid-id-token";
        throw error;
      }
      return currentUser;
    },
    createSessionCookie: async () => "mock-session-cookie",
    createCustomToken: async (uid: string) => `mock-custom-token-${uid}`,
    createUser: async (data: { email: string; password: string; displayName?: string }) => ({
      uid: `user-${Date.now()}`,
      email: data.email,
      displayName: data.displayName,
    }),
    deleteUser: async () => undefined,
    getUserByEmail: async (email: string) => {
      if (currentUser && currentUser.email === email) {
        return currentUser;
      }
      const error = new Error("User not found");
      (error as any).code = "auth/user-not-found";
      throw error;
    },
    getUser: async (uid: string) => {
      if (currentUser && currentUser.uid === uid) {
        return currentUser;
      }
      const error = new Error("User not found");
      (error as any).code = "auth/user-not-found";
      throw error;
    },
  };

  // ===================
  // SETUP MOCKS FUNCTION
  // ===================

  const setupMocks = () => {
    // Mock firebase-admin/auth
    vi.mock("firebase-admin/auth", () => ({
      getAuth: () => mockAuth,
    }));

    // Mock firebase-admin/firestore
    vi.mock("firebase-admin/firestore", () => ({
      getFirestore: () => mockFirestore,
      FieldValue: {
        serverTimestamp: () => new Date(),
        increment: (n: number) => n,
        arrayUnion: (...elements: unknown[]) => elements,
        arrayRemove: (...elements: unknown[]) => elements,
        delete: () => undefined,
      },
      Timestamp: {
        now: () => ({ toDate: () => new Date(), toMillis: () => Date.now() }),
        fromDate: (date: Date) => ({ toDate: () => date, toMillis: () => date.getTime() }),
        fromMillis: (ms: number) => ({ toDate: () => new Date(ms), toMillis: () => ms }),
      },
    }));

    // Mock firebase-admin (the main import)
    vi.mock("firebase-admin", () => ({
      getAuth: () => mockAuth,
      getFirestore: () => mockFirestore,
    }));
  };

  return {
    mockAuth,
    mockFirestore,
    setupMocks,
    // Convenience methods
    clearAllMockData: () => {
      firestoreData.clear();
      currentUser = null;
    },
  };
}

// =============================================================================
// ENDPOINT CALL HELPER
// =============================================================================

export type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse> | NextResponse;

/**
 * Helper to invoke a route handler with proper context.
 * Handles both sync and async handlers.
 *
 * @param handler - The route handler function (GET, POST, etc.)
 * @param request - The NextRequest to pass to the handler
 * @param params - Optional route parameters (e.g., { id: '123' })
 *
 * @example
 * ```ts
 * import { GET } from '../route';
 *
 * const request = createMockRequest('GET', '/api/users/123');
 * const response = await callEndpoint(GET, request, { id: '123' });
 * const data = await response.json();
 *
 * expect(response.status).toBe(200);
 * expect(data.id).toBe('123');
 * ```
 */
export async function callEndpoint(
  handler: RouteHandler,
  request: NextRequest,
  params: Record<string, string> = {},
): Promise<NextResponse> {
  const context = {
    params: Promise.resolve(params),
  };

  const response = await handler(request, context);
  return response;
}

// =============================================================================
// RESPONSE ASSERTION HELPERS
// =============================================================================

/**
 * Parses a JSON response and returns the data.
 */
export async function parseJsonResponse<T = unknown>(response: NextResponse): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Failed to parse JSON response: ${text}`);
  }
}

/**
 * Asserts that a response is successful (2xx) and returns the parsed JSON.
 */
export async function expectSuccess<T = unknown>(response: NextResponse): Promise<T> {
  if (response.status < 200 || response.status >= 300) {
    const body = await response.text();
    throw new Error(`Expected success response but got ${response.status}: ${body}`);
  }
  return parseJsonResponse<T>(response);
}

/**
 * Asserts that a response is an error with the expected status code.
 */
export async function expectError(
  response: NextResponse,
  expectedStatus: number,
  expectedCode?: string,
): Promise<{ code: string; message: string }> {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`Expected status ${expectedStatus} but got ${response.status}: ${body}`);
  }

  const data = await parseJsonResponse<{ code: string; message: string }>(response);

  if (expectedCode && data.code !== expectedCode) {
    throw new Error(`Expected error code "${expectedCode}" but got "${data.code}"`);
  }

  return data;
}

// =============================================================================
// TEST FIXTURES
// =============================================================================

/**
 * Pre-configured test users for common scenarios.
 */
export const testUsers = {
  admin: createMockAuthContext("admin-user", { isAdmin: true }),
  manager: createMockAuthContext("manager-user"),
  staff: createMockAuthContext("staff-user"),
  unverified: {
    userId: "unverified-user",
    email: "unverified@example.com",
    emailVerified: false,
    customClaims: {},
  } as AuthContext,
};

/**
 * Pre-configured test organizations for common scenarios.
 */
export const testOrgs = {
  acme: createMockOrgContext("org-acme", "org_owner"),
  beta: createMockOrgContext("org-beta", "admin"),
  gamma: createMockOrgContext("org-gamma", "manager"),
};

/**
 * Pre-configured mock Firebase users for auth testing.
 */
export const testFirebaseUsers: Record<string, MockFirebaseUser> = {
  admin: {
    uid: "admin-user",
    email: "admin@example.com",
    email_verified: true,
    customClaims: { isAdmin: true },
  },
  manager: {
    uid: "manager-user",
    email: "manager@example.com",
    email_verified: true,
  },
  staff: {
    uid: "staff-user",
    email: "staff@example.com",
    email_verified: true,
  },
  unverified: {
    uid: "unverified-user",
    email: "unverified@example.com",
    email_verified: false,
  },
};

// =============================================================================
// NOTE: All types, functions, and fixtures are exported inline above
// =============================================================================
