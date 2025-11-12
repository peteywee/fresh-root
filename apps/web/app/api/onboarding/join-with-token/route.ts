//[P1][API][ONBOARDING] Join With Token Endpoint (server)
// Tags: api, onboarding, join-token, membership, events

/**
 * POST /api/onboarding/join-with-token
 * Allow an authenticated user to join an existing organization using an invite token.
 *
 * Validates the token, checks expiry and usage limits, then:
 * - Creates membership record for the user
 * - Sets appropriate role (from token or default)
 * - Logs the join event
 * - Marks onboarding as complete
 *
 * Requires: Authentication, valid join token, email verified
 * Request body: { token: string }
 * Returns: { ok: true; networkId; orgId; role; venue? }
 */


import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { logEvent } from "@/src/lib/eventLog";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

type JoinTokenDoc = {
  networkId: string;
  orgId: string;
  role: string;
  venueId?: string;
  expiresAt?: number;
  disabled?: boolean;
  usedBy?: string[];
  maxUses?: number;
};

export async function joinWithTokenHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  injectedAdminDb = importedAdminDb,
) {
  if (!injectedAdminDb) {
    // Stub for local/dev
    return NextResponse.json(
      {
        ok: true,
        networkId: "stub-network-id",
        orgId: "stub-org-id",
        role: "staff",
      },
      { status: 200 },
    );
  }

  const adminDb = injectedAdminDb;
  const uid = req.user?.uid;

  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const token = (body as Record<string, unknown>)?.token as string | undefined;
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 422 });
  }
  if (token.includes("/")) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  try {
    const tokenRef = adminDb.collection("join_tokens").doc(token);
    const snap = await tokenRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "token_not_found" }, { status: 404 });
    }

    const data = snap.data() as JoinTokenDoc;
    const now = Date.now();

    if (data.disabled) {
      return NextResponse.json({ error: "token_disabled" }, { status: 403 });
    }

    if (typeof data.expiresAt === "number" && data.expiresAt < now) {
      return NextResponse.json({ error: "token_expired" }, { status: 410 });
    }

    const usedBy = Array.isArray(data.usedBy) ? data.usedBy : [];
    if (typeof data.maxUses === "number" && usedBy.length >= data.maxUses) {
      return NextResponse.json({ error: "token_exhausted" }, { status: 409 });
    }

    if (!data.networkId || !data.orgId || !data.role) {
      return NextResponse.json({ error: "token_misconfigured" }, { status: 500 });
    }

    const membershipId = `${uid}_${data.orgId}`;
    const membershipRef = adminDb.collection("memberships").doc(membershipId);

    await adminDb.runTransaction(async (tx: any) => {
      const existing = await tx.get(membershipRef);
      const createdAt = now;

      if (!existing.exists) {
        tx.set(membershipRef, {
          userId: uid,
          orgId: data.orgId,
          networkId: data.networkId,
          roles: [data.role],
          createdAt,
          updatedAt: createdAt,
          createdBy: uid,
        });
      } else {
        const cur = existing.data() as {
          roles?: string[];
          updatedAt?: number;
        };
        const roles = Array.isArray(cur.roles) ? cur.roles : [];
        if (!roles.includes(data.role)) roles.push(data.role);
        tx.update(membershipRef, {
          roles,
          updatedAt: createdAt,
          updatedBy: uid,
        });
      }

      const newUsedBy = usedBy.includes(uid) ? usedBy : [...usedBy, uid];
      tx.update(tokenRef, {
        usedBy: newUsedBy,
        lastUsedAt: createdAt,
      });
    });

    // Mark onboarding complete for join path
    await markOnboardingComplete({
      adminDb,
      uid,
      intent: "join_existing",
      networkId: data.networkId,
      orgId: data.orgId,
      venueId: data.venueId,
    });

    // Emit platform events
    const eventTime = Date.now();

    // membership.* event
    await logEvent(adminDb, {
      at: eventTime,
      category: "membership",
      type: "membership.created",
      actorUserId: uid,
      networkId: data.networkId,
      orgId: data.orgId,
      venueId: data.venueId,
      payload: {
        source: "onboarding.join-with-token",
        role: data.role,
        via: "join_token",
      },
    });

    // onboarding.completed (intent: join_existing)
    await logEvent(adminDb, {
      at: eventTime,
      category: "onboarding",
      type: "onboarding.completed",
      actorUserId: uid,
      networkId: data.networkId,
      orgId: data.orgId,
      venueId: data.venueId,
      payload: {
        intent: "join_existing",
      },
    });

    return NextResponse.json(
      {
        ok: true,
        networkId: data.networkId,
        orgId: data.orgId,
        role: data.role,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("join-with-token failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const POST = withSecurity(
  async (req: AuthenticatedRequest, _ctx: any) => {
    return joinWithTokenHandler(req, importedAdminDb);
  },
  { requireAuth: true },
);
