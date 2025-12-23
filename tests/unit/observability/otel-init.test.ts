import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("ensureOtelStarted", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete (globalThis as any).__freshRootOtelStarted;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    delete (globalThis as any).__freshRootOtelStarted;
    vi.restoreAllMocks();
  });

  it("is a no-op when OTEL is not enabled", async () => {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    process.env.OBSERVABILITY_TRACES_ENABLED = "false";

    const { ensureOtelStarted } = await import("@/app/api/_shared/otel-init");
    expect(() => ensureOtelStarted()).not.toThrow();
    expect((globalThis as any).__freshRootOtelStarted).toBeUndefined();
  });

  it("starts the SDK once when OTEL is enabled", async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318/v1/traces";
    process.env.OBSERVABILITY_TRACES_ENABLED = "true";

    const { ensureOtelStarted } = await import("@/app/api/_shared/otel-init");
    expect(() => ensureOtelStarted()).not.toThrow();
    expect(() => ensureOtelStarted()).not.toThrow();

    expect((globalThis as any).__freshRootOtelStarted).toBe(true);
  });
});
