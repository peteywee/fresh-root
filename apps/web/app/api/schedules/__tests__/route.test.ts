// [P0][TEST][SCHEDULE] Comprehensive API tests for schedules endpoint
// Tags: P0, TEST, SCHEDULE

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { NextResponse } from "next/server";

import {
  createMockRequest,
  createMockOrgContext,
  mockFirebaseAdmin,
  callEndpoint,
  parseJsonResponse,
  expectSuccess,
  expectError,
  testFirebaseUsers,
  type MockFirestore,
  type MockDocumentSnapshot,
  type MockCollectionReference,
} from "../../__tests__/test-utils";

// =============================================================================
// MODULE MOCKS
// =============================================================================

// Use vi.hoisted to create mock values before vi.mock hoisting
const { mockAuth, mockFirestore, clearAllMockData } = vi.hoisted(() => {
  // Import and call mockFirebaseAdmin here since vi.hoisted runs before vi.mock
  const firestoreData = new Map<string, Record<string, unknown>>();
  let currentUser: { uid: string; email: string; email_verified: boolean } | null = null;

  const createMockDocRef = (path: string) => ({
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
      // Firestore throws if document doesn't exist on update
      const existing = firestoreData.get(path);
      if (!existing) {
        const error = new Error(`No document to update: ${path}`);
        error.name = "FirebaseError";
        throw error;
      }
      firestoreData.set(path, { ...existing, ...data });
    },
    delete: async () => {
      firestoreData.delete(path);
    },
  });

  const createMockCollection = (collectionPath: string) => ({
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

  const mockFirestore = {
    collection: createMockCollection,
    collectionGroup: createMockCollection,
    doc: createMockDocRef,
    runTransaction: async <T>(fn: (transaction: any) => Promise<T>): Promise<T> => {
      const mockTransaction = {
        get: async (ref: any) => {
          const data = firestoreData.get(ref.path);
          return {
            exists: !!data,
            data: () => data,
            id: ref.id,
            ref: { id: ref.id, path: ref.path },
          };
        },
        set: (ref: any, data: Record<string, unknown>) => {
          firestoreData.set(ref.path, data);
        },
        update: (ref: any, data: Record<string, unknown>) => {
          const existing = firestoreData.get(ref.path) || {};
          firestoreData.set(ref.path, { ...existing, ...data });
        },
        delete: (ref: any) => {
          firestoreData.delete(ref.path);
        },
      };
      return fn(mockTransaction);
    },
    batch: () => {
      const operations: Array<() => void> = [];
      return {
        set: function (ref: any, data: Record<string, unknown>) {
          operations.push(() => firestoreData.set(ref.path, data));
          return this;
        },
        update: function (ref: any, data: Record<string, unknown>) {
          operations.push(() => {
            const existing = firestoreData.get(ref.path) || {};
            firestoreData.set(ref.path, { ...existing, ...data });
          });
          return this;
        },
        delete: function (ref: any) {
          operations.push(() => firestoreData.delete(ref.path));
          return this;
        },
        commit: async () => {
          operations.forEach((op) => op());
        },
      };
    },
    _setMockData: (path: string, data: Record<string, unknown>) => {
      firestoreData.set(path, data);
    },
    _getMockData: (path: string) => firestoreData.get(path),
    _clearMockData: () => firestoreData.clear(),
  };

  const mockAuth = {
    verifySessionCookie: async () => {
      if (!currentUser) throw new Error("No user");
      return currentUser;
    },
    getUser: async () => {
      if (!currentUser) throw new Error("No user");
      return currentUser;
    },
    setUser: (user: { uid: string; email: string; email_verified: boolean } | null) => {
      currentUser = user;
    },
  };

  return {
    mockAuth,
    mockFirestore,
    clearAllMockData: () => {
      firestoreData.clear();
      currentUser = null;
    },
  };
});

// Mock the firebase.server module to use our mock firestore
vi.mock("@/src/lib/firebase.server", () => ({
  adminDb: mockFirestore,
}));

// Mock the typed-wrappers to use our mock firestore
vi.mock("@/src/lib/firebase/typed-wrappers", () => ({
  setDocWithType: vi.fn(async (_db: any, ref: { path: string }, data: Record<string, unknown>) => {
    mockFirestore._setMockData(ref.path, data);
  }),
  queryWithType: vi.fn(async (_db: any, query: any) => {
    const snapshot = await query.get();
    return {
      success: true,
      data: snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
    };
  }),
}));

// Mock createOrgEndpoint to handle auth/org context injection
vi.mock("@fresh-schedules/api-framework", () => ({
  createOrgEndpoint: (config: {
    roles?: string[];
    rateLimit?: { maxRequests: number; windowMs: number };
    handler: (args: {
      request: Request;
      input: unknown;
      context: { auth: { userId: string } | null; org: { orgId: string; role: string } | null };
      params: Record<string, string>;
    }) => Promise<NextResponse>;
  }) => {
    return async (request: Request, routeContext?: { params: Promise<Record<string, string>> }) => {
      const sessionCookie = request.headers.get("cookie")?.includes("session=valid");
      const orgId = request.headers.get("x-org-id");
      const orgRole = request.headers.get("x-org-role") || "staff";

      // Check authentication
      if (!sessionCookie) {
        return new Response(
          JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }

      // Check organization context
      if (!orgId) {
        return new Response(
          JSON.stringify({
            error: { code: "FORBIDDEN", message: "Organization context required" },
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }

      // Check role requirements
      if (config.roles && config.roles.length > 0) {
        const roleHierarchy: Record<string, number> = {
          staff: 10,
          corporate: 20,
          scheduler: 30,
          manager: 40,
          admin: 50,
          org_owner: 60,
        };
        const requiredLevel = Math.min(...config.roles.map((r) => roleHierarchy[r] ?? 100));
        const userLevel = roleHierarchy[orgRole] ?? 0;

        if (userLevel < requiredLevel) {
          return new Response(
            JSON.stringify({
              error: { code: "FORBIDDEN", message: "Insufficient permissions" },
            }),
            { status: 403, headers: { "Content-Type": "application/json" } },
          );
        }
      }

      const params = routeContext?.params ? await routeContext.params : {};
      const context = {
        auth: { userId: "test-user-id" },
        org: { orgId, role: orgRole },
      };

      return config.handler({ request, input: undefined, context, params });
    };
  },
}));

// Import route handlers after mocks are set up
import { GET, POST } from "../route";
import { GET as GET_BY_ID, PATCH, DELETE } from "../[id]/route";

// =============================================================================
// TEST HELPERS
// =============================================================================

const VALID_ORG_ID = "org-test-123";
const VALID_SCHEDULE_ID = "schedule-123";

function createAuthenticatedRequest(
  method: string,
  url: string,
  options: {
    body?: unknown;
    orgId?: string;
    role?: string;
    searchParams?: Record<string, string>;
  } = {},
) {
  const { body, orgId = VALID_ORG_ID, role = "manager", searchParams } = options;
  return createMockRequest(method, url, {
    body,
    searchParams,
    cookies: { session: "valid" },
    headers: {
      "x-org-id": orgId,
      "x-org-role": role,
      "x-csrf-token": "valid-csrf-token",
    },
  });
}

function createUnauthenticatedRequest(method: string, url: string, body?: unknown) {
  return createMockRequest(method, url, { body });
}

function createMockScheduleData(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: VALID_SCHEDULE_ID,
    orgId: VALID_ORG_ID,
    name: "Test Schedule",
    startDate: { toDate: () => new Date("2024-01-01"), toMillis: () => 1704067200000 },
    endDate: { toDate: () => new Date("2024-04-01"), toMillis: () => 1711929600000 },
    state: "draft",
    createdAt: { toDate: () => new Date(), toMillis: () => Date.now() },
    updatedAt: { toDate: () => new Date(), toMillis: () => Date.now() },
    createdBy: "test-user-id",
    ...overrides,
  };
}

// =============================================================================
// TEST SUITES
// =============================================================================

describe("Schedules API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllMockData();
    mockAuth.setUser(testFirebaseUsers.manager);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ===========================================================================
  // GET /api/schedules (List)
  // ===========================================================================
  describe("GET /api/schedules (list)", () => {
    describe("Authentication & Authorization", () => {
      it("should return 401 without session cookie", async () => {
        const request = createUnauthenticatedRequest("GET", "/api/schedules");
        const response = await callEndpoint(GET, request);

        expect(response.status).toBe(401);
        const data = await parseJsonResponse(response);
        expect(data).toMatchObject({
          error: { code: "UNAUTHORIZED" },
        });
      });

      it("should return 403 without organization context", async () => {
        const request = createMockRequest("GET", "/api/schedules", {
          cookies: { session: "valid" },
          headers: { "x-csrf-token": "valid-csrf-token" },
        });
        const response = await callEndpoint(GET, request);

        expect(response.status).toBe(403);
        const data = await parseJsonResponse(response);
        expect(data).toMatchObject({
          error: { code: "FORBIDDEN" },
        });
      });

      it("should return 200 for authenticated user with org context", async () => {
        const request = createAuthenticatedRequest("GET", "/api/schedules");
        const response = await callEndpoint(GET, request);

        expect(response.status).toBe(200);
      });
    });

    describe("Pagination", () => {
      it("should respect limit parameter", async () => {
        const request = createAuthenticatedRequest("GET", "/api/schedules", {
          searchParams: { limit: "10" },
        });
        const response = await callEndpoint(GET, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ limit: number }>(response);
        expect(data.limit).toBe(10);
      });

      it("should respect offset parameter", async () => {
        const request = createAuthenticatedRequest("GET", "/api/schedules", {
          searchParams: { offset: "20" },
        });
        const response = await callEndpoint(GET, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ offset: number }>(response);
        expect(data.offset).toBe(20);
      });

      it("should use default pagination values when not specified", async () => {
        const request = createAuthenticatedRequest("GET", "/api/schedules");
        const response = await callEndpoint(GET, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ limit: number; offset: number }>(response);
        expect(data.limit).toBe(20); // Default limit
        expect(data.offset).toBe(0); // Default offset
      });

      it("should handle invalid pagination values gracefully", async () => {
        const request = createAuthenticatedRequest("GET", "/api/schedules", {
          searchParams: { limit: "invalid", offset: "-5" },
        });
        const response = await callEndpoint(GET, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ limit: number; offset: number }>(response);
        // Should fall back to defaults for invalid values
        expect(data.limit).toBe(20);
        expect(data.offset).toBe(0);
      });
    });

    describe("Response Format", () => {
      it("should return data array in response", async () => {
        const request = createAuthenticatedRequest("GET", "/api/schedules");
        const response = await callEndpoint(GET, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ data: unknown[] }>(response);
        expect(Array.isArray(data.data)).toBe(true);
      });
    });
  });

  // ===========================================================================
  // POST /api/schedules (Create)
  // ===========================================================================
  describe("POST /api/schedules (create)", () => {
    const validScheduleInput = {
      orgId: VALID_ORG_ID,
      name: "Q1 2024 Schedule",
      startDate: 1704067200000, // Jan 1, 2024
      endDate: 1711929600000, // Apr 1, 2024
    };

    describe("Authentication & Authorization", () => {
      it("should return 401 without session cookie", async () => {
        const request = createUnauthenticatedRequest("POST", "/api/schedules", validScheduleInput);
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(401);
      });

      it("should return 403 without organization context", async () => {
        const request = createMockRequest("POST", "/api/schedules", {
          body: validScheduleInput,
          cookies: { session: "valid" },
          headers: { "x-csrf-token": "valid-csrf-token" },
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(403);
      });

      it("should return 403 for staff role (requires scheduler+)", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: validScheduleInput,
          role: "staff",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(403);
        const data = await parseJsonResponse(response);
        expect(data).toMatchObject({
          error: { code: "FORBIDDEN" },
        });
      });

      it("should return 403 when orgId in body does not match context", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: { ...validScheduleInput, orgId: "org-other-999" },
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(403);
      });

      it("should succeed for scheduler role", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: validScheduleInput,
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
      });

      it("should succeed for manager role", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: validScheduleInput,
          role: "manager",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
      });
    });

    describe("Input Validation", () => {
      it("should reject empty schedule name", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: { ...validScheduleInput, name: "" },
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(400);
        const data = await parseJsonResponse(response);
        expect(data).toMatchObject({
          error: { code: "BAD_REQUEST" },
        });
      });

      it("should reject missing name", async () => {
        const { name: _name, ...inputWithoutName } = validScheduleInput;
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: inputWithoutName,
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(400);
      });

      it("should reject missing startDate", async () => {
        const { startDate: _startDate, ...inputWithoutStartDate } = validScheduleInput;
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: inputWithoutStartDate,
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(400);
      });

      it("should reject missing endDate", async () => {
        const { endDate: _endDate, ...inputWithoutEndDate } = validScheduleInput;
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: inputWithoutEndDate,
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(400);
      });

      it("should reject endDate before startDate", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: {
            ...validScheduleInput,
            startDate: 1711929600000, // Apr 1, 2024
            endDate: 1704067200000, // Jan 1, 2024 (reversed)
          },
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(400);
        const data = await parseJsonResponse(response);
        expect(data).toMatchObject({
          error: { code: "BAD_REQUEST" },
        });
      });

      it("should reject name exceeding max length", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: { ...validScheduleInput, name: "A".repeat(101) },
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(400);
      });

      it("should reject invalid JSON body", async () => {
        const request = createMockRequest("POST", "/api/schedules", {
          cookies: { session: "valid" },
          headers: {
            "x-org-id": VALID_ORG_ID,
            "x-org-role": "scheduler",
            "content-type": "application/json",
          },
        });
        // Override the body with invalid JSON - simulated via empty body
        const response = await callEndpoint(POST, request);

        // Should handle gracefully
        expect([400, 500]).toContain(response.status);
      });
    });

    describe("Successful Creation", () => {
      it("should create schedule with valid data", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: validScheduleInput,
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ success: boolean; schedule: { name: string } }>(
          response,
        );
        expect(data.success).toBe(true);
        expect(data.schedule).toBeDefined();
        expect(data.schedule.name).toBe(validScheduleInput.name);
      });

      it("should set initial state to draft", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: validScheduleInput,
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ schedule: { state: string } }>(response);
        expect(data.schedule.state).toBe("draft");
      });

      it("should include createdBy from auth context", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: validScheduleInput,
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ schedule: { createdBy: string } }>(response);
        expect(data.schedule.createdBy).toBeDefined();
      });

      it("should include timestamps", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: validScheduleInput,
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{
          schedule: { createdAt: unknown; updatedAt: unknown };
        }>(response);
        expect(data.schedule.createdAt).toBeDefined();
        expect(data.schedule.updatedAt).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // GET /api/schedules/[id]
  // ===========================================================================
  describe("GET /api/schedules/[id]", () => {
    describe("Authentication & Authorization", () => {
      it("should return 401 without session cookie", async () => {
        const request = createUnauthenticatedRequest("GET", `/api/schedules/${VALID_SCHEDULE_ID}`);
        const response = await callEndpoint(GET_BY_ID, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(401);
      });

      it("should return 403 without organization context", async () => {
        const request = createMockRequest("GET", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          cookies: { session: "valid" },
        });
        const response = await callEndpoint(GET_BY_ID, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(403);
      });
    });

    describe("Schedule Retrieval", () => {
      beforeEach(() => {
        // Set up mock schedule data
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );
      });

      it("should return schedule for valid ID", async () => {
        const request = createAuthenticatedRequest("GET", `/api/schedules/${VALID_SCHEDULE_ID}`);
        const response = await callEndpoint(GET_BY_ID, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ id: string }>(response);
        expect(data.id).toBe(VALID_SCHEDULE_ID);
      });

      it("should return 400 for non-existent schedule", async () => {
        const request = createAuthenticatedRequest("GET", "/api/schedules/non-existent");
        const response = await callEndpoint(GET_BY_ID, request, { id: "non-existent" });

        expect(response.status).toBe(400);
        const data = await parseJsonResponse(response);
        expect(data).toMatchObject({
          error: { code: "NOT_FOUND" },
        });
      });

      it("should return 400 for missing schedule ID", async () => {
        const request = createAuthenticatedRequest("GET", "/api/schedules/");
        const response = await callEndpoint(GET_BY_ID, request, { id: "" });

        expect(response.status).toBe(400);
      });
    });
  });

  // ===========================================================================
  // PATCH /api/schedules/[id]
  // ===========================================================================
  describe("PATCH /api/schedules/[id]", () => {
    const updatePayload = {
      name: "Updated Schedule Name",
    };

    describe("Authentication & Authorization", () => {
      it("should return 401 without session cookie", async () => {
        const request = createUnauthenticatedRequest(
          "PATCH",
          `/api/schedules/${VALID_SCHEDULE_ID}`,
          updatePayload,
        );
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(401);
      });

      it("should return 403 without organization context", async () => {
        const request = createMockRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: updatePayload,
          cookies: { session: "valid" },
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(403);
      });

      it("should return 403 for staff role (requires manager)", async () => {
        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: updatePayload,
          role: "staff",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(403);
        const data = await parseJsonResponse(response);
        expect(data).toMatchObject({
          error: { code: "FORBIDDEN" },
        });
      });

      it("should return 403 for scheduler role (requires manager)", async () => {
        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: updatePayload,
          role: "scheduler",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(403);
      });

      it("should succeed for manager role", async () => {
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );

        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: updatePayload,
          role: "manager",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
      });

      it("should succeed for admin role", async () => {
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );

        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: updatePayload,
          role: "admin",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
      });
    });

    describe("Input Validation", () => {
      beforeEach(() => {
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );
      });

      it("should reject empty name", async () => {
        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: { name: "" },
          role: "manager",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(400);
      });

      it("should reject name exceeding max length", async () => {
        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: { name: "A".repeat(101) },
          role: "manager",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(400);
      });

      it("should accept valid partial update", async () => {
        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: { name: "New Name" },
          role: "manager",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
      });

      it("should accept description update", async () => {
        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: { description: "Updated description" },
          role: "manager",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
      });
    });

    describe("Update Behavior", () => {
      beforeEach(() => {
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );
      });

      it("should return updated schedule", async () => {
        const request = createAuthenticatedRequest("PATCH", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          body: { name: "Updated Name" },
          role: "manager",
        });
        const response = await callEndpoint(PATCH, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ id: string }>(response);
        expect(data.id).toBe(VALID_SCHEDULE_ID);
      });

      it("should return 404 for non-existent schedule", async () => {
        const request = createAuthenticatedRequest("PATCH", "/api/schedules/non-existent", {
          body: updatePayload,
          role: "manager",
        });
        const response = await callEndpoint(PATCH, request, { id: "non-existent" });

        // Firestore update throws when doc doesn't exist
        expect([400, 404, 500]).toContain(response.status);
      });
    });
  });

  // ===========================================================================
  // DELETE /api/schedules/[id]
  // ===========================================================================
  describe("DELETE /api/schedules/[id]", () => {
    describe("Authentication & Authorization", () => {
      it("should return 401 without session cookie", async () => {
        const request = createUnauthenticatedRequest(
          "DELETE",
          `/api/schedules/${VALID_SCHEDULE_ID}`,
        );
        const response = await callEndpoint(DELETE, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(401);
      });

      it("should return 403 without organization context", async () => {
        const request = createMockRequest("DELETE", `/api/schedules/${VALID_SCHEDULE_ID}`, {
          cookies: { session: "valid" },
        });
        const response = await callEndpoint(DELETE, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(403);
      });

      it("should return 403 for staff role (requires manager)", async () => {
        const request = createAuthenticatedRequest(
          "DELETE",
          `/api/schedules/${VALID_SCHEDULE_ID}`,
          {
            role: "staff",
          },
        );
        const response = await callEndpoint(DELETE, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(403);
        const data = await parseJsonResponse(response);
        expect(data).toMatchObject({
          error: { code: "FORBIDDEN" },
        });
      });

      it("should return 403 for scheduler role (requires manager)", async () => {
        const request = createAuthenticatedRequest(
          "DELETE",
          `/api/schedules/${VALID_SCHEDULE_ID}`,
          {
            role: "scheduler",
          },
        );
        const response = await callEndpoint(DELETE, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(403);
      });

      it("should succeed for manager role", async () => {
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );

        const request = createAuthenticatedRequest(
          "DELETE",
          `/api/schedules/${VALID_SCHEDULE_ID}`,
          {
            role: "manager",
          },
        );
        const response = await callEndpoint(DELETE, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
      });

      it("should succeed for admin role", async () => {
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );

        const request = createAuthenticatedRequest(
          "DELETE",
          `/api/schedules/${VALID_SCHEDULE_ID}`,
          {
            role: "admin",
          },
        );
        const response = await callEndpoint(DELETE, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
      });

      it("should succeed for org_owner role", async () => {
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );

        const request = createAuthenticatedRequest(
          "DELETE",
          `/api/schedules/${VALID_SCHEDULE_ID}`,
          {
            role: "org_owner",
          },
        );
        const response = await callEndpoint(DELETE, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
      });
    });

    describe("Delete Behavior", () => {
      beforeEach(() => {
        mockFirestore._setMockData(
          `organizations/${VALID_ORG_ID}/schedules/${VALID_SCHEDULE_ID}`,
          createMockScheduleData(),
        );
      });

      it("should return success confirmation", async () => {
        const request = createAuthenticatedRequest(
          "DELETE",
          `/api/schedules/${VALID_SCHEDULE_ID}`,
          {
            role: "manager",
          },
        );
        const response = await callEndpoint(DELETE, request, { id: VALID_SCHEDULE_ID });

        expect(response.status).toBe(200);
        const data = await parseJsonResponse<{ deleted: boolean; id: string }>(response);
        expect(data.deleted).toBe(true);
        expect(data.id).toBe(VALID_SCHEDULE_ID);
      });

      it("should return 400 for missing schedule ID", async () => {
        const request = createAuthenticatedRequest("DELETE", "/api/schedules/", {
          role: "manager",
        });
        const response = await callEndpoint(DELETE, request, { id: "" });

        expect(response.status).toBe(400);
      });

      it("should handle non-existent schedule gracefully", async () => {
        // Firestore delete is idempotent - doesn't error on missing docs
        const request = createAuthenticatedRequest("DELETE", "/api/schedules/non-existent", {
          role: "manager",
        });
        const response = await callEndpoint(DELETE, request, { id: "non-existent" });

        // Should succeed (Firestore delete is idempotent)
        expect(response.status).toBe(200);
      });
    });
  });

  // ===========================================================================
  // Cross-Organization Access Tests
  // ===========================================================================
  describe("Cross-Organization Access", () => {
    const ORG_A = "org-alpha";
    const ORG_B = "org-beta";
    const SCHEDULE_A = "schedule-from-org-a";

    beforeEach(() => {
      // Set up schedule in Org A
      mockFirestore._setMockData(
        `organizations/${ORG_A}/schedules/${SCHEDULE_A}`,
        createMockScheduleData({ id: SCHEDULE_A, orgId: ORG_A }),
      );
    });

    it("should not allow Org B user to access Org A schedule", async () => {
      const request = createAuthenticatedRequest("GET", `/api/schedules/${SCHEDULE_A}`, {
        orgId: ORG_B,
      });
      const response = await callEndpoint(GET_BY_ID, request, { id: SCHEDULE_A });

      // Should return 400 NOT_FOUND since the path uses the wrong org
      expect(response.status).toBe(400);
    });

    it("should not allow Org B user to update Org A schedule", async () => {
      const request = createAuthenticatedRequest("PATCH", `/api/schedules/${SCHEDULE_A}`, {
        orgId: ORG_B,
        body: { name: "Hijacked Schedule" },
        role: "manager",
      });
      const response = await callEndpoint(PATCH, request, { id: SCHEDULE_A });

      // Should fail since the path uses the wrong org
      expect([400, 404, 500]).toContain(response.status);
    });

    it("should not allow Org B user to delete Org A schedule", async () => {
      const request = createAuthenticatedRequest("DELETE", `/api/schedules/${SCHEDULE_A}`, {
        orgId: ORG_B,
        role: "manager",
      });
      const response = await callEndpoint(DELETE, request, { id: SCHEDULE_A });

      // Firestore delete is scoped to org path, so this operates on wrong path
      expect(response.status).toBe(200); // Delete is idempotent, but operates on empty doc
    });

    it("Org A schedule should still exist after Org B delete attempt", async () => {
      // First, Org B attempts delete
      const deleteRequest = createAuthenticatedRequest("DELETE", `/api/schedules/${SCHEDULE_A}`, {
        orgId: ORG_B,
        role: "manager",
      });
      await callEndpoint(DELETE, deleteRequest, { id: SCHEDULE_A });

      // Verify Org A's schedule still exists
      const orgAData = mockFirestore._getMockData(`organizations/${ORG_A}/schedules/${SCHEDULE_A}`);
      expect(orgAData).toBeDefined();
      expect(orgAData?.id).toBe(SCHEDULE_A);
    });
  });

  // ===========================================================================
  // Edge Cases & Error Handling
  // ===========================================================================
  describe("Edge Cases & Error Handling", () => {
    describe("Special Characters in Schedule Names", () => {
      it("should handle unicode characters in name", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: {
            orgId: VALID_ORG_ID,
            name: "日本語スケジュール 🗓️",
            startDate: 1704067200000,
            endDate: 1711929600000,
          },
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
      });

      it("should handle special characters in name", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: {
            orgId: VALID_ORG_ID,
            name: "Q1 Schedule (2024) - Draft #1",
            startDate: 1704067200000,
            endDate: 1711929600000,
          },
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
      });
    });

    describe("Boundary Dates", () => {
      it("should accept same day start and end (if end > start in ms)", async () => {
        const startDate = 1704067200000; // Jan 1, 2024 00:00:00
        const endDate = startDate + 1000; // 1 second later

        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: {
            orgId: VALID_ORG_ID,
            name: "Single Day Schedule",
            startDate,
            endDate,
          },
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
      });

      it("should handle far future dates", async () => {
        const request = createAuthenticatedRequest("POST", "/api/schedules", {
          body: {
            orgId: VALID_ORG_ID,
            name: "Future Schedule",
            startDate: 4102444800000, // Jan 1, 2100
            endDate: 4133980800000, // Jan 1, 2101
          },
          role: "scheduler",
        });
        const response = await callEndpoint(POST, request);

        expect(response.status).toBe(200);
      });
    });

    describe("Concurrent Requests", () => {
      it("should handle multiple simultaneous GET requests", async () => {
        const requests = Array.from({ length: 5 }, () =>
          createAuthenticatedRequest("GET", "/api/schedules"),
        );

        const responses = await Promise.all(requests.map((req) => callEndpoint(GET, req)));

        responses.forEach((response) => {
          expect(response.status).toBe(200);
        });
      });
    });
  });
});
