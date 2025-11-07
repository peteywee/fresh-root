//[P1][API][ONBOARDING] Create Network + Org Endpoint
// Tags: api, onboarding, network, org, venue

import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { adminDb, verifyIdToken } from "@/src/lib/firebase.server";

/**
 * Creates a Network, Org, Venue, and memberships for an org-centric onboarding flow.
 *
 * Workflow:
 * 1. Verify eligibility (auth, email, role)
 * 2. Resolve AdminResponsibilityForm via formToken
 * 3. Create Network doc in Firestore (status="pending_verification")
 * 4. Create Org + Venue + memberships in a transaction
 *
 * @see docs/bible/Project_Bible_v14.0.0.md Section 4.4 (Create Network + Org Flow)
 *
 * NOTE: This is a skeleton. Fill in with actual admin SDK calls + transactions.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Compose an onboarding payload schema that re-uses package types but
  // allows the server to inject networkId/owner IDs.
  const OnboardingPayloadSchema = z.object({
    network: z.object({
      displayName: z.string().min(1).optional(),
      legalName: z.string().optional(),
      slug: z.string().optional(),
      kind: z.string().optional(),
      segment: z.string().optional(),
      environment: z.string().optional(),
      primaryRegion: z.string().optional(),
      timeZone: z.string().optional(),
      currency: z.string().optional(),
      plan: z.string().optional(),
      billingMode: z.string().optional(),
      requireMfaForAdmins: z.boolean().optional(),
      gdprMode: z.boolean().optional(),
      defaultWeekStartsOn: z.string().optional(),
      defaultMinShiftLengthHours: z.number().optional(),
      defaultMaxShiftLengthHours: z.number().optional(),
      features: z.record(z.any()).optional(),
      tags: z.array(z.string()).optional(),
      ownerUserId: z.string().optional(),
    }).optional(),
    org: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      legalName: z.string().optional(),
      primaryContactUid: z.string().optional(),
      isIndependent: z.boolean().optional(),
      notes: z.string().optional(),
      industry: z.string().optional(),
      size: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      settings: z.record(z.any()).optional(),
    }),
    venue: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.string().optional(),
      addressLine1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      capacity: z.number().optional(),
      capacityHint: z.number().optional(),
      timezone: z.string().optional(),
      contactPhone: z.string().optional(),
      contactEmail: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    formToken: z.string().optional(),
  });

  type OnboardingPayload = z.infer<typeof OnboardingPayloadSchema>;

  const parsed = OnboardingPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation", issues: parsed.error.format() }, { status: 422 });
  }

  const parsedData = parsed.data as any;
  const { network: networkInput, org: orgInput, venue: venueInput, formToken } = parsedData;

  // Ensure Admin SDK is available
  if (!adminDb) {
    return NextResponse.json({ ok: false, error: "admin_sdk_uninitialized" }, { status: 503 });
  }

  // Auth: try to read Authorization Bearer token and verify. If missing, we still allow
  // server-driven ownerUserId in the payload, but prefer verified token for audit fields.
  const authHeader = req.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.*)$/i);
  let uid: string | undefined;
  if (match) {
    try {
      const token = match[1];
      const claims = await verifyIdToken(token);
      // token may contain uid in many shapes depending on auth provider
      // admin SDK verifyIdToken returns { uid }
      // @ts-ignore
      uid = (claims as any).uid || (claims as any).sub;
    } catch (err) {
      // do not fail here — allow payload ownerUserId below, but log for debugging
      console.warn("verifyIdToken failed:", err);
    }
  }

  // Fill required ownerUserId from token if not provided by caller
  const ownerUserId = (networkInput as any).ownerUserId || uid;
  if (!ownerUserId) {
    return NextResponse.json({ ok: false, error: "missing_owner" }, { status: 401 });
  }

  // Prepare document refs and data
  const networksCol = adminDb.collection("networks");
  const networkRef = networksCol.doc();
  const networkId = networkRef.id;

  const now = Timestamp.now();

  const networkDoc = {
    id: networkId,
    slug: (networkInput as any).slug || `${(networkInput as any).displayName?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${networkId.slice(0, 6)}`,
    displayName: (networkInput as any).displayName,
    legalName: (networkInput as any).legalName || undefined,
    kind: (networkInput as any).kind || "independent_org",
    segment: (networkInput as any).segment || "other",
    status: "pending_verification",
    environment: (networkInput as any).environment || "production",
    primaryRegion: (networkInput as any).primaryRegion || "US",
    timeZone: (networkInput as any).timeZone || "UTC",
    currency: (networkInput as any).currency || "USD",
    plan: (networkInput as any).plan || "free",
    billingMode: (networkInput as any).billingMode || "none",
    requireMfaForAdmins: (networkInput as any).requireMfaForAdmins ?? true,
    gdprMode: (networkInput as any).gdprMode ?? false,
    defaultWeekStartsOn: (networkInput as any).defaultWeekStartsOn ?? "monday",
    defaultMinShiftLengthHours: (networkInput as any).defaultMinShiftLengthHours ?? 2,
    defaultMaxShiftLengthHours: (networkInput as any).defaultMaxShiftLengthHours ?? 12,
    features: (networkInput as any).features || {},
    ownerUserId,
    tags: (networkInput as any).tags || [],
    createdAt: now,
    createdBy: ownerUserId,
    updatedAt: now,
    updatedBy: ownerUserId,
  } as const;

  // Org doc
  const orgsCol = adminDb.collection(`networks/${networkId}/orgs`);
  const orgRef = orgsCol.doc();
  const orgId = orgRef.id;
  const orgDoc = {
    id: orgId,
    networkId,
    name: orgInput.name,
    description: orgInput.description || undefined,
    legalName: orgInput.legalName || undefined,
    primaryContactUid: orgInput.primaryContactUid || undefined,
    isIndependent: orgInput.isIndependent ?? true,
    notes: orgInput.notes || undefined,
    industry: orgInput.industry || undefined,
    size: orgInput.size || undefined,
    status: "active",
    subscriptionTier: "free",
    ownerId: ownerUserId,
    memberCount: 1,
    settings: orgInput.settings || {},
    logoUrl: orgInput.logoUrl || undefined,
    websiteUrl: orgInput.websiteUrl || undefined,
    contactEmail: orgInput.contactEmail || undefined,
    contactPhone: orgInput.contactPhone || undefined,
    createdAt: now.toMillis ? now.toMillis() : Date.now(),
    updatedAt: now.toMillis ? now.toMillis() : Date.now(),
    createdBy: ownerUserId,
    updatedBy: ownerUserId,
  } as const;

  // Venue (optional)
  let venueId: string | null = null;
  let venueRef: any;
  let venueDoc: any;
  if (venueInput) {
    const venuesCol = adminDb.collection(`networks/${networkId}/venues`);
    venueRef = venuesCol.doc();
    venueId = venueRef.id;
    venueDoc = {
      id: venueId,
      networkId,
      name: venueInput.name,
      description: venueInput.description || undefined,
      type: venueInput.type || "indoor",
      addressLine1: venueInput.addressLine1 || undefined,
      city: venueInput.city || undefined,
      state: venueInput.state || undefined,
      postalCode: venueInput.postalCode || undefined,
      country: venueInput.country || undefined,
      lat: venueInput.lat || undefined,
      lng: venueInput.lng || undefined,
      capacity: venueInput.capacity || undefined,
      capacityHint: venueInput.capacityHint || undefined,
      timezone: venueInput.timezone || venueInput.timeZone || undefined,
      contactPhone: venueInput.contactPhone || undefined,
      contactEmail: venueInput.contactEmail || undefined,
      notes: venueInput.notes || undefined,
      createdBy: ownerUserId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // Membership: create root membership record (conservative)
  const membershipsCol = adminDb.collection("memberships");
  const membershipId = `${ownerUserId}_${orgId}`;
  const membershipRef = membershipsCol.doc(membershipId);
  const membershipDoc = {
    uid: ownerUserId,
    orgId,
    roles: ["org_owner"],
    status: "active",
    invitedBy: ownerUserId,
    joinedAt: Date.now(),
    updatedAt: Date.now(),
    createdAt: Date.now(),
  };

  // Run a single transaction to create the network, org, optional venue, and membership.
  try {
    await adminDb.runTransaction(async (tx) => {
      tx.set(networkRef, networkDoc as any);
      tx.set(orgRef, orgDoc as any);
      if (venueInput && venueRef) tx.set(venueRef, venueDoc as any);
      tx.set(membershipRef, membershipDoc as any);

      // Optionally persist a reference to the admin form token for audit
      if (formToken) {
        const formsRef = adminDb.collection("onboarding_forms").doc(formToken);
        tx.set(formsRef, { usedByNetworkId: networkId, usedAt: Timestamp.now() }, { merge: true });
      }
    });
  } catch (err) {
    console.error("onboarding transaction failed", err);
    return NextResponse.json({ ok: false, error: "transaction_failed", details: String(err) }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      networkId,
      orgId,
      venueId,
      status: "pending_verification",
    },
    { status: 201 },
  );
}
