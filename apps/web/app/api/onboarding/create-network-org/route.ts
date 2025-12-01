// [P0][ONBOARDING][API] Create organization network endpoint
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const CreateNetworkOrgSchema = z.object({
  orgName: z.string(),
  venueName: z.string().optional(),
  location: z.object({}).passthrough().optional(),
  formToken: z.string(),
});

import { logEvent } from "@/src/lib/eventLog";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

export const POST = createAuthenticatedEndpoint({
  input: CreateNetworkOrgSchema,
  handler: async ({ input, context }) => {
    const adminDb = importedAdminDb;
    if (!adminDb) {
      return NextResponse.json({ ok: true, networkId: "stub-network-id", orgId: "stub-org-id", venueId: "stub-venue-id", status: "pending_verification" }, { status: 200 });
    }

    const uid = context.auth?.userId;
    const emailVerified = context.auth?.emailVerified;
    if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    if (!emailVerified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

    const { orgName, venueName, formToken, location } = input as Record<string, unknown>;
    if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });
    if (String(formToken).includes("/")) {
      return NextResponse.json({ error: "invalid_form_token" }, { status: 400 });
    }

    const locationData = (location || {}) as { street1?: string; street2?: string; city?: string; state?: string; postalCode?: string; countryCode?: string; timeZone?: string; };

    try {
      const formsRoot = adminDb.collection("compliance").doc("adminResponsibilityForms").collection("forms");
      const formRef = formsRoot.doc(String(formToken));
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
      const orgRef = adminDb.collection("orgs").doc();
      const venueRef = adminDb.collection("venues").doc();
      const membershipId = `${uid}_${orgRef.id}`;
      const membershipRef = adminDb.collection("memberships").doc(membershipId);

      await adminDb.runTransaction(async (tx: any) => {
        const createdAt = nowMs;
        tx.set(networkRef, { id: networkRef.id, name: orgName || `Network ${new Date().toISOString()}`, status: "pending_verification", createdAt, updatedAt: createdAt, createdBy: uid, adminFormToken: formToken });
        tx.set(orgRef, { id: orgRef.id, name: orgName || "Org", networkId: networkRef.id, ownerId: uid, memberCount: 1, status: "trial", createdAt, updatedAt: createdAt });
        tx.set(venueRef, {
          id: venueRef.id, name: venueName || "Main Venue", orgId: orgRef.id, networkId: networkRef.id, createdAt, updatedAt: createdAt,
          ...(Object.keys(locationData).length > 0 ? { location: { street1: locationData.street1 || "", street2: locationData.street2 || "", city: locationData.city || "", state: locationData.state || "", postalCode: locationData.postalCode || "", countryCode: locationData.countryCode || "", timeZone: locationData.timeZone || "" } } : {}),
        });
        const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");
        tx.set(complianceRef, { ...formData, networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id, attachedFromToken: formToken, attachedBy: uid, attachedAt: createdAt });
        tx.update(formRef, { attachedTo: { networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id }, immutable: true, status: "attached", attachedAt: createdAt });
        tx.set(membershipRef, { userId: uid, orgId: orgRef.id, networkId: networkRef.id, roles: ["org_owner", "admin", "manager"], createdAt, updatedAt: createdAt, createdBy: uid });
      });

      await markOnboardingComplete({ adminDb, uid, intent: "create_org", networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id });
      const now = Date.now();
      await logEvent(adminDb, { at: now, category: "network", type: "network.created", actorUserId: uid, networkId: networkRef.id, payload: { source: "onboarding.create-network-org" } });
      await logEvent(adminDb, { at: now, category: "org", type: "org.created", actorUserId: uid, networkId: networkRef.id, orgId: orgRef.id, payload: { source: "onboarding.create-network-org" } });
      await logEvent(adminDb, { at: now, category: "venue", type: "venue.created", actorUserId: uid, networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id, payload: { source: "onboarding.create-network-org" } });
      await logEvent(adminDb, { at: now, category: "onboarding", type: "onboarding.completed", actorUserId: uid, networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id, payload: { intent: "create_org" } });

      return NextResponse.json({ ok: true, networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id, status: "pending_verification" }, { status: 200 });
    } catch (err) {
      console.error("create-network-org failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
});
