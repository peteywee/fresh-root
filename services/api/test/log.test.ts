// [P1][RELIABILITY][TEST] Unit tests for structured JSON logger
// Tags: P1, RELIABILITY, TEST, LOGGING, VITEST
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Logger } from "../src/obs/log.js";

describe("Logger", () => {
  let logger: Logger;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    // Clear any console.log calls from module imports (e.g., OTel initialization)
    vi.clearAllMocks();
  });

  it("outputs JSON in production mode", () => {
    logger = new Logger("production");
    logger.info("test message", { reqId: "abc123", uid: "user1" });

    expect(consoleLogSpy).toHaveBeenCalledOnce();
    const output = consoleLogSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed).toMatchObject({
      level: "info",
      message: "test message",
      env: "production",
      reqId: "abc123",
      uid: "user1",
    });
    expect(parsed.timestamp).toBeDefined();
  });

  it("outputs human-readable format in development", () => {
    logger = new Logger("development");
    logger.info("dev message", { reqId: "req-456", method: "GET", path: "/test", status: 200 });

    expect(consoleLogSpy).toHaveBeenCalledOnce();
    const output = consoleLogSpy.mock.calls[0][0];

    expect(output).toContain("[INFO]");
    expect(output).toContain("[req-456]");
    expect(output).toContain("GET /test");
    expect(output).toContain("200");
    expect(output).toContain("dev message");
  });

  it("logs errors with stack traces in production JSON", () => {
    logger = new Logger("production");
    const err = new Error("test error");
    logger.error("error occurred", {
      error: { message: err.message, stack: err.stack },
    });

    expect(consoleLogSpy).toHaveBeenCalledOnce();
    const output = consoleLogSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed).toMatchObject({
      level: "error",
      message: "error occurred",
      error: {
        message: "test error",
      },
    });
    expect(parsed.error.stack).toBeDefined();
  });

  it("logs all levels correctly", () => {
    logger = new Logger("production");

    logger.debug("debug msg");
    logger.info("info msg");
    logger.warn("warn msg");
    logger.error("error msg");

    expect(consoleLogSpy).toHaveBeenCalledTimes(4);

    const levels = consoleLogSpy.mock.calls.map((call) => JSON.parse(call[0] as string).level);
    expect(levels).toEqual(["debug", "info", "warn", "error"]);
  });
});
