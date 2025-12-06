// [P1][TEST][UNIT] Redis Rate Limiter
// Tags: P1, TEST, UNIT

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRateLimiter } from "../../apps/web/src/lib/api/rate-limit";
import type { Redis } from "ioredis";

// Mock ioredis
vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
  })),
}));

// Mock environment
const originalEnv = process.env;

describe("Rate Limiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Factory Function", () => {
    it("should return Redis limiter when REDIS_URL is set", () => {
      process.env.REDIS_URL = "redis://localhost:6379";
      const limiter = getRateLimiter();
      expect(limiter.constructor.name).toBe("RedisRateLimiter");
    });

    it("should return InMemory limiter when REDIS_URL is not set", () => {
      delete process.env.REDIS_URL;
      const limiter = getRateLimiter();
      expect(limiter.constructor.name).toBe("InMemoryRateLimiter");
    });
  });

  describe("Redis Rate Limiter", () => {
    let mockRedis: any;
    let limiter: any;

    beforeEach(() => {
      process.env.REDIS_URL = "redis://localhost:6379";
      limiter = getRateLimiter();
      // Get the Redis instance from the limiter
      mockRedis = (limiter as any).redis;
    });

    it("should allow requests under limit", async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const result = await limiter.checkLimit("test-key", 100, 60);

      expect(result).toEqual({
        allowed: true,
        remaining: 99,
        resetTime: expect.any(Number),
      });
      expect(mockRedis.incr).toHaveBeenCalledWith("test-key");
      expect(mockRedis.expire).toHaveBeenCalledWith("test-key", 60);
    });

    it("should reject requests over limit", async () => {
      mockRedis.incr.mockResolvedValue(101);
      mockRedis.ttl.mockResolvedValue(30);

      const result = await limiter.checkLimit("test-key", 100, 60);

      expect(result).toEqual({
        allowed: false,
        remaining: 0,
        resetTime: expect.any(Number),
      });
      expect(mockRedis.incr).toHaveBeenCalledWith("test-key");
      expect(mockRedis.ttl).toHaveBeenCalledWith("test-key");
    });

    it("should handle Redis errors gracefully", async () => {
      mockRedis.incr.mockRejectedValue(new Error("Redis connection failed"));

      const result = await limiter.checkLimit("test-key", 100, 60);

      expect(result).toEqual({
        allowed: true,
        remaining: 99,
        resetTime: expect.any(Number),
      });
    });
  });

  describe("InMemory Rate Limiter", () => {
    let limiter: any;

    beforeEach(() => {
      delete process.env.REDIS_URL;
      limiter = getRateLimiter();
    });

    it("should track requests in memory", async () => {
      const result1 = await limiter.checkLimit("test-key", 2, 60);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(1);

      const result2 = await limiter.checkLimit("test-key", 2, 60);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(0);

      const result3 = await limiter.checkLimit("test-key", 2, 60);
      expect(result3.allowed).toBe(false);
      expect(result3.remaining).toBe(0);
    });

    it("should reset after window expires", async () => {
      // Mock Date.now to control time
      const now = Date.now();
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 61000); // 61 seconds later

      await limiter.checkLimit("test-key", 1, 60);
      await limiter.checkLimit("test-key", 1, 60); // Should be blocked
      
      const result = await limiter.checkLimit("test-key", 1, 60); // Should be allowed again
      expect(result.allowed).toBe(true);
    });
  });

  describe("Legacy Compatibility", () => {
    it("should maintain legacy key format", async () => {
      delete process.env.REDIS_URL;
      const limiter = getRateLimiter();
      
      // Test that the key format is maintained for backward compatibility
      const result = await limiter.checkLimit("api:/test:user-123", 100, 60);
      expect(result.allowed).toBe(true);
    });
  });
});

type Stored = Record<string, any>;
const store = new Map<string, Stored>();

function makeDocRef(path: string) {
  return {
    id: path.split("/").pop() as string,
    path,
    collection: (name: string) => ({
      doc: (id?: string) => makeDocRef(`${path}/${name}/${id || Math.random().toString(36).slice(2)}`),
    }),
  };
}

function makeDb() {
  return {
    collection: (name: string) => ({
      doc: (id?: string) => makeDocRef(`${name}/${id || Math.random().toString(36).slice(2)}`),
    }),
    batch: () => {
      const ops: { type: string; ref: any; data?: any }[] = [];
      return {
        set: (ref: any, data: any) => ops.push({ type: "set", ref, data }),
        update: (ref: any, data: any) => ops.push({ type: "update", ref, data }),
        delete: (ref: any) => ops.push({ type: "delete", ref }),
        commit: async () => {
          for (const op of ops) {
            if (op.type === "set") {
              store.set(op.ref.path, { ...op.data });
            } else if (op.type === "update") {
              store.set(op.ref.path, { ...(store.get(op.ref.path) || {}), ...op.data });
            } else if (op.type === "delete") {
              store.delete(op.ref.path);
            }
          }
        },
      };
    },
  };
}

const mockConsume = vi.fn();
const mockGetDraft = vi.fn();

vi.mock("../../apps/web/src/lib/onboarding/adminFormDrafts", () => ({
  consumeAdminFormDraft: mockConsume,
  getAdminFormDraft: mockGetDraft,
}));

import { createNetworkWithOrgAndVenue } from "../../apps/web/src/lib/onboarding/createNetworkOrg";

const payload = {
  basics: {
    orgName: "Test Org",
    hasCorporateAboveYou: false,
    segment: "hospitality",
  },
  venue: {
    venueName: "Main Venue",
    timeZone: "America/Chicago",
  },
  formToken: "token-123",
};

describe("createNetworkWithOrgAndVenue", () => {
  beforeEach(() => {
    store.clear();
    mockConsume.mockReset();
    mockGetDraft.mockReset();
  });

  it("creates network, org, venue, membership and consumes draft", async () => {
    mockGetDraft.mockResolvedValue({
      userId: "admin-1",
      form: { data: { legalName: "Legal Name LLC" } },
    });
    mockConsume.mockResolvedValue(undefined);

    const db = makeDb();
    const result = await createNetworkWithOrgAndVenue("admin-1", payload, db as any);

    expect(result.status).toBe("pending_verification");
    expect(mockConsume).toHaveBeenCalledWith({ formToken: "token-123", expectedUserId: "admin-1" });

    const networkPath = Array.from(store.keys()).find((k) => k.startsWith("networks/"));
    expect(networkPath).toBeDefined();
    const network = networkPath ? store.get(networkPath) : null;
    expect(network?.displayName).toBe("Test Org");
    expect(network?.legalName).toBe("Legal Name LLC");

    const membershipPath = Array.from(store.keys()).find((k) => k.includes("/memberships/"));
    expect(membershipPath).toBeDefined();
    const membership = membershipPath ? store.get(membershipPath) : null;
    expect(membership?.roles).toContain("network_owner");
  });

  it("rejects when draft ownership mismatches", async () => {
    mockGetDraft.mockResolvedValue({ userId: "other-user", form: { data: {} } });
    mockConsume.mockResolvedValue(undefined);

    const db = makeDb();

    await expect(
      createNetworkWithOrgAndVenue("admin-1", payload, db as any),
    ).rejects.toThrow("admin_form_ownership_mismatch");

    expect(mockConsume).not.toHaveBeenCalled();
    expect(store.size).toBe(0);
  });
});
