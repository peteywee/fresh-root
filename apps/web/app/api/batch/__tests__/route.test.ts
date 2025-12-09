// [P1][TEST][INTEGRATION] /api/batch route tests
// Tags: P1, TEST, INTEGRATION, BATCH

import { describe, it, expect } from "vitest";
import { createMockRequest, createMockOrgContext } from "@fresh-schedules/api-framework/testing";
import { POST, processBatchItems } from "../route";

describe("POST /api/batch", () => {
  it("should process items and return results", async () => {
    const request = createMockRequest("/api/batch", {
      method: "POST",
      body: { items: [{ id: "1", payload: { a: 1 } }, { id: "2", payload: { a: 2 } }] },
    });

    const ctx = createMockOrgContext();
    const result = await processBatchItems([{ id: "1", payload: { a: 1 } }, { id: "2", payload: { a: 2 } }], ctx as any, request as any);
    const body = result;
    // debug log for test failure investigation
    // eslint-disable-next-line no-console
    console.log('BATCH ROUTE RESPONSE:', JSON.stringify(body));

    expect(body).toBeDefined();
    expect(body.totalItems).toBe(2);
    expect(body.successCount).toBe(2);
    expect(body.failureCount).toBe(0);
    expect(body.results.length).toBe(2);
  });
});
