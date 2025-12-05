// [P0][APP][CODE] CreateNetworkOrg
// Tags: P0, APP, CODE
// apps/web/lib/onboarding/createNetworkOrg.ts
import type { Firestore, DocumentReference, WriteBatch } from "firebase-admin/firestore";
// Use admin firestore instance methods instead of doc/collection helpers
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

// Type definitions for batch operations
interface NetworkDoc {
  id: string;
  slug: string;
  displayName: string;
  legalName: string;
  kind: "franchise_network" | "independent_org";
  segment?: string;
  status: "pending_verification" | "active";
  ownerUserId: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface ComplianceDoc {
  networkId: string;
  adminUid: string;
  [key: string]: unknown;
  createdAt: Date;
  createdBy: string;
}

interface OrgDoc {
  id: string;
  networkId: string;
  displayName: string;
  legalName: string;
  primaryContactUid: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface VenueDoc {
  id: string;
  networkId: string;
  name: string;
  timeZone?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface MembershipDoc {
  id: string;
  networkId: string;
  userId: string;
  roles: string[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  active: boolean;
}

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

  const batch: WriteBatch = db.batch();

  const networkRef = db.collection("networks").doc() as DocumentReference<NetworkDoc>;
  const networkId = networkRef.id;

  const now = new Date();

  const networkDoc: NetworkDoc = {
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

  const complianceRef = networkRef
    .collection("compliance")
    .doc("adminResponsibilityForm") as DocumentReference<ComplianceDoc>;
  const formDoc: ComplianceDoc = {
    networkId,
    adminUid,
    ...draftForm,
    createdAt: now,
    createdBy: adminUid,
  };

  batch.set(complianceRef, formDoc);

  const orgRef = networkRef.collection("orgs").doc() as DocumentReference<OrgDoc>;
  const orgId = orgRef.id;
  const orgDoc: OrgDoc = {
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

  const venueRef = networkRef.collection("venues").doc() as DocumentReference<VenueDoc>;
  const venueId = venueRef.id;
  const venueDoc: VenueDoc = {
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

  const membershipRef = networkRef
    .collection("memberships")
    .doc() as DocumentReference<MembershipDoc>;
  const membershipId = membershipRef.id;
  const membershipDoc: MembershipDoc = {
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
