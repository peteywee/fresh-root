// [P0][TEST][TEST] Testing tests
// Tags: P0, TEST, TEST
/**
 * @fresh-schedules/api-framework/testing
 *
 * Test utilities for API endpoints built with the SDK
 */

import { NextRequest } from "next/server";
import type { AuthContext, OrgContext, OrgRole } from "./index";

// =============================================================================
// MOCK REQUEST BUILDER
// =============================================================================

export interface MockRequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  searchParams?: Record<string, string>;
}

export function createMockRequest(url: string, options: MockRequestOptions = {}): NextRequest {
  const { method = "GET", body, headers = {}, cookies = {}, searchParams = {} } = options;

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

  if (body && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  const request = new NextRequest(urlObj.toString(), init);

  // Mock cookies
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });

  return request;
}

// =============================================================================
// MOCK CONTEXT BUILDERS
// =============================================================================

export function createMockAuthContext(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    userId: "test-user-123",
    email: "test@example.com",
    emailVerified: true,
    ...overrides,
  };
}

export function createMockOrgContext(overrides: Partial<OrgContext> = {}): OrgContext {
  return {
    orgId: "test-org-123",
    role: "admin" as OrgRole,
    membershipId: "test-membership-123",
    ...overrides,
  };
}

// =============================================================================
// MOCK FIREBASE
// =============================================================================

export interface MockFirebaseUser {
  uid: string;
  email: string;
  email_verified: boolean;
}

export function createMockFirebaseAuth(user: MockFirebaseUser | null = null) {
  return {
    verifySessionCookie: async () => {
      if (!user) throw new Error("Invalid session");
      return user;
    },
    createSessionCookie: async () => "mock-session-cookie",
    verifyIdToken: async () => {
      if (!user) throw new Error("Invalid token");
      return user;
    },
    createCustomToken: async (uid: string) => `mock-token-${uid}`,
    createUser: async (data: { email: string; password: string; displayName?: string }) => ({
      uid: `user-${Date.now()}`,
      email: data.email,
      displayName: data.displayName,
    }),
    deleteUser: async () => undefined,
    getUserByEmail: async () => {
      throw { code: "auth/user-not-found" };
    },
  };
}

export function createMockFirestore() {
  const mockData = new Map<string, Record<string, unknown>>();

  const createMockDocRef = (path: string) => ({
    id: path.split("/").pop() || "mock-id",
    path,
    get: async () => {
      const data = mockData.get(path);
      return {
        exists: !!data,
        data: () => data,
        id: path.split("/").pop(),
        ref: { id: path.split("/").pop(), path },
      };
    },
    set: async (data: Record<string, unknown>) => {
      mockData.set(path, data);
    },
    update: async (data: Record<string, unknown>) => {
      const existing = mockData.get(path) || {};
      mockData.set(path, { ...existing, ...data });
    },
    delete: async () => {
      mockData.delete(path);
    },
  });

  const mockCollection = (collectionPath: string) => ({
    doc: (docId?: string) => createMockDocRef(`${collectionPath}/${docId || `doc-${Date.now()}`}`),
    where: () => mockCollection(collectionPath),
    orderBy: () => mockCollection(collectionPath),
    limit: () => mockCollection(collectionPath),
    offset: () => mockCollection(collectionPath),
    get: async () => ({
      empty: true,
      docs: [],
      forEach: () => {},
    }),
    count: () => ({
      get: async () => ({ data: () => ({ count: 0 }) }),
    }),
  });

  return {
    collection: mockCollection,
    collectionGroup: mockCollection,
    doc: createMockDocRef,
    runTransaction: async <T>(fn: (transaction: unknown) => Promise<T>): Promise<T> => {
      const mockTransaction = {
        get: async (ref: { path: string }) => {
          const data = mockData.get(ref.path);
          return {
            exists: !!data,
            data: () => data,
          };
        },
        set: (ref: { path: string }, data: Record<string, unknown>) => {
          mockData.set(ref.path, data);
        },
        update: (ref: { path: string }, data: Record<string, unknown>) => {
          const existing = mockData.get(ref.path) || {};
          mockData.set(ref.path, { ...existing, ...data });
        },
        delete: (ref: { path: string }) => {
          mockData.delete(ref.path);
        },
      };
      return fn(mockTransaction);
    },
    batch: () => ({
      set: function () {
        return this;
      },
      update: function () {
        return this;
      },
      delete: function () {
        return this;
      },
      commit: async () => [],
    }),
    // Test helper to set mock data
    _setMockData: (path: string, data: Record<string, unknown>) => {
      mockData.set(path, data);
    },
    _clearMockData: () => {
      mockData.clear();
    },
  };
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse response: ${text}`);
  }
}

export async function expectSuccess<T>(
  response: Response,
  expectedData?: Partial<T>,
): Promise<{ data: T; meta: { requestId: string } }> {
  expect(response.status).toBe(200);
  const json = await parseJsonResponse<{ data: T; meta: { requestId: string } }>(response);
  if (expectedData) {
    expect(json.data).toMatchObject(expectedData);
  }
  return json;
}

export async function expectError(
  response: Response,
  expectedCode: string,
  expectedStatus: number,
): Promise<{ error: { code: string; message: string; requestId: string } }> {
  expect(response.status).toBe(expectedStatus);
  const json = await parseJsonResponse<{
    error: { code: string; message: string; requestId: string };
  }>(response);
  expect(json.error.code).toBe(expectedCode);
  return json;
}

// =============================================================================
// TEST FIXTURES
// =============================================================================

export const testUsers = {
  admin: createMockAuthContext({ userId: "admin-user", email: "admin@test.com" }),
  manager: createMockAuthContext({ userId: "manager-user", email: "manager@test.com" }),
  staff: createMockAuthContext({ userId: "staff-user", email: "staff@test.com" }),
  viewer: createMockAuthContext({ userId: "viewer-user", email: "viewer@test.com" }),
};

export const testOrgs = {
  acme: createMockOrgContext({ orgId: "org-acme", role: "owner" }),
  beta: createMockOrgContext({ orgId: "org-beta", role: "admin" }),
};
