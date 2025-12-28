// [P0][TEST][ENV] Environment validation tests
// Tags: P0, TEST, ENV, VALIDATION

import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Server Environment Validation", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Required Variables", () => {
    it("should require FIREBASE_PROJECT_ID", async () => {
      delete process.env.FIREBASE_PROJECT_ID;

      // Clear module cache to force re-import
      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      expect(() => loadServerEnv()).toThrow(/FIREBASE_PROJECT_ID is required/);
    });

    it("should validate GOOGLE_APPLICATION_CREDENTIALS_JSON as valid JSON", async () => {
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = "invalid-json{";

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      expect(() => loadServerEnv()).toThrow(/must be valid JSON/);
    });
  });

  describe("Production Validation", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
      process.env.FIREBASE_PROJECT_ID = "prod-project";
    });

    it("should require Firebase credentials in production", async () => {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      expect(() => loadServerEnv()).toThrow(/Missing Firebase admin credentials/);
    });

    it("should require SESSION_SECRET with minimum length", async () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
        type: "service_account",
      });
      process.env.SESSION_SECRET = "too-short";
      process.env.CORS_ORIGINS = "https://example.com";

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      expect(() => loadServerEnv()).toThrow(/Invalid SESSION_SECRET/);
    });

    it("should require CORS_ORIGINS in production", async () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
        type: "service_account",
      });
      process.env.SESSION_SECRET = "a-very-long-secret-key-with-32-plus-chars";
      delete process.env.CORS_ORIGINS;

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      expect(() => loadServerEnv()).toThrow(/Missing CORS_ORIGINS/);
    });

    it("should require Redis config when USE_REDIS_RATE_LIMIT is true", async () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
        type: "service_account",
      });
      process.env.SESSION_SECRET = "a-very-long-secret-key-with-32-plus-chars";
      process.env.CORS_ORIGINS = "https://example.com";
      process.env.USE_REDIS_RATE_LIMIT = "true";
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.REDIS_URL;

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      expect(() => loadServerEnv()).toThrow(/Missing Redis configuration/);
    });

    it("should require UPSTASH_REDIS_REST_TOKEN when using Upstash", async () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
        type: "service_account",
      });
      process.env.SESSION_SECRET = "a-very-long-secret-key-with-32-plus-chars";
      process.env.CORS_ORIGINS = "https://example.com";
      process.env.USE_REDIS_RATE_LIMIT = "true";
      process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      expect(() => loadServerEnv()).toThrow(/Missing UPSTASH_REDIS_REST_TOKEN/);
    });
  });

  describe("Valid Configuration", () => {
    it("should accept valid development configuration", async () => {
      process.env.NODE_ENV = "development";
      process.env.FIREBASE_PROJECT_ID = "dev-project";

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      const env = loadServerEnv();

      expect(env.FIREBASE_PROJECT_ID).toBe("dev-project");
      expect(env.NODE_ENV).toBe("development");
    });

    it("should accept valid production configuration", async () => {
      process.env.NODE_ENV = "production";
      process.env.FIREBASE_PROJECT_ID = "prod-project";
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
        type: "service_account",
        project_id: "prod-project",
      });
      process.env.SESSION_SECRET = "a-very-long-and-secure-session-secret-key";
      process.env.CORS_ORIGINS = "https://example.com,https://app.example.com";

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      const env = loadServerEnv();

      expect(env.NODE_ENV).toBe("production");
      expect(env.FIREBASE_PROJECT_ID).toBe("prod-project");
      expect(env.SESSION_SECRET).toBe("a-very-long-and-secure-session-secret-key");
    });

    it("should accept valid Redis configuration", async () => {
      process.env.NODE_ENV = "production";
      process.env.FIREBASE_PROJECT_ID = "prod-project";
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
        type: "service_account",
      });
      process.env.SESSION_SECRET = "a-very-long-and-secure-session-secret-key";
      process.env.CORS_ORIGINS = "https://example.com";
      process.env.USE_REDIS_RATE_LIMIT = "true";
      process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      const env = loadServerEnv();

      expect(env.USE_REDIS_RATE_LIMIT).toBe("true");
      expect(env.UPSTASH_REDIS_REST_URL).toBe("https://test.upstash.io");
    });
  });

  describe("Helper Functions", () => {
    it("should parse CORS origins correctly", async () => {
      process.env.NODE_ENV = "development";
      process.env.FIREBASE_PROJECT_ID = "dev-project";
      process.env.CORS_ORIGINS =
        "https://example.com, https://app.example.com , https://admin.example.com";

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv, getCorsOrigins } = await import(modulePath);

      const env = loadServerEnv();
      const origins = getCorsOrigins(env);

      expect(origins).toEqual([
        "https://example.com",
        "https://app.example.com",
        "https://admin.example.com",
      ]);
    });

    it("should detect emulator mode", async () => {
      process.env.NODE_ENV = "development";
      process.env.FIREBASE_PROJECT_ID = "dev-project";
      process.env.NEXT_PUBLIC_USE_EMULATORS = "true";

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv, useEmulators } = await import(modulePath);

      const env = loadServerEnv();
      expect(useEmulators(env)).toBe(true);
    });
  });

  describe("Caching", () => {
    it("should cache validated environment", async () => {
      process.env.NODE_ENV = "development";
      process.env.FIREBASE_PROJECT_ID = "dev-project";

      const modulePath = "../env.server";
      delete require.cache[require.resolve(modulePath)];

      const { loadServerEnv } = await import(modulePath);

      const env1 = loadServerEnv();
      const env2 = loadServerEnv();

      // Should return same object instance (cached)
      expect(env1).toBe(env2);
    });
  });
});
