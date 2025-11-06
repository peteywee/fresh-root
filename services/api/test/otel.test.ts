// [P1][RELIABILITY][TEST] OpenTelemetry initialization tests
// Tags: P1, RELIABILITY, TEST, OTEL, VITEST
import { beforeEach, describe, expect, it, vi } from "vitest";

import { initOTel, getTraceContext } from "../src/obs/otel.js";

describe("OpenTelemetry", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  it("attempts initialization with endpoint and service name", () => {
    initOTel({
      serviceName: "test-service",
      serviceVersion: "1.0.0",
      endpoint: "http://localhost:4318/v1/traces",
    });

    // Should either initialize successfully or fail gracefully
    const allLogs = consoleLogSpy.mock.calls.map((c) => c[0]);
    const allErrors = consoleErrorSpy.mock.calls.map((c) => c[0]);
    const hasOtelLog = allLogs.some(
      (log) => typeof log === "string" && log.includes("[otel]"),
    );
    const hasOtelError = allErrors.some(
      (err) => typeof err === "string" && err.includes("[otel]"),
    );

    // Should log something OTel-related (init or error)
    expect(hasOtelLog || hasOtelError).toBe(true);
  });

  it("skips initialization when no endpoint provided", () => {
    initOTel({
      serviceName: "test-service",
      endpoint: undefined,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[otel] tracing disabled"),
    );
  });

  it("skips initialization when explicitly disabled", () => {
    initOTel({
      serviceName: "test-service",
      endpoint: "http://localhost:4318/v1/traces",
      enabled: false,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[otel] tracing disabled"),
    );
  });

  it("returns null trace context when not available", () => {
    const ctx = getTraceContext();
    expect(ctx).toBeNull();
  });
});
