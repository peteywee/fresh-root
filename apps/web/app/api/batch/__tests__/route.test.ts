// [P1][TEST][INTEGRATION] /api/batch route tests
// Tags: P1, TEST, INTEGRATION, BATCH

import { describe, it, expect } from "vitest";
import { createMockRequest } from "@fresh-schedules/api-framework/testing";
import { POST } from "../route";

describe("POST /api/batch", () => {
  it("should process items and return results", async () => {
    const request = createMockRequest("/api/batch", {
      method: "POST",
      body: { items: [{ id: "1", payload: { a: 1 } }, { id: "2", payload: { a: 2 } }] },
    });

    const response = await POST(request as any, { params: Promise.resolve({}) as Promise<Record<string, string>> });
    const body = await response.json();

    expect(body).toBeDefined();
    expect(body.data.totalItems).toBe(2);
    expect(body.data.successCount).toBe(2);
    expect(body.data.failureCount).toBe(0);
    expect(body.data.results.length).toBe(2);
    expect(body.meta.requestId).toBeDefined();
  });
});
