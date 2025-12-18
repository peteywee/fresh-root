// [P1][API][TEST] createEndpoint response handling
// Tags: P1, API, TEST
import { describe, expect, it } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { createPublicEndpoint } from "../index";

const buildRequest = (method = "GET") => new NextRequest("http://localhost/api/test", { method });

const emptyParams = { params: Promise.resolve({}) } as const;

describe("createEndpoint response handling", () => {
  it("passes through NextResponse unchanged and preserves status/body", async () => {
    const endpoint = createPublicEndpoint({
      handler: async () => NextResponse.json({ ok: true }, { status: 201 }),
    });

    const response = await endpoint(buildRequest(), emptyParams);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("x-request-id")).toBeTruthy();
    expect(response.headers.get("x-duration-ms")).toBeTruthy();
  });

  it("wraps plain return values in data/meta envelope", async () => {
    const endpoint = createPublicEndpoint({
      handler: async () => ({ hello: "world" }),
    });

    const response = await endpoint(buildRequest(), emptyParams);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ hello: "world" });
    expect(body.meta).toHaveProperty("requestId");
    expect(body.meta).toHaveProperty("durationMs");
  });
});
