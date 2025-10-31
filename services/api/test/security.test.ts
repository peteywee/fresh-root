import express from "express";
import { describe, expect, it } from "vitest";
import { applySecurity } from "../src/mw/security.js";

// Minimal Env stub matching the shape used by applySecurity
const baseEnv = {
  PORT: "0",
  NODE_ENV: "development" as const,
  FIREBASE_PROJECT_ID: "demo",
} as const;

function startServer(
  envOverrides: Partial<
    typeof baseEnv & {
      CORS_ORIGINS?: string;
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX?: string;
    }
  > = {},
) {
  const env = { ...baseEnv, ...envOverrides } as any;
  const app = express();
  applySecurity(app, env);
  app.get("/ping", (_req, res) => res.status(200).json({ ok: true }));
  app.post("/echo", (req, res) => res.json({ size: JSON.stringify(req.body ?? {}).length }));
  return new Promise<{ url: string; close: () => Promise<void> }>((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

describe("security headers", () => {
  it("sets basic security headers", async () => {
    const srv = await startServer();
    const res = await fetch(`${srv.url}/ping`);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    await srv.close();
  });
});

describe("CORS allowlist", () => {
  it("allows preflight for allowed origin and omits for disallowed", async () => {
    const allowed = "https://allowed.test";
    const srv = await startServer({ CORS_ORIGINS: allowed });

    // Preflight (allowed)
    const pre = await fetch(`${srv.url}/ping`, {
      method: "OPTIONS",
      headers: {
        Origin: allowed,
        "Access-Control-Request-Method": "GET",
      },
    });
    expect(pre.status).toBe(204);
    expect(pre.headers.get("access-control-allow-origin")).toBe(allowed);

    // Disallowed origin should not get ACAO header
    const bad = await fetch(`${srv.url}/ping`, {
      headers: { Origin: "https://bad.test" },
    });
    expect(bad.status).toBe(200);
    expect(bad.headers.get("access-control-allow-origin")).toBeNull();

    await srv.close();
  });
});

describe("body size limits", () => {
  it("returns 413 for >1mb JSON payloads", async () => {
    const srv = await startServer();
    const big = "x".repeat(1_200_000); // ~1.2MB
    const res = await fetch(`${srv.url}/echo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ big }),
    });
    // Node's fetch throws only on network errors; Express returns 413
    expect(res.status).toBe(413);
    await srv.close();
  });
});

describe("rate limiting", () => {
  it("returns 429 when exceeding limits", async () => {
    const srv = await startServer({ RATE_LIMIT_WINDOW_MS: "200", RATE_LIMIT_MAX: "2" });
    // Two allowed
    await fetch(`${srv.url}/ping`);
    await fetch(`${srv.url}/ping`);
    // Third should be limited
    const res = await fetch(`${srv.url}/ping`);
    expect(res.status).toBe(429);
    const retry = res.headers.get("retry-after");
    expect(retry).toBeTruthy();
    await srv.close();
  });
});
