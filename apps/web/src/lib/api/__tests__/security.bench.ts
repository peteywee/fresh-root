//[P1][APP][TEST] Security middleware performance benchmarks
// Tags: test, benchmark, performance, security, middleware

import { NextRequest } from "next/server";
import { describe, bench, beforeEach } from "vitest";

import { requireOrgMembership, requireRole } from "../authorization";
import type { AuthContext } from "../authorization";
import { csrfProtection } from "../csrf";
import { rateLimit, RateLimits } from "../rate-limit";

describe("Security Middleware Performance", () => {
  describe("Rate Limiting", () => {
    let request: NextRequest;

    beforeEach(() => {
      request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
      });
    });

    bench(
      "Rate limit check (STANDARD: 100/min) - should complete in <5ms",
      async () => {
        const handler = rateLimit(RateLimits.STANDARD)(async () => {
          return new Response("OK");
        });
        await handler(request);
      },
      {
        time: 1000, // Run for 1 second
        iterations: 200, // Expect ~200 iterations in 1s = 5ms per iteration
      }
    );

    bench(
      "Rate limit check (STRICT: 10/min) - should complete in <5ms",
      async () => {
        const handler = rateLimit(RateLimits.STRICT)(async () => {
          return new Response("OK");
        });
        await handler(request);
      },
      {
        time: 1000,
        iterations: 200,
      }
    );
  });

  describe("CSRF Protection", () => {
    let request: NextRequest;
    const csrfToken = "test-csrf-token-123";

    beforeEach(() => {
      request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
          cookie: `csrf_token=${csrfToken}`,
        },
      });
    });

    bench(
      "CSRF validation (valid token) - should complete in <3ms",
      async () => {
        const handler = csrfProtection()(async () => {
          return new Response("OK");
        });
        await handler(request);
      },
      {
        time: 1000,
        iterations: 333, // Expect ~333 iterations in 1s = 3ms per iteration
      }
    );

    bench("CSRF generation (GET request) - should complete in <2ms", async () => {
      const getRequest = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });
      const handler = csrfProtection()(async () => {
        return new Response("OK");
      });
      await handler(getRequest);
    }, {
      time: 1000,
      iterations: 500, // Expect ~500 iterations in 1s = 2ms per iteration
    });
  });

  describe("Authorization", () => {
    let request: NextRequest;
    const mockContext: AuthContext = {
      orgId: "org-123",
      userId: "user-456",
      roles: ["admin", "staff"],
    };

    beforeEach(() => {
      request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });
    });

    bench(
      "Org membership check - should complete in <10ms",
      async () => {
        const handler = requireOrgMembership(async (req, ctx) => {
          return new Response("OK");
        });
        await handler(request, { params: Promise.resolve({}) });
      },
      {
        time: 1000,
        iterations: 100, // Expect ~100 iterations in 1s = 10ms per iteration
      }
    );

    bench(
      "Role check (admin) - should complete in <5ms",
      async () => {
        const handler = requireRole("admin")(
          async (req, ctx: AuthContext) => {
            return new Response("OK");
          }
        );
        // Simulate already authenticated context
        const authenticatedHandler = async () => {
          return handler(request, mockContext);
        };
        await authenticatedHandler();
      },
      {
        time: 1000,
        iterations: 200, // Expect ~200 iterations in 1s = 5ms per iteration
      }
    );
  });

  describe("Combined Security Stack", () => {
    let request: NextRequest;
    const csrfToken = "test-csrf-token-123";

    beforeEach(() => {
      request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
          cookie: `csrf_token=${csrfToken}`,
          "x-forwarded-for": "192.168.1.1",
        },
      });
    });

    bench(
      "Full security stack (rate limit + CSRF + auth + role) - should complete in <25ms",
      async () => {
        const handler = rateLimit(RateLimits.WRITE)(
          csrfProtection()(
            requireOrgMembership(
              requireRole("admin")(async (req, ctx) => {
                return new Response("OK");
              })
            )
          )
        );
        await handler(request, { params: Promise.resolve({}) });
      },
      {
        time: 1000,
        iterations: 40, // Expect ~40 iterations in 1s = 25ms per iteration
      }
    );

    bench(
      "Minimal stack (rate limit + CSRF) - should complete in <10ms",
      async () => {
        const handler = rateLimit(RateLimits.STANDARD)(
          csrfProtection()(async () => {
            return new Response("OK");
          })
        );
        await handler(request);
      },
      {
        time: 1000,
        iterations: 100, // Expect ~100 iterations in 1s = 10ms per iteration
      }
    );
  });
});

describe("Input Sanitization Performance", () => {
  bench("Sanitize simple string - should complete in <1ms", () => {
    sanitizeText("Hello <script>alert('xss')</script> World");
  }, {
    time: 1000,
    iterations: 1000, // Expect ~1000 iterations in 1s = 1ms per iteration
  });

  bench("Sanitize complex object - should complete in <5ms", () => {
    sanitizeObject(
      {
        name: "<b>Test</b>",
        email: "test@example.com",
        description: "This is a <script>malicious()</script> test",
        nested: {
          value: "<img src=x onerror=alert(1)>",
        },
      },
      { urlFields: ["website"] }
    );
  }, {
    time: 1000,
    iterations: 200, // Expect ~200 iterations in 1s = 5ms per iteration
  });
});
