// [P1][API][TEST] SDK Enhancements Tests
// Tags: P1, API, TEST, MIDDLEWARE, BATCH, WEBHOOK, IDEMPOTENCY

import { NextRequest, NextResponse } from "next/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  executeMiddlewareChain,
  createBatchHandler,
  extractPaginationParams,
  createPaginatedResponse,
  verifyWebhook,
  createWebhookEndpoint,
  getIdempotencyKey,
  getIdempotentResponse,
  storeIdempotentResponse,
  withIdempotency,
  type Middleware,
  type ExtendedRequestContext,
  type BatchEndpointConfig,
  type WebhookConfig,
  type IdempotencyConfig,
} from "../enhancements";
import type { RequestContext } from "../index";

// =============================================================================
// TEST HELPERS
// =============================================================================

function createMockRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {},
): NextRequest {
  const { method = "GET", headers = {}, body } = options;

  return {
    method,
    url: `http://localhost${url}`,
    headers: new Headers(headers),
    json: async () => body,
    text: async () => JSON.stringify(body),
    clone: () => createMockRequest(url, options),
  } as unknown as NextRequest;
}

function createMockContext(overrides: Partial<RequestContext> = {}): ExtendedRequestContext {
  return {
    auth: {
      userId: "user-123",
      email: "test@example.com",
      emailVerified: true,
      customClaims: {},
    },
    org: {
      orgId: "org-456",
      role: "admin",
      membershipId: "member-789",
    },
    requestId: "req-abc",
    timestamp: Date.now(),
    custom: {},
    ...overrides,
  };
}

// =============================================================================
// ENHANCEMENT 1: MIDDLEWARE CHAIN TESTS
// =============================================================================

describe("Middleware Chain", () => {
  it("should execute middleware in order", async () => {
    const order: number[] = [];

    const middleware1: Middleware = async ({ next }) => {
      order.push(1);
      return next();
    };

    const middleware2: Middleware = async ({ next }) => {
      order.push(2);
      return next();
    };

    const middleware3: Middleware = async ({ next }) => {
      order.push(3);
      return next();
    };

    const request = createMockRequest("/test");
    const context = createMockContext();

    await executeMiddlewareChain(
      [middleware1, middleware2, middleware3],
      { request, input: {}, context, params: {} },
      async () => {
        order.push(4);
        return NextResponse.json({ done: true });
      },
    );

    expect(order).toEqual([1, 2, 3, 4]);
  });

  it("should allow early return from middleware", async () => {
    const middleware1: Middleware = async ({ next }) => {
      return NextResponse.json({ blocked: true }, { status: 403 });
    };

    const middleware2: Middleware = async ({ next }) => {
      // Should never be called
      return next();
    };

    const request = createMockRequest("/test");
    const context = createMockContext();

    const response = await executeMiddlewareChain(
      [middleware1, middleware2],
      { request, input: {}, context, params: {} },
      async () => NextResponse.json({ done: true }),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.blocked).toBe(true);
  });

  it("should pass context modifications through chain", async () => {
    const middleware1: Middleware = async ({ context, next }) => {
      context.custom.step1 = true;
      return next();
    };

    const middleware2: Middleware = async ({ context, next }) => {
      context.custom.step2 = context.custom.step1 ? "after-step1" : "no-step1";
      return next();
    };

    const request = createMockRequest("/test");
    const context = createMockContext();

    await executeMiddlewareChain(
      [middleware1, middleware2],
      { request, input: {}, context, params: {} },
      async () => {
        expect(context.custom.step1).toBe(true);
        expect(context.custom.step2).toBe("after-step1");
        return NextResponse.json({ done: true });
      },
    );
  });

  it("should handle empty middleware array", async () => {
    const request = createMockRequest("/test");
    const context = createMockContext();

    const response = await executeMiddlewareChain(
      [],
      { request, input: {}, context, params: {} },
      async () => NextResponse.json({ final: true }),
    );

    const body = await response.json();
    expect(body.final).toBe(true);
  });
});

// =============================================================================
// ENHANCEMENT 2: BATCH OPERATION TESTS
// =============================================================================

describe("Batch Operations", () => {
  it("should process all items successfully", async () => {
    const handler = createBatchHandler({
      maxBatchSize: 10,
      timeoutPerItem: 1000,
      itemHandler: async ({ item }) => ({ processed: item }),
    });

    const items = [1, 2, 3, 4, 5];
    const context = createMockContext();
    const request = createMockRequest("/batch");

    const result = await handler(items, context, request);

    expect(result.totalItems).toBe(5);
    expect(result.successCount).toBe(5);
    expect(result.failureCount).toBe(0);
    expect(result.partialSuccess).toBe(false);
    expect(result.results.every((r) => r.success)).toBe(true);
  });

  it("should handle partial failures with continueOnError", async () => {
    const handler = createBatchHandler({
      maxBatchSize: 10,
      timeoutPerItem: 1000,
      continueOnError: true,
      itemHandler: async ({ item, index }) => {
        if (index === 2) throw new Error("Item 2 failed");
        return { processed: item };
      },
    });

    const items = [1, 2, 3, 4, 5];
    const context = createMockContext();
    const request = createMockRequest("/batch");

    const result = await handler(items, context, request);

    expect(result.totalItems).toBe(5);
    expect(result.successCount).toBe(4);
    expect(result.failureCount).toBe(1);
    expect(result.partialSuccess).toBe(true);
    expect(result.results[2].success).toBe(false);
    expect(result.results[2].error?.message).toBe("Item 2 failed");
  });

  it("should stop on error when continueOnError is false", async () => {
    const handler = createBatchHandler({
      maxBatchSize: 10,
      timeoutPerItem: 1000,
      continueOnError: false,
      itemHandler: async ({ index }) => {
        if (index === 2) throw new Error("Item 2 failed");
        return { processed: true };
      },
    });

    const items = [1, 2, 3, 4, 5];
    const context = createMockContext();
    const request = createMockRequest("/batch");

    const result = await handler(items, context, request);

    expect(result.successCount).toBe(2); // Only 0 and 1
    expect(result.failureCount).toBe(3); // 2 failed, 3 and 4 skipped
    expect(result.results[2].error?.code).toBe("ITEM_FAILED");
    expect(result.results[3].error?.code).toBe("SKIPPED");
    expect(result.results[4].error?.code).toBe("SKIPPED");
  });

  it("should reject batch exceeding max size", async () => {
    const handler = createBatchHandler({
      maxBatchSize: 3,
      itemHandler: async ({ item }) => ({ processed: item }),
    });

    const items = [1, 2, 3, 4, 5];
    const context = createMockContext();
    const request = createMockRequest("/batch");

    await expect(handler(items, context, request)).rejects.toThrow(
      "Batch size 5 exceeds maximum 3",
    );
  });

  it("should handle empty batch", async () => {
    const handler = createBatchHandler({
      maxBatchSize: 10,
      itemHandler: async ({ item }) => ({ processed: item }),
    });

    const items: number[] = [];
    const context = createMockContext();
    const request = createMockRequest("/batch");

    const result = await handler(items, context, request);

    expect(result.totalItems).toBe(0);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(0);
  });

  it("should timeout slow items", async () => {
    const handler = createBatchHandler({
      maxBatchSize: 10,
      timeoutPerItem: 50, // 50ms timeout
      itemHandler: async ({ index }) => {
        if (index === 1) {
          await new Promise((r) => setTimeout(r, 200)); // 200ms delay
        }
        return { done: true };
      },
    });

    const items = [1, 2, 3];
    const context = createMockContext();
    const request = createMockRequest("/batch");

    const result = await handler(items, context, request);

    expect(result.results[1].success).toBe(false);
    expect(result.results[1].error?.message).toContain("timed out");
  });
});

// =============================================================================
// ENHANCEMENT 3: PAGINATION TESTS
// =============================================================================

describe("Pagination", () => {
  it("should extract pagination params from request", () => {
    const request = createMockRequest("/items?page=3&pageSize=25");
    const config = { paginate: true, pageSize: 50, maxPageSize: 100 };

    const params = extractPaginationParams(request, config);

    expect(params.page).toBe(3);
    expect(params.pageSize).toBe(25);
    expect(params.offset).toBe(50); // (3-1) * 25
  });

  it("should use defaults when no params provided", () => {
    const request = createMockRequest("/items");
    const config = { paginate: true, pageSize: 50, maxPageSize: 100 };

    const params = extractPaginationParams(request, config);

    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(50);
    expect(params.offset).toBe(0);
  });

  it("should cap pageSize at maxPageSize", () => {
    const request = createMockRequest("/items?pageSize=500");
    const config = { paginate: true, pageSize: 50, maxPageSize: 100 };

    const params = extractPaginationParams(request, config);

    expect(params.pageSize).toBe(100);
  });

  it("should enforce minimum page of 1", () => {
    const request = createMockRequest("/items?page=0");
    const config = { paginate: true, pageSize: 50, maxPageSize: 100 };

    const params = extractPaginationParams(request, config);

    expect(params.page).toBe(1);
  });

  it("should create paginated response with correct metadata", () => {
    const data = [1, 2, 3, 4, 5];
    const totalItems = 42;
    const paginationParams = { page: 2, pageSize: 5 };

    const response = createPaginatedResponse(
      data,
      totalItems,
      paginationParams,
      "req-123",
      50,
    );

    expect(response.data).toEqual(data);
    expect(response.pagination.page).toBe(2);
    expect(response.pagination.pageSize).toBe(5);
    expect(response.pagination.totalItems).toBe(42);
    expect(response.pagination.totalPages).toBe(9); // ceil(42/5)
    expect(response.pagination.hasNextPage).toBe(true);
    expect(response.pagination.hasPrevPage).toBe(true);
    expect(response.meta.requestId).toBe("req-123");
    expect(response.meta.durationMs).toBe(50);
  });

  it("should indicate no next page on last page", () => {
    const data = [41, 42];
    const totalItems = 42;
    const paginationParams = { page: 9, pageSize: 5 };

    const response = createPaginatedResponse(
      data,
      totalItems,
      paginationParams,
      "req-123",
      50,
    );

    expect(response.pagination.hasNextPage).toBe(false);
    expect(response.pagination.hasPrevPage).toBe(true);
  });

  it("should indicate no prev page on first page", () => {
    const data = [1, 2, 3, 4, 5];
    const totalItems = 42;
    const paginationParams = { page: 1, pageSize: 5 };

    const response = createPaginatedResponse(
      data,
      totalItems,
      paginationParams,
      "req-123",
      50,
    );

    expect(response.pagination.hasNextPage).toBe(true);
    expect(response.pagination.hasPrevPage).toBe(false);
  });
});

// =============================================================================
// ENHANCEMENT 4: WEBHOOK SECURITY TESTS
// =============================================================================

describe("Webhook Security", () => {
  const SECRET = "test-webhook-secret-key";

  async function computeTestSignature(payload: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  it("should verify valid webhook signature", async () => {
    const event = {
      id: "evt-unique-123",
      type: "shift.created",
      timestamp: Date.now(),
      payload: { shiftId: "shift-456" },
    };

    const body = JSON.stringify(event);
    const signature = await computeTestSignature(body);

    const request = createMockRequest("/webhook", {
      method: "POST",
      headers: {
        "x-webhook-signature": signature,
        "x-webhook-timestamp": String(event.timestamp),
      },
      body: event,
    });

    const config: WebhookConfig = {
      secret: SECRET,
      allowedEvents: ["shift.created"],
    };

    const result = await verifyWebhook(request, config);

    expect(result.valid).toBe(true);
    expect(result.event?.type).toBe("shift.created");
    expect(result.event?.payload).toEqual({ shiftId: "shift-456" });
  });

  it("should reject missing signature", async () => {
    const request = createMockRequest("/webhook", {
      method: "POST",
      headers: {},
      body: { id: "evt-1", type: "test", timestamp: Date.now(), payload: {} },
    });

    const config: WebhookConfig = { secret: SECRET };
    const result = await verifyWebhook(request, config);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Missing signature header");
  });

  it("should reject invalid signature", async () => {
    const event = {
      id: "evt-2",
      type: "test",
      timestamp: Date.now(),
      payload: {},
    };

    const request = createMockRequest("/webhook", {
      method: "POST",
      headers: {
        "x-webhook-signature": "invalid-signature",
      },
      body: event,
    });

    const config: WebhookConfig = { secret: SECRET };
    const result = await verifyWebhook(request, config);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid signature");
  });

  it("should reject disallowed event types", async () => {
    const event = {
      id: "evt-3",
      type: "user.deleted", // Not in allowed list
      timestamp: Date.now(),
      payload: {},
    };

    const body = JSON.stringify(event);
    const signature = await computeTestSignature(body);

    const request = createMockRequest("/webhook", {
      method: "POST",
      headers: {
        "x-webhook-signature": signature,
      },
      body: event,
    });

    const config: WebhookConfig = {
      secret: SECRET,
      allowedEvents: ["shift.created", "shift.updated"],
    };

    const result = await verifyWebhook(request, config);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Event type not allowed");
  });

  it("should reject old webhooks (replay protection)", async () => {
    const event = {
      id: "evt-4",
      type: "test",
      timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
      payload: {},
    };

    const body = JSON.stringify(event);
    const signature = await computeTestSignature(body);

    const request = createMockRequest("/webhook", {
      method: "POST",
      headers: {
        "x-webhook-signature": signature,
        "x-webhook-timestamp": String(event.timestamp),
      },
      body: event,
    });

    const config: WebhookConfig = {
      secret: SECRET,
      maxAge: 5 * 60 * 1000, // 5 minutes
    };

    const result = await verifyWebhook(request, config);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("too old");
  });
});

// =============================================================================
// ENHANCEMENT 5: IDEMPOTENCY TESTS
// =============================================================================

describe("Idempotency", () => {
  beforeEach(() => {
    // Clear idempotency store between tests
    // (The store is module-scoped, so we need to ensure clean state)
  });

  it("should extract idempotency key from header", () => {
    const request = createMockRequest("/create", {
      method: "POST",
      headers: { "x-idempotency-key": "idem-key-123" },
    });
    const context = createMockContext();
    const config: IdempotencyConfig = {};

    const key = getIdempotencyKey(request, context, config);

    expect(key).toBe("idem-key-123");
  });

  it("should use custom header name", () => {
    const request = createMockRequest("/create", {
      method: "POST",
      headers: { "my-custom-key": "custom-123" },
    });
    const context = createMockContext();
    const config: IdempotencyConfig = { headerName: "my-custom-key" };

    const key = getIdempotencyKey(request, context, config);

    expect(key).toBe("custom-123");
  });

  it("should use key generator when header not provided", () => {
    const request = createMockRequest("/create", { method: "POST" });
    const context = createMockContext();
    const config: IdempotencyConfig = {
      generateKey: (req, ctx) => `${ctx.auth?.userId}-${Date.now()}`,
    };

    const key = getIdempotencyKey(request, context, config);

    expect(key).toContain("user-123");
  });

  it("should return null when no key available", () => {
    const request = createMockRequest("/create", { method: "POST" });
    const context = createMockContext();
    const config: IdempotencyConfig = {};

    const key = getIdempotencyKey(request, context, config);

    expect(key).toBeNull();
  });

  it("should store and retrieve idempotent response", async () => {
    const key = `test-key-${Date.now()}`;
    const response = NextResponse.json({ created: true }, { status: 201 });

    storeIdempotentResponse(key, response, 60000); // 1 minute TTL

    // Wait a moment for async storage
    await new Promise((r) => setTimeout(r, 10));

    const cached = getIdempotentResponse(key);

    expect(cached).not.toBeNull();
    expect(cached?.status).toBe(201);

    const body = await cached?.json();
    expect(body.created).toBe(true);
  });

  it("should add replayed header to cached response", async () => {
    const key = `replay-key-${Date.now()}`;
    const response = NextResponse.json({ data: "original" }, { status: 200 });

    storeIdempotentResponse(key, response, 60000);

    // Wait a moment for async storage
    await new Promise((r) => setTimeout(r, 10));

    const cached = getIdempotentResponse(key);

    expect(cached?.headers.get("x-idempotent-replayed")).toBe("true");
  });

  it("withIdempotency should require key when required=true", async () => {
    const request = createMockRequest("/create", { method: "POST" });
    const context = createMockContext();

    const handler = withIdempotency<{ success: boolean }>(
      { required: true },
      async () => NextResponse.json({ success: true }),
    );

    const response = await handler(request, context);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.message).toContain("Idempotency key required");
  });

  it("withIdempotency should execute handler when no cached response", async () => {
    const uniqueKey = `fresh-key-${Date.now()}-${Math.random()}`;
    const request = createMockRequest("/create", {
      method: "POST",
      headers: { "x-idempotency-key": uniqueKey },
    });
    const context = createMockContext();

    let handlerCalled = false;

    const handler = withIdempotency<{ success: boolean }>(
      {},
      async () => {
        handlerCalled = true;
        return NextResponse.json({ success: true });
      },
    );

    await handler(request, context);

    expect(handlerCalled).toBe(true);
  });
});
