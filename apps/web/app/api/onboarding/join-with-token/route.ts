// [P0][ONBOARDING][API] Join network with token endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const JoinWithTokenSchema = z.object({ token: z.string() });

/* eslint-disable @typescript-eslint/no-explicit-any */

import { logEvent } from "@/src/lib/eventLog";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

type JoinTokenDoc = { networkId: string; orgId: string; role: string; venueId?: string; expiresAt?: number; disabled?: boolean; usedBy?: string[]; maxUses?: number; };

export const POST = createAuthenticatedEndpoint({
  input: JoinWithTokenSchema,
  handler: async ({ input, context }) => {
    const adminDb = importedAdminDb;
    if (!adminDb) {
      return NextResponse.json({ ok: true, networkId: "stub-network-id", orgId: "stub-org-id", role: "staff" }, { status: 200 });
    }

    const uid = context.auth?.userId;
    if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

    const token = input.token;
    if (!token) return NextResponse.json({ error: "missing_token" }, { status: 422 });
    if (token.includes("/")) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

    try {
      const tokenRef = adminDb.collection("join_tokens").doc(token);
      const snap = await tokenRef.get();
      if (!snap.exists) return NextResponse.json({ error: "token_not_found" }, { status: 404 });

      const data = snap.data() as JoinTokenDoc;
      const now = Date.now();
      if (data.disabled) return NextResponse.json({ error: "token_disabled" }, { status: 403 });
      if (typeof data.expiresAt === "number" && data.expiresAt < now) return NextResponse.json({ error: "token_expired" }, { status: 410 });
      const usedBy = Array.isArray(data.usedBy) ? data.usedBy : [];
      if (typeof data.maxUses === "number" && usedBy.length >= data.maxUses) return NextResponse.json({ error: "token_exhausted" }, { status: 409 });
      if (!data.networkId || !data.orgId || !data.role) return NextResponse.json({ error: "token_misconfigured" }, { status: 500 });

      const membershipId = `${uid}_${data.orgId}`;
      const membershipRef = adminDb.collection("memberships").doc(membershipId);

      await adminDb.runTransaction(async (tx: any) => {
        const existing = await tx.get(membershipRef);
        const createdAt = now;
        if (!existing.exists) {
          tx.set(membershipRef, { userId: uid, orgId: data.orgId, networkId: data.networkId, roles: [data.role], createdAt, updatedAt: createdAt, createdBy: uid });
        } else {
          const cur = existing.data() as { roles?: string[]; updatedAt?: number; };
          const roles = Array.isArray(cur.roles) ? cur.roles : [];
          if (!roles.includes(data.role)) roles.push(data.role);
          tx.update(membershipRef, { roles, updatedAt: createdAt, updatedBy: uid });
        }
        const newUsedBy = usedBy.includes(uid) ? usedBy : [...usedBy, uid];
        tx.update(tokenRef, { usedBy: newUsedBy, lastUsedAt: createdAt });
      });

      await markOnboardingComplete({ adminDb, uid, intent: "join_existing", networkId: data.networkId, orgId: data.orgId, venueId: data.venueId });
      const eventTime = Date.now();
      await logEvent(adminDb, { at: eventTime, category: "membership", type: "membership.created", actorUserId: uid, networkId: data.networkId, orgId: data.orgId, venueId: data.venueId, payload: { source: "onboarding.join-with-token", role: data.role, via: "join_token" } });
      await logEvent(adminDb, { at: eventTime, category: "onboarding", type: "onboarding.completed", actorUserId: uid, networkId: data.networkId, orgId: data.orgId, venueId: data.venueId, payload: { intent: "join_existing" } });

      return NextResponse.json({ ok: true, networkId: data.networkId, orgId: data.orgId, role: data.role }, { status: 200 });
    } catch (err) {
      console.error("join-with-token failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
});
