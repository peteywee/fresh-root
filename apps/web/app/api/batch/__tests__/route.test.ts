// [P1][TEST][INTEGRATION] /api/batch route tests
// Tags: P1, TEST, INTEGRATION, BATCH

import { describe, it, expect } from "vitest";
import { createMockRequest, createMockOrgContext } from "@fresh-schedules/api-framework/testing";
import { POST, processBatchItems } from "../route";

describe("POST /api/batch", () => {
  function unwrapData(wrapped: any) {
    if (!wrapped) return undefined;
    if (wrapped.data && typeof wrapped.data.totalItems === "number") return wrapped.data;
    if (wrapped.data && wrapped.data.body && typeof wrapped.data.body.totalItems === "number") return wrapped.data.body;
    return undefined;
  }
  it("should process items and return results", async () => {
    const requestForProcess = createMockRequest("/api/batch", {
      method: "POST",
      body: { items: [{ id: "1", payload: { a: 1 } }, { id: "2", payload: { a: 2 } }] },
    });
    const requestForPost = createMockRequest("/api/batch", {
      method: "POST",
      body: { items: [{ id: "1", payload: { a: 1 } }, { id: "2", payload: { a: 2 } }] },
    });

    const ctx = createMockOrgContext();
    const result = await processBatchItems([{ id: "1", payload: { a: 1 } }, { id: "2", payload: { a: 2 } }], ctx as any, requestForProcess as any);
    const body = result;
    // debug log for test failure investigation
    // eslint-disable-next-line no-console
    console.log('BATCH ROUTE RESPONSE:', JSON.stringify(body));

    expect(body).toBeDefined();
    expect(body.totalItems).toBe(2);
    expect(body.successCount).toBe(2);
    expect(body.failureCount).toBe(0);
    expect(body.results.length).toBe(2);
    // Ensure endpoint wrapper returns the same via createEndpoint
    const response = await POST(requestForPost as any, { params: Promise.resolve({}) as Promise<Record<string, string>> });
    // inspect raw response
    // eslint-disable-next-line no-console
    console.log('RESPONSE STATUS', response.status);
    const text = await response.text();
    // eslint-disable-next-line no-console
    console.log('RESPONSE TEXT', text);
    const wrapped = JSON.parse(text);
    // debug
    // eslint-disable-next-line no-console
    console.log('BATCH WRAPPED RESPONSE', JSON.stringify(wrapped));
    expect(wrapped).toBeDefined();
    expect(wrapped.data).toBeDefined();
    const batch = unwrapData(wrapped);
    expect(batch).toBeDefined();
    expect(batch.totalItems).toBe(2);
    expect(wrapped.meta.requestId).toBeDefined();
  });

  it("should reject batch exceeding max size", async () => {
    const items = Array.from({ length: 201 }).map((_, i) => ({ id: String(i), payload: {} }));
    const ctx = createMockOrgContext();
    // Use helper directly to assert the low-level error thrown
    await expect(processBatchItems(items, ctx as any, createMockRequest("/api/batch", { method: "POST", body: { items } }) as any)).rejects.toThrow(
      /exceeds maximum/,
    );
  });

  it("continueOnError: true should partially succeed when item fails", async () => {
    const items = [
      { id: "1", payload: { a: 1 } },
      { id: "2", payload: { fail: true } },
      { id: "3", payload: { a: 3 } },
    ];
    const request = createMockRequest("/api/batch", { method: "POST", body: { items, continueOnError: true } });
    const response = await POST(request as any, { params: Promise.resolve({}) as Promise<Record<string, string>> });
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
    const request = createMockRequest("/api/batch", { method: "POST", body: { items, continueOnError: false } });
    const response = await POST(request as any, { params: Promise.resolve({}) as Promise<Record<string, string>> });
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
<<<<<<< HEAD
    // To force timeout, set lower per-item timeout, patch processBatchItems config call? For now just check slow processing returns a success or failure depending on set timeouts
    const requestForProcess = createMockRequest("/api/batch", { method: "POST", body: { items } });
    const requestForPost = createMockRequest("/api/batch", { method: "POST", body: { items } });
    await expect(processBatchItems(items, ctx as any, requestForProcess as any)).rejects.toThrow(/
      /exceeds maximum/,
    );
=======
    // To force timeout, set lower per-item timeout in the handler (createBatchHandler default is 5000ms here).
    const ctx = createMockOrgContext();
    const requestForProcess = createMockRequest("/api/batch", { method: "POST", body: { items } });
    const requestForPost = createMockRequest("/api/batch", { method: "POST", body: { items } });

    // Call the helper directly — we expect the slow item to time out and the handler to mark it as failed
    const result = await processBatchItems(items, ctx as any, requestForProcess as any);
    expect(result.totalItems).toBe(2);
    // the second item (index 1) should be marked as failure due to timeout
    expect(result.results[1].success).toBe(false);
    expect(result.results[1].error?.message).toContain("timed out");

    // Also assert the endpoint wrapper returns the same shape
    const response = await POST(requestForPost as any, { params: Promise.resolve({}) as Promise<Record<string, string>> });
>>>>>>> 3b100d5 (test(batch): update tests for timeout behavior)
    const wrapped = await response.json();
    const batch4 = unwrapData(wrapped);
    expect(batch4.totalItems).toBe(2);
  });
});
