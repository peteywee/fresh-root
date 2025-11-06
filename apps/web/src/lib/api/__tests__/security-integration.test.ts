//[P1][API][TEST] Security integration tests
// Tags: test, security, integration, authorization, rate-limiting, csrf
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import {
  requireOrgMembership,
  requireRole,
  canAccessResource,
} from "../authorization";
import { rateLimit, RateLimits } from "../rate-limit";
import { csrfProtection, generateCSRFToken } from "../csrf";

// Mock Firestore
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        where: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: vi.fn(),
            })),
          })),
          limit: vi.fn(() => ({
            get: vi.fn(),
          })),
        })),
        limit: vi.fn(() => ({
          get: vi.fn(),
        })),
      })),
    })),
  })),
}));

describe("Security Integration Tests", () => {
  describe("Cross-Organization Access Control", () => {
    it("should deny access when user is not a member of the organization", async () => {
      // Mock user not being a member
      const { getFirestore } = await import("firebase-admin/firestore");
      const mockGet = vi.fn().mockResolvedValue({ empty: true });
      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(async (_request, context) => {
        return NextResponse.json({ success: true, orgId: context.orgId });
      });

      const request = new NextRequest("http://localhost/api/organizations/org123/data", {
        headers: { "x-user-id": "user456" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("not a member");
    });

    it("should allow access when user is a member of the organization", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");
      const mockGet = vi.fn().mockResolvedValue({ empty: false });
      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(async (_request, context) => {
        return NextResponse.json({ success: true, orgId: context.orgId });
      });

      const request = new NextRequest("http://localhost/api/organizations/org123/data", {
        headers: { "x-user-id": "user123" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("should use canAccessResource helper to check membership and role", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      // Mock membership exists
      const mockGetMembership = vi.fn().mockResolvedValue({ empty: false });
      // Mock role retrieval
      const mockGetRoles = vi.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ roles: ["admin"] }) }],
      });

      const mockGet = vi.fn()
        .mockResolvedValueOnce(mockGetMembership()) // isOrgMember call
        .mockResolvedValueOnce(mockGetRoles()); // getUserRoles call

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const result = await canAccessResource("user123", "org123", "staff");

      expect(result.allowed).toBe(true);
      expect(result.roles).toContain("admin");
    });
  });

  describe("Role-Based Access Control (RBAC)", () => {
    it("should deny access when user role is insufficient", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      // Mock membership with staff role
      const mockGet = vi.fn()
        .mockResolvedValueOnce({ empty: false }) // isOrgMember
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ data: () => ({ roles: ["staff"] }) }],
        }); // getUserRoles

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(
        requireRole("admin")(async (_request, context) => {
          return NextResponse.json({ success: true, roles: context.roles });
        }),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/admin", {
        headers: { "x-user-id": "user123" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("Requires admin");
    });

    it("should allow access when user has admin role", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      const mockGet = vi.fn()
        .mockResolvedValueOnce({ empty: false }) // isOrgMember
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ data: () => ({ roles: ["admin"] }) }],
        }); // getUserRoles

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(
        requireRole("admin")(async (_request, context) => {
          return NextResponse.json({ success: true, roles: context.roles });
        }),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/admin", {
        headers: { "x-user-id": "user123" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("should allow access when user has org_owner role (highest privilege)", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      const mockGet = vi.fn()
        .mockResolvedValueOnce({ empty: false }) // isOrgMember
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ data: () => ({ roles: ["org_owner"] }) }],
        }); // getUserRoles

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const handler = requireOrgMembership(
        requireRole("admin")(async (_request, context) => {
          return NextResponse.json({ success: true, roles: context.roles });
        }),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/admin", {
        headers: { "x-user-id": "user123" },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.roles).toContain("org_owner");
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      // Rate limiter uses in-memory storage, each test gets fresh state
    });

    it("should return 429 after exceeding rate limit", async () => {
      const handler = rateLimit({ max: 2, windowSeconds: 60 })(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "192.168.1.100" },
      });

      // First two requests should succeed
      const response1 = await handler(request, { params: {} });
      expect(response1.status).toBe(200);

      const response2 = await handler(request, { params: {} });
      expect(response2.status).toBe(200);

      // Third request should be rate limited
      const response3 = await handler(request, { params: {} });
      expect(response3.status).toBe(429);

      const body = await response3.json();
      expect(body.error).toContain("Rate limit exceeded");
      expect(response3.headers.get("Retry-After")).toBeTruthy();
    });

    it("should include rate limit headers in response", async () => {
      const handler = rateLimit(RateLimits.WRITE)(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/write", {
        headers: { "x-forwarded-for": "192.168.1.101" },
      });

      const response = await handler(request, { params: {} });

      expect(response.headers.get("X-RateLimit-Limit")).toBe("30");
      expect(response.headers.get("X-RateLimit-Remaining")).toBeTruthy();
      expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
    });
  });

  describe("CSRF Protection", () => {
    it("should reject POST request without CSRF token", async () => {
      const handler = csrfProtection()(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("CSRF token missing");
    });

    it("should reject POST request with mismatched CSRF tokens", async () => {
      const cookieToken = generateCSRFToken();
      const headerToken = generateCSRFToken();

      const handler = csrfProtection()(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        headers: {
          cookie: `csrf-token=${cookieToken}`,
          "x-csrf-token": headerToken,
        },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("CSRF token mismatch");
    });

    it("should allow POST request with matching CSRF tokens", async () => {
      const token = generateCSRFToken();

      const handler = csrfProtection()(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        headers: {
          cookie: `csrf-token=${token}`,
          "x-csrf-token": token,
        },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("should allow GET request without CSRF token", async () => {
      const handler = csrfProtection()(async () => {
        return NextResponse.json({ success: true });
      });

      const request = new NextRequest("http://localhost/api/test", {
        method: "GET",
      });

      const response = await handler(request, { params: {} });

      expect(response.status).toBe(200);
    });
  });

  describe("Combined Security Layers", () => {
    it("should apply all security layers in correct order", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      // Mock org membership with admin role
      const mockGet = vi.fn()
        .mockResolvedValueOnce({ empty: false }) // isOrgMember
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ data: () => ({ roles: ["admin"] }) }],
        }); // getUserRoles

      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const token = generateCSRFToken();

      // Full security stack: rate limit -> CSRF -> org membership -> role check
      const handler = rateLimit(RateLimits.WRITE)(
        csrfProtection()(
          requireOrgMembership(
            requireRole("admin")(async (_request, context) => {
              return NextResponse.json({
                success: true,
                orgId: context.orgId,
                roles: context.roles,
              });
            }),
          ),
        ),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/update", {
        method: "POST",
        headers: {
          "x-user-id": "user123",
          "x-forwarded-for": "192.168.1.200",
          cookie: `csrf-token=${token}`,
          "x-csrf-token": token,
        },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.orgId).toBe("org123");
      expect(body.roles).toContain("admin");

      // Verify rate limit headers are present
      expect(response.headers.get("X-RateLimit-Limit")).toBe("30");
    });

    it("should fail at first security layer (rate limit)", async () => {
      const handler = rateLimit({ max: 1, windowSeconds: 60 })(
        csrfProtection()(async () => {
          return NextResponse.json({ success: true });
        }),
      );

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        headers: { "x-forwarded-for": "192.168.1.201" },
      });

      // First request uses up the limit
      await handler(request, { params: {} });

      // Second request should be rate limited (before CSRF check)
      const response = await handler(request, { params: {} });

      expect(response.status).toBe(429);
    });

    it("should fail at CSRF layer (after rate limit passes)", async () => {
      const handler = rateLimit(RateLimits.WRITE)(
        csrfProtection()(async () => {
          return NextResponse.json({ success: true });
        }),
      );

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        headers: { "x-forwarded-for": "192.168.1.202" },
        // No CSRF token
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("CSRF");
    });

    it("should fail at authorization layer (after rate limit and CSRF pass)", async () => {
      const { getFirestore } = await import("firebase-admin/firestore");

      // Mock user NOT being a member
      const mockGet = vi.fn().mockResolvedValue({ empty: true });
      const mockLimit = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
      const mockCollection = vi.fn(() => ({ where: mockWhere }));

      vi.mocked(getFirestore).mockReturnValue({
        collection: mockCollection,
      } as any);

      const token = generateCSRFToken();

      const handler = rateLimit(RateLimits.WRITE)(
        csrfProtection()(
          requireOrgMembership(async (_request, context) => {
            return NextResponse.json({ success: true, orgId: context.orgId });
          }),
        ),
      );

      const request = new NextRequest("http://localhost/api/organizations/org123/data", {
        method: "POST",
        headers: {
          "x-user-id": "user999",
          "x-forwarded-for": "192.168.1.203",
          cookie: `csrf-token=${token}`,
          "x-csrf-token": token,
        },
      });

      const response = await handler(request, { params: {} });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain("not a member");
    });
  });
});
