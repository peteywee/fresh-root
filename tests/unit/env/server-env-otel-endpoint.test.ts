import { describe, expect, it, vi } from "vitest";

describe("loadServerEnv OTEL endpoint compatibility", () => {
  it("maps legacy OTEL_EXPORTER_OTLP_TRACES_ENDPOINT to OTEL_EXPORTER_OTLP_ENDPOINT", async () => {
    const originalEnv = { ...process.env };

    try {
      process.env.NODE_ENV = "development";
      process.env.FIREBASE_PROJECT_ID = "test-project";
      process.env.SESSION_SECRET = "x".repeat(32);

      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = "http://localhost:4318/v1/traces";

      vi.resetModules();
      const { loadServerEnv } = await import("../../../apps/web/src/lib/env.server");

      const env = loadServerEnv();
      expect(env.OTEL_EXPORTER_OTLP_ENDPOINT).toBe("http://localhost:4318/v1/traces");
      expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toBe("http://localhost:4318/v1/traces");
    } finally {
      process.env = originalEnv;
      vi.resetModules();
    }
  });
});
