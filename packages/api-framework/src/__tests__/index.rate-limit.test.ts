// [P1][API][TEST] Endpoint Rate Limiting Wiring
// Tags: P1, API, TEST, RATE-LIMITING, REDIS

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

describe("api-framework createEndpoint rate limiting", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("uses Redis-backed checkRateLimit when USE_REDIS_RATE_LIMIT=true", async () => {
    process.env.USE_REDIS_RATE_LIMIT = "true";

    const checkRateLimitMock = vi.fn(async () => {
      return { allowed: true, remaining: 1, resetAt: Date.now() + 60_000 };
    });

    vi.doMock("../redis", async (importOriginal) => {
      const actual = await importOriginal<typeof import("../redis")>();
      return {
        ...actual,
        checkRateLimit: checkRateLimitMock,
      };
    });

    const { createPublicEndpoint } = await import("../index");

    const endpoint = createPublicEndpoint({
      rateLimit: { maxRequests: 5, windowMs: 60_000 },
      handler: async () => ({ ok: true }),
    });

    const request = new NextRequest("http://example.com/api/test", {
      method: "GET",
      headers: {
        "x-forwarded-for": "203.0.113.10",
      },
    });

    const response = await endpoint(request, { params: Promise.resolve({}) });

    expect(response.status).toBe(200);
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1);
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      "203.0.113.10",
      expect.objectContaining({ max: 5, windowSeconds: 60 }),
    );
  });

  it("does not call Redis-backed checkRateLimit when USE_REDIS_RATE_LIMIT is unset/false", async () => {
    delete process.env.USE_REDIS_RATE_LIMIT;

    const checkRateLimitMock = vi.fn(async () => {
      return { allowed: true, remaining: 1, resetAt: Date.now() + 60_000 };
    });

    vi.doMock("../redis", async (importOriginal) => {
      const actual = await importOriginal<typeof import("../redis")>();
      return {
        ...actual,
        checkRateLimit: checkRateLimitMock,
      };
    });

    const { createPublicEndpoint } = await import("../index");

    const endpoint = createPublicEndpoint({
      rateLimit: { maxRequests: 100, windowMs: 60_000 },
      handler: async () => ({ ok: true }),
    });

    const request = new NextRequest("http://example.com/api/test", {
      method: "GET",
      headers: {
        "x-forwarded-for": "203.0.113.10",
      },
    });

    const response = await endpoint(request, { params: Promise.resolve({}) });

    expect(response.status).toBe(200);
    expect(checkRateLimitMock).not.toHaveBeenCalled();
  });
});
