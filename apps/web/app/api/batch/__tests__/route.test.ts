// [P1][TEST][INTEGRATION] /api/batch route tests
// Tags: P1, TEST, INTEGRATION, BATCH

import { describe, it, expect, vi } from "vitest";
// Mock firebase-admin auth and firestore to allow createOrgEndpoint checks in tests
vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    verifySessionCookie: async (_cookie: string) => ({
      uid: "test-user-123",
      email: "test@example.com",
      email_verified: true,
      customClaims: {},
    }),
    verifyIdToken: async (_token: string) => ({
      uid: "test-user-123",
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
              data: () => ({ uid: "test-user-123", orgId: "org-test", role: "manager" }),
            },
          ],
        };
      },
    }),
  }),
}));
// Also mock 'firebase-admin' default import to ensure code using either import pattern is covered
vi.mock("firebase-admin", () => ({
  getAuth: () => ({
    verifySessionCookie: async (_cookie: string) => ({
      uid: "test-user-123",
      email: "test@example.com",
      email_verified: true,
      customClaims: {},
    }),
    verifyIdToken: async (_token: string) => ({
      uid: "test-user-123",
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
              data: () => ({ uid: "test-user-123", orgId: "org-test", role: "manager" }),
            },
          ],
        };
      },
    }),
  }),
}));
import { createMockRequest, createMockOrgContext } from "@fresh-schedules/api-framework/testing";
import { POST, processBatchItems } from "../route";

describe("POST /api/batch", () => {
  function unwrapData(wrapped: any) {
    if (!wrapped) return undefined;
    if (wrapped.data && typeof wrapped.data.totalItems === "number") return wrapped.data;
    if (wrapped.data && wrapped.data.body && typeof wrapped.data.body.totalItems === "number")
      return wrapped.data.body;
    return undefined;
  }

  it("should process items and return results", async () => {
    const items = [
      { id: "1", payload: { a: 1 } },
      { id: "2", payload: { a: 2 } },
    ];
    const ctx = createMockOrgContext();
    // Provide session cookie and orgId to satisfy auth & org checks for createOrgEndpoint
    const requestForProcess = createMockRequest("/api/batch", {
      method: "POST",
      body: { items },
      cookies: { session: "mock-session" },
      searchParams: { orgId: "org-test" },
    });
    const requestForPost = createMockRequest("/api/batch", {
      method: "POST",
      body: { items },
      cookies: { session: "mock-session" },
      headers: { cookie: "session=mock-session", authorization: "Bearer mock-token" },
      searchParams: { orgId: "org-test" },
    });

    const result = await processBatchItems(items, ctx as any, requestForProcess as any);
    expect(result).toBeDefined();
    expect(result.totalItems).toBe(2);
    expect(result.successCount).toBe(2);
    expect(result.failureCount).toBe(0);

    const response = await POST(requestForPost as any, {
      params: Promise.resolve({}) as Promise<Record<string, string>>,
    });
    const wrapped = await response.json();
    const batch = unwrapData(wrapped);
    expect(batch).toBeDefined();
    expect(batch.totalItems).toBe(2);
    expect(wrapped.meta.requestId).toBeDefined();
  });

  it("should reject batch exceeding max size", async () => {
    const items = Array.from({ length: 201 }).map((_, i) => ({ id: String(i), payload: {} }));
    const ctx = createMockOrgContext();
    await expect(
      processBatchItems(
        items,
        ctx as any,
        createMockRequest("/api/batch", { method: "POST", body: { items } }) as any,
      ),
    ).rejects.toThrow(/exceeds maximum/);
  });

  it("continueOnError: true should partially succeed when item fails", async () => {
    const items = [
      { id: "1", payload: { a: 1 } },
      { id: "2", payload: { fail: true } },
      { id: "3", payload: { a: 3 } },
    ];
    const request = createMockRequest("/api/batch", {
      method: "POST",
      body: { items, continueOnError: true },
      cookies: { session: "mock-session" },
      headers: { cookie: "session=mock-session", authorization: "Bearer mock-token" },
      searchParams: { orgId: "org-test" },
    });
    const response = await POST(request as any, {
      params: Promise.resolve({}) as Promise<Record<string, string>>,
    });
    const wrapped = await response.json();
    const batch2 = unwrapData(wrapped);
    expect(batch2.successCount).toBe(2);
    expect(batch2.failureCount).toBe(1);
  });

  it("continueOnError: false should stop on first error", async () => {
    const items = [
      { id: "1", payload: { a: 1 } },
      { id: "2", payload: { fail: true } },
      { id: "3", payload: { a: 3 } },
    ];
    const request = createMockRequest("/api/batch", {
      method: "POST",
      body: { items, continueOnError: false },
      cookies: { session: "mock-session" },
      headers: { cookie: "session=mock-session", authorization: "Bearer mock-token" },
      searchParams: { orgId: "org-test" },
    });
    const response = await POST(request as any, {
      params: Promise.resolve({}) as Promise<Record<string, string>>,
    });
    const wrapped = await response.json();
    const batch3 = unwrapData(wrapped);
    expect(batch3.successCount).toBeLessThan(3);
    expect(batch3.failureCount).toBeGreaterThanOrEqual(1);
  });

  it("should timeout a slow item when per-item timeout is exceeded", async () => {
    const items = [
      { id: "1", payload: { a: 1 } },
      { id: "2", payload: { delay: 200 } },
    ];
    const ctx = createMockOrgContext();
    const requestForProcess = createMockRequest("/api/batch", { method: "POST", body: { items } });
    const requestForPost = createMockRequest("/api/batch", {
      method: "POST",
      body: { items },
      cookies: { session: "mock-session" },
      headers: { cookie: "session=mock-session", authorization: "Bearer mock-token" },
      searchParams: { orgId: "org-test" },
    });

    // Use a low per-item timeout to force timeout behavior during the test
    const result = await processBatchItems(items, ctx as any, requestForProcess as any, {
      timeoutPerItem: 50,
    });
    expect(result.totalItems).toBe(2);
    expect(result.results[1].success).toBe(false);
    expect(result.results[1].error?.message).toContain("timed out");

    const response = await POST(requestForPost as any, {
      params: Promise.resolve({}) as Promise<Record<string, string>>,
    });
    const wrapped = await response.json();
    const batch4 = unwrapData(wrapped);
    if (!batch4) console.log("wrapped timeout test:", wrapped);
    expect(batch4.totalItems).toBe(2);
  });
});
