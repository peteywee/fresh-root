// [P1][API][TEST] Redis Client Tests
// Tags: P1, API, TEST, REDIS, RATE-LIMITING, IDEMPOTENCY

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// =============================================================================
// IN-MEMORY REDIS TESTS (Unit tests, no external dependencies)
// =============================================================================

describe("InMemoryRedis", () => {
  // We need to access the InMemoryRedis class for testing
  // Since it's not exported, we'll test through the exported getRedisClient
  // when no external Redis is configured

  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
    // Clear Redis env vars to force in-memory fallback
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.REDIS_URL;
    // Reset module cache to get fresh client
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("incr/expire/ttl (rate limiting)", () => {
    it("should increment counter and return count", async () => {
      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      const count1 = await client.incr("test:counter");
      expect(count1).toBe(1);

      const count2 = await client.incr("test:counter");
      expect(count2).toBe(2);

      const count3 = await client.incr("test:counter");
      expect(count3).toBe(3);
    });

    it("should reset counter after TTL expires", async () => {
      vi.useFakeTimers();

      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      await client.incr("test:expiry");
      await client.expire("test:expiry", 10); // 10 seconds

      // Advance time by 15 seconds
      vi.advanceTimersByTime(15 * 1000);

      // Counter should reset
      const count = await client.incr("test:expiry");
      expect(count).toBe(1);

      vi.useRealTimers();
    });

    it("should return correct TTL", async () => {
      vi.useFakeTimers();

      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      await client.incr("test:ttl");
      await client.expire("test:ttl", 60);

      const ttl = await client.ttl("test:ttl");
      expect(ttl).toBeLessThanOrEqual(60);
      expect(ttl).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it("should return -2 for non-existent keys", async () => {
      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      const ttl = await client.ttl("nonexistent:key");
      expect(ttl).toBe(-2);
    });
  });

  describe("get/set/del (idempotency)", () => {
    it("should set and get string values", async () => {
      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      await client.set("test:string", "hello world");
      const value = await client.get("test:string");
      expect(value).toBe("hello world");
    });

    it("should return null for non-existent keys", async () => {
      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      const value = await client.get("nonexistent:string");
      expect(value).toBeNull();
    });

    it("should delete keys", async () => {
      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      await client.set("test:delete", "to be deleted");
      expect(await client.get("test:delete")).toBe("to be deleted");

      await client.del("test:delete");
      expect(await client.get("test:delete")).toBeNull();
    });

    it("should expire string values after TTL", async () => {
      vi.useFakeTimers();

      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      await client.set("test:expiring", "temporary", { ex: 10 });
      expect(await client.get("test:expiring")).toBe("temporary");

      // Advance time by 15 seconds
      vi.advanceTimersByTime(15 * 1000);

      expect(await client.get("test:expiring")).toBeNull();

      vi.useRealTimers();
    });

    it("should store JSON serializable objects", async () => {
      const { getRedisClient } = await import("../redis");
      const client = await getRedisClient();

      const record = {
        response: {
          status: 200,
          body: { id: "123", name: "Test" },
          headers: { "content-type": "application/json" },
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      await client.set("idem:test-key", JSON.stringify(record));
      const cached = await client.get("idem:test-key");
      expect(cached).not.toBeNull();

      const parsed = JSON.parse(cached!);
      expect(parsed.response.status).toBe(200);
      expect(parsed.response.body.id).toBe("123");
    });
  });
});

// =============================================================================
// RATE LIMITER INTEGRATION TESTS
// =============================================================================

describe("Rate Limiter with Redis", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.REDIS_URL;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should enforce rate limits using checkRateLimit", async () => {
    const { checkRateLimit } = await import("../redis");

    const clientId = `test-client-${Date.now()}`;
    const config = { max: 3, windowSeconds: 60 };

    // First 3 requests should succeed
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit(clientId, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2 - i);
    }

    // 4th request should be rate limited
    const result = await checkRateLimit(clientId, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should track rate limits separately per client", async () => {
    const { checkRateLimit } = await import("../redis");

    const config = { max: 2, windowSeconds: 60 };
    const clientA = `client-a-${Date.now()}`;
    const clientB = `client-b-${Date.now()}`;

    // Client A makes requests
    await checkRateLimit(clientA, config);
    await checkRateLimit(clientA, config);
    const resultA = await checkRateLimit(clientA, config);
    expect(resultA.allowed).toBe(false);

    // Client B should still have full quota
    const resultB = await checkRateLimit(clientB, config);
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(1);
  });
});

// =============================================================================
// UPSTASH CLIENT TESTS (Mocked)
// =============================================================================

describe("UpstashClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should use Upstash when configured", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 1 }),
    });
    global.fetch = mockFetch;

    // Set Upstash env vars
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const { getRedisClient } = await import("../redis");
    const client = await getRedisClient();

    await client.incr("test:upstash");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.upstash.io",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
        body: JSON.stringify(["INCR", "test:upstash"]),
      }),
    );

    // Cleanup
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("should handle Upstash errors gracefully", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    global.fetch = mockFetch;

    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const { getRedisClient } = await import("../redis");
    const client = await getRedisClient();

    await expect(client.incr("test:error")).rejects.toThrow("Upstash request failed: 500");

    // Cleanup
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });
});
