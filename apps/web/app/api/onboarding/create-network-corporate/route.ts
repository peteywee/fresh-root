// [P0][ONBOARDING][API] Create corporate network endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const CreateNetworkCorporateSchema = z.object({
  corporateName: z.string(),
  brandName: z.string().optional(),
  industry: z.string().optional(),
  approxLocations: z.number().optional(),
  formToken: z.string(),
});

/* eslint-disable @typescript-eslint/no-explicit-any */

import { logEvent } from "@/src/lib/eventLog";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

export const POST = createAuthenticatedEndpoint({
  input: CreateNetworkCorporateSchema,
  handler: async ({ input, context }) => {
    const adminDb = importedAdminDb;
    
    if (!adminDb) {
      return NextResponse.json({ ok: true, networkId: "stub-network-id", corpId: "stub-corp-id", status: "pending_verification" }, { status: 200 });
    }

    const uid = context.auth?.userId;
    const emailVerified = context.auth?.emailVerified;

    if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    if (!emailVerified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

    const { corporateName, brandName, industry, approxLocations, formToken } = input;
    if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });
    if (String(formToken).includes("/")) {
      return NextResponse.json({ error: "invalid_form_token" }, { status: 400 });
    }

    const formsRoot = adminDb.collection("compliance").doc("adminResponsibilityForms").collection("forms");
    const formRef = formsRoot.doc(String(formToken));

    try {
      const formSnap = await formRef.get();
      if (!formSnap.exists) {
        return NextResponse.json({ error: "form_token_not_found" }, { status: 404 });
      }

      const formData = formSnap.data() as Record<string, unknown>;
      const nowMs = Date.now();
      if (typeof formData.expiresAt === "number" && formData.expiresAt < nowMs) {
        return NextResponse.json({ error: "form_token_expired" }, { status: 410 });
      }
      if (formData.createdBy !== uid) {
        return NextResponse.json({ error: "token_ownership_mismatch", details: "This form token was not created by you" }, { status: 403 });
      }
      if (formData.immutable === true || formData.attachedTo) {
        return NextResponse.json({ error: "form_already_attached" }, { status: 409 });
      }

      const networkRef = adminDb.collection("networks").doc();
      const corpRef = networkRef.collection("corporate").doc();

      await adminDb.runTransaction(async (tx: any) => {
        const createdAt = nowMs;
        tx.set(networkRef, {
          id: networkRef.id, name: corporateName || `Corporate Network ${new Date().toISOString()}`,
          displayName: corporateName || null, status: "pending_verification", kind: "corporate_network",
          industry: industry || null, approxLocations: approxLocations || null, ownerUserId: uid,
          createdAt, updatedAt: createdAt, createdBy: uid, adminFormToken: formToken,
        });
        tx.set(corpRef, {
          id: corpRef.id, networkId: networkRef.id, name: corporateName || "Corporate",
          brandName: brandName || null, industry: industry || null, approxLocations: approxLocations || null,
          contactUserId: uid, createdAt, updatedAt: createdAt, createdBy: uid,
        });
        const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");
        tx.set(complianceRef, { ...formData, networkId: networkRef.id, corporateId: corpRef.id, attachedFromToken: formToken, attachedBy: uid, attachedAt: createdAt });
        tx.update(formRef, { attachedTo: { networkId: networkRef.id, corpId: corpRef.id }, immutable: true, status: "attached", attachedAt: createdAt });
        const membershipId = `${uid}_network_${networkRef.id}`;
        const membershipRef = adminDb.collection("memberships").doc(membershipId);
        tx.set(membershipRef, { userId: uid, networkId: networkRef.id, roles: ["network_owner", "corporate_admin"], createdAt, updatedAt: createdAt, createdBy: uid });
      });

      await markOnboardingComplete({ adminDb, uid, intent: "create_corporate", networkId: networkRef.id, orgId: corpRef.id, venueId: undefined });
      const now = Date.now();
      await logEvent(adminDb, { at: now, category: "network", type: "network.created", actorUserId: uid, networkId: networkRef.id, payload: { source: "onboarding.create-network-corporate", kind: "corporate_network" } });
      await logEvent(adminDb, { at: now, category: "membership", type: "membership.created", actorUserId: uid, networkId: networkRef.id, payload: { source: "onboarding.create-network-corporate", roles: ["network_owner", "corporate_admin"] } });
      await logEvent(adminDb, { at: now, category: "onboarding", type: "onboarding.completed", actorUserId: uid, networkId: networkRef.id, orgId: corpRef.id, payload: { intent: "create_corporate" } });

      return NextResponse.json({ ok: true, networkId: networkRef.id, corpId: corpRef.id, status: "pending_verification" }, { status: 200 });
    } catch (err) {
      console.error("create-network-corporate failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
});
