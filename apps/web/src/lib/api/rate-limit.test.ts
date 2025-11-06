//[P1][API][TEST] Rate limiting middleware unit tests
// Tags: test, rate-limiting, security, vitest

import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RateLimits } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Rate limiter uses in-memory storage, so tests are isolated
  });

  it("should allow requests within limit", async () => {
    const handler = rateLimit({ max: 3, windowSeconds: 60 })(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.1" },
    });

    // First request should succeed
    const response1 = await handler(request, { params: {} });
    expect(response1.status).toBe(200);
    expect(response1.headers.get("X-RateLimit-Remaining")).toBe("2");

    // Second request should succeed
    const response2 = await handler(request, { params: {} });
    expect(response2.status).toBe(200);
    expect(response2.headers.get("X-RateLimit-Remaining")).toBe("1");

    // Third request should succeed
    const response3 = await handler(request, { params: {} });
    expect(response3.status).toBe(200);
    expect(response3.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("should rate limit after exceeding max requests", async () => {
    const handler = rateLimit({ max: 2, windowSeconds: 60 })(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.2" },
    });

    // First two requests succeed
    await handler(request, { params: {} });
    await handler(request, { params: {} });

    // Third request should be rate limited
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.error).toContain("Rate limit exceeded");
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });

  it("should use different limits for different IPs", async () => {
    const handler = rateLimit({ max: 2, windowSeconds: 60 })(async () => {
      return NextResponse.json({ success: true });
    });

    const request1 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.3" },
    });

    const request2 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.4" },
    });

    // Use up IP1's limit
    await handler(request1, { params: {} });
    await handler(request1, { params: {} });

    // IP1 should be rate limited
    const response1 = await handler(request1, { params: {} });
    expect(response1.status).toBe(429);

    // IP2 should still be allowed
    const response2 = await handler(request2, { params: {} });
    expect(response2.status).toBe(200);
  });

  it("should include user ID in rate limit key when authenticated", async () => {
    const handler = rateLimit({ max: 2, windowSeconds: 60 })(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      headers: {
        "x-forwarded-for": "192.168.1.5",
        "x-user-id": "user123",
      },
    });

    // Use up limit
    await handler(request, { params: {} });
    await handler(request, { params: {} });

    // Should be rate limited
    const response = await handler(request, { params: {} });
    expect(response.status).toBe(429);
  });

  it("should use custom key generator", async () => {
    const handler = rateLimit({
      max: 2,
      windowSeconds: 60,
      keyGenerator: () => "custom-key",
    })(async () => {
      return NextResponse.json({ success: true });
    });

    const request1 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.6" },
    });

    const request2 = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "192.168.1.7" },
    });

    // Both requests use same key, so they share the limit
    await handler(request1, { params: {} });
    await handler(request2, { params: {} });

    // Third request from either IP should be rate limited
    const response = await handler(request1, { params: {} });
    expect(response.status).toBe(429);
  });

  describe("RateLimits presets", () => {
    it("should have STRICT preset", () => {
      expect(RateLimits.STRICT).toEqual({ max: 10, windowSeconds: 60 });
    });

    it("should have STANDARD preset", () => {
      expect(RateLimits.STANDARD).toEqual({ max: 100, windowSeconds: 60 });
    });

    it("should have AUTH preset", () => {
      expect(RateLimits.AUTH).toEqual({ max: 5, windowSeconds: 60 });
    });

    it("should have WRITE preset", () => {
      expect(RateLimits.WRITE).toEqual({ max: 30, windowSeconds: 60 });
    });
  });
});
