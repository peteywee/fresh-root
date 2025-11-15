//[P1][API][TEST] Authorization middleware unit tests
// Tags: test, authorization, rbac, vitest
 

import { NextRequest } from "next/server";
import { describe, it, expect, vi } from "vitest";

import {
  extractOrgId,
  isOrgMember,
  getUserRoles,
  hasRequiredRole,
  canAccessResource,
} from "./authorization";

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

describe("extractOrgId", () => {
  it("should extract org ID from URL path", () => {
    const request = new NextRequest("http://localhost/api/organizations/org123");
    expect(extractOrgId(request)).toBe("org123");
  });

  it("should extract org ID from query params", () => {
    const request = new NextRequest("http://localhost/api/items?orgId=org456");
    expect(extractOrgId(request)).toBe("org456");
  });

  it("should return null if no org ID found", () => {
    const request = new NextRequest("http://localhost/api/items");
    expect(extractOrgId(request)).toBeNull();
  });
});

describe("hasRequiredRole", () => {
  it("should allow staff role for staff requirement", () => {
    expect(hasRequiredRole(["staff"], "staff")).toBe(true);
  });

  it("should allow admin role for staff requirement", () => {
    expect(hasRequiredRole(["admin"], "staff")).toBe(true);
  });

  it("should allow org_owner role for any requirement", () => {
    expect(hasRequiredRole(["org_owner"], "staff")).toBe(true);
    expect(hasRequiredRole(["org_owner"], "admin")).toBe(true);
  });

  it("should deny staff role for admin requirement", () => {
    expect(hasRequiredRole(["staff"], "admin")).toBe(false);
  });

  it("should allow user with multiple roles", () => {
    expect(hasRequiredRole(["staff", "admin"], "admin")).toBe(true);
    expect(hasRequiredRole(["staff", "scheduler"], "manager")).toBe(false);
  });

  it("should allow corporate role for staff requirement", () => {
    expect(hasRequiredRole(["corporate"], "staff")).toBe(true);
  });

  it("should deny corporate role for manager requirement", () => {
    expect(hasRequiredRole(["corporate"], "manager")).toBe(false);
  });

  it("should allow manager role for corporate requirement", () => {
    expect(hasRequiredRole(["manager"], "corporate")).toBe(true);
  });
});

describe("isOrgMember", () => {
  it("should return true when membership exists", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({ empty: false });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await isOrgMember("user123", "org123");
    expect(result).toBe(true);
    expect(mockCollection).toHaveBeenCalledWith("memberships");
  });

  it("should return false when membership does not exist", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({ empty: true });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await isOrgMember("user123", "org123");
    expect(result).toBe(false);
  });
});

describe("getUserRoles", () => {
  it("should return user roles when membership exists", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ roles: ["admin", "staff"] }) }],
    });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await getUserRoles("user123", "org123");
    expect(result).toEqual(["admin", "staff"]);
  });

  it("should return null when membership does not exist", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({ empty: true });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await getUserRoles("user123", "org123");
    expect(result).toBeNull();
  });
});

describe("canAccessResource", () => {
  it("should allow access for valid member with sufficient role", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi
      .fn()
      .mockResolvedValueOnce({ empty: false }) // isOrgMember
      .mockResolvedValueOnce({
        // getUserRoles
        empty: false,
        docs: [{ data: () => ({ roles: ["admin"] }) }],
      });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await canAccessResource("user123", "org123", "staff");
    expect(result.allowed).toBe(true);
    expect(result.roles).toEqual(["admin"]);
  });

  it("should deny access for non-member", async () => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const mockGet = vi.fn().mockResolvedValue({ empty: true });
    const mockLimit = vi.fn(() => ({ get: mockGet }));
    const mockWhere = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
    const mockCollection = vi.fn(() => ({ where: mockWhere }));

    vi.mocked(getFirestore).mockReturnValue({
      collection: mockCollection,
    } as any);

    const result = await canAccessResource("user123", "org123", "staff");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Not a member of organization");
  });
});
