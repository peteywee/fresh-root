// [P1][API][TEST] Endpoint CSRF enforcement
// Tags: P1, API, TEST, CSRF

import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

import { createEndpoint } from "../index";

const buildRequest = (cookieName: string, token: string) =>
  new NextRequest("http://example.com/api/test", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": token,
      cookie: `${cookieName}=${token}`,
    },
    body: JSON.stringify({}),
  });

describe("api-framework createEndpoint CSRF", () => {
  const endpoint = createEndpoint({
    auth: "none",
    org: "none",
    csrf: true,
    handler: async () => ({ ok: true }),
  });

  it("accepts matching csrf-token cookie + header", async () => {
    const token = "token-abc-123";
    const response = await endpoint(buildRequest("csrf-token", token), {
      params: Promise.resolve({}),
    });

    expect(response.status).toBe(200);
  });

  it("accepts matching legacy csrf cookie + header", async () => {
    const token = "token-legacy-456";
    const response = await endpoint(buildRequest("csrf", token), {
      params: Promise.resolve({}),
    });

    expect(response.status).toBe(200);
  });

  it("rejects missing csrf cookie", async () => {
    const token = "token-missing-cookie";
    const request = new NextRequest("http://example.com/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": token,
      },
      body: JSON.stringify({}),
    });

    const response = await endpoint(request, { params: Promise.resolve({}) });

    expect(response.status).toBe(403);
  });

  it("rejects mismatched csrf token", async () => {
    const request = new NextRequest("http://example.com/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": "token-a",
        cookie: "csrf-token=token-b",
      },
      body: JSON.stringify({}),
    });

    const response = await endpoint(request, { params: Promise.resolve({}) });

    expect(response.status).toBe(403);
  });
});
