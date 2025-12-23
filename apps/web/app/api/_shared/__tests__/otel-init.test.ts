import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@opentelemetry/exporter-trace-otlp-http", () => {
  return {
    OTLPTraceExporter: class {
      constructor(_opts: any) {}
    },
  };
});

const startMock = vi.fn(() => Promise.resolve());
const shutdownMock = vi.fn(() => Promise.resolve());

vi.mock("@opentelemetry/sdk-node", () => {
  return {
    NodeSDK: class {
      start = startMock;
      shutdown = shutdownMock;
      constructor(_opts: any) {}
    },
    resources: {
      resourceFromAttributes: (_attrs: any) => ({}) as any,
    },
  };
});

vi.mock("@opentelemetry/semantic-conventions", () => {
  return {
    SemanticResourceAttributes: {
      SERVICE_NAME: "service.name",
      DEPLOYMENT_ENVIRONMENT: "deployment.environment",
    },
  };
});

describe("ensureOtelStarted", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete (globalThis as any).__freshRootOtelStarted;
    startMock.mockClear();
    shutdownMock.mockClear();
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

    const { ensureOtelStarted } = await import("../otel-init");
    ensureOtelStarted();

    expect(startMock).not.toHaveBeenCalled();
    expect((globalThis as any).__freshRootOtelStarted).toBeUndefined();
  });

  it("starts the SDK once when OTEL is enabled", async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318/v1/traces";
    process.env.OBSERVABILITY_TRACES_ENABLED = "true";

    const { ensureOtelStarted } = await import("../otel-init");
    ensureOtelStarted();
    ensureOtelStarted();

    expect((globalThis as any).__freshRootOtelStarted).toBe(true);
    expect(startMock).toHaveBeenCalledTimes(1);
  });
});
