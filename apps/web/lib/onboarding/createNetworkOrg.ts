// [P0][APP][CODE] CreateNetworkOrg
// Tags: P0, APP, CODE
// apps/web/lib/onboarding/createNetworkOrg.ts
import type { Firestore } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "../firebase-admin";
import { consumeAdminFormDraft } from "./adminFormDrafts";

// Minimal payload shape used by this helper. Keep local to avoid coupling on types package here.
export type CreateNetworkOrgPayload = {
  basics: {
    orgName: string;
    hasCorporateAboveYou?: boolean;
    segment?: string;
    approxLocations?: number;
  };
  venue: {
    venueName: string;
    timeZone?: string;
  };
  formToken: string;
};

const dbDefault = getFirebaseAdminDb();

export type CreateNetworkOrgResult = {
  networkId: string;
  orgId: string;
  venueId: string;
  status: string;
};

export async function createNetworkWithOrgAndVenue(
  adminUid: string,
  payload: CreateNetworkOrgPayload,
  injectedDb?: Firestore,
): Promise<CreateNetworkOrgResult> {
  const db = injectedDb ?? dbDefault;
  const { basics, venue, formToken } = payload;

  const consumed = await consumeAdminFormDraft({ formToken, expectedUserId: adminUid });
  if (!consumed) throw new Error("admin_form_not_found");

  const draftForm = consumed.form;

  const batch = db.batch();

  const networkRef = db.collection("networks").doc();
  const networkId = networkRef.id;

  const now = new Date();

  const networkDoc = {
    id: networkId,
    slug: networkId,
    displayName: basics.orgName,
    legalName: (draftForm as { legalName?: string }).legalName ?? basics.orgName,
    kind: basics.hasCorporateAboveYou ? "franchise_network" : "independent_org",
    segment: basics.segment,
    status: "pending_verification",
    ownerUserId: adminUid,
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };

  batch.set(networkRef, networkDoc);

  const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");
  const formDoc = {
    networkId,
    adminUid,
    ...draftForm,
    createdAt: now,
    createdBy: adminUid,
  };

  batch.set(complianceRef, formDoc);

  const orgRef = networkRef.collection("orgs").doc();
  const orgId = orgRef.id;
  const orgDoc = {
    id: orgId,
    networkId,
    displayName: basics.orgName,
    legalName: (draftForm as { legalName?: string }).legalName ?? basics.orgName,
    primaryContactUid: adminUid,
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };

  batch.set(orgRef, orgDoc);

  const venueRef = networkRef.collection("venues").doc();
  const venueId = venueRef.id;
  const venueDoc = {
    id: venueId,
    networkId,
    name: venue.venueName,
    timeZone: venue.timeZone,
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };

  batch.set(venueRef, venueDoc);

  const membershipRef = networkRef.collection("memberships").doc();
  const membershipId = membershipRef.id;
  const membershipDoc = {
    id: membershipId,
    networkId,
    userId: adminUid,
    roles: ["network_owner", "network_admin"],
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
    active: true,
  };

  batch.set(membershipRef, membershipDoc);

  await batch.commit();

  // mark consumption handled by consumeAdminFormDraft above (atomic)

  return { networkId, orgId, venueId, status: "pending_verification" };
}
