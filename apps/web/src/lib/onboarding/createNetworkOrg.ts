// [P0][FIREBASE][HELPER] Create network/org/venue helper
// Tags: FIREBASE, ONBOARDING, HELPERS
import type { DocumentReference, Firestore, WriteBatch } from "firebase-admin/firestore";
// Use the admin firestore instance from server helper
import { adminDb } from "@/src/lib/firebase.server";
import { CreateNetworkOrgPayload } from "@fresh-schedules/types";
import { Timestamp } from "firebase-admin/firestore";
import { consumeAdminFormDraft, getAdminFormDraft } from "./adminFormDrafts";

const dbDefault = adminDb as Firestore | undefined;

export type CreateNetworkOrgResult = {
  networkId: string;
  orgId: string;
  venueId: string;
  status: string;
};

// Type definitions for batch documents
interface NetworkDoc {
  id: string;
  slug: string;
  displayName: string;
  legalName: string | null;
  kind: "franchise_network" | "independent_org";
  segment?: string;
  status: "pending_verification" | "active";
  ownerUserId: string;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

interface ComplianceDoc {
  networkId: string;
  adminUid: string;
  [key: string]: unknown;
  createdAt: Timestamp;
  createdBy: string;
}

interface OrgDoc {
  id: string;
  networkId: string;
  displayName: string;
  primaryContactUid: string;
  createdAt: Timestamp;
  createdBy: string;
}

interface VenueDoc {
  id: string;
  networkId: string;
  name: string;
  timeZone: string;
  createdAt: Timestamp;
  createdBy: string;
}

interface MembershipDoc {
  id: string;
  networkId: string;
  userId: string;
  roles: string[];
  createdAt: Timestamp;
  createdBy: string;
}

export async function createNetworkWithOrgAndVenue(
  adminUid: string,
  payload: CreateNetworkOrgPayload,
  injectedDb?: Firestore,
): Promise<CreateNetworkOrgResult> {
  const root = injectedDb ?? dbDefault;
  if (!root) throw new Error("admin_db_not_initialized");

  // Extract and validate payload fields
  const basicsData = payload.basics;
  const venueData = payload.venue;
  const tokenString = payload.formToken;

  // Type guard: ensure basics exists (required by schema)
  if (!basicsData) throw new Error("basics_required");
  if (!tokenString) throw new Error("form_token_required");

  const draft = await getAdminFormDraft(tokenString);
  if (!draft) throw new Error("admin_form_not_found");
  if (draft.userId !== adminUid) throw new Error("admin_form_ownership_mismatch");

  const networkRef = root.collection("networks").doc() as DocumentReference<NetworkDoc>;
  const networkId = networkRef.id;
  const now = Timestamp.now();

  const batch: WriteBatch = root.batch();

  const networkDoc: NetworkDoc = {
    id: networkId,
    slug: networkId,
    displayName: basicsData.orgName ?? networkId,
    legalName:
      (draft.form as { data?: { legalName?: string } })?.data?.legalName ?? basicsData.orgName ?? null,
    kind: basicsData.hasCorporateAboveYou ? "franchise_network" : "independent_org",
    segment: basicsData.segment,
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
    ...draft.form,
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(complianceRef, formDoc);

  const orgRef = networkRef.collection("orgs").doc() as DocumentReference<OrgDoc>;
  const orgId = orgRef.id;
  const orgDoc: OrgDoc = {
    id: orgId,
    networkId,
    displayName: basicsData.orgName ?? "Org",
    primaryContactUid: adminUid,
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(orgRef, orgDoc);

  const venueRef = networkRef.collection("venues").doc() as DocumentReference<VenueDoc>;
  const venueId = venueRef.id;
  const venueDoc: VenueDoc = {
    id: venueId,
    networkId,
    name: venueData?.venueName ?? "Main Venue",
    timeZone: venueData?.timeZone ?? "UTC",
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(venueRef, venueDoc);

  const membershipRef = networkRef
    .collection("memberships")
    .doc() as DocumentReference<MembershipDoc>;
  const membershipDoc: MembershipDoc = {
    id: membershipRef.id,
    networkId,
    userId: adminUid,
    roles: ["network_owner"],
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(membershipRef, membershipDoc);

  // Commit batch
  await batch.commit();

  await consumeAdminFormDraft({ formToken: tokenString, expectedUserId: adminUid });

  return { networkId, orgId, venueId, status: "pending_verification" };
}

export default { createNetworkWithOrgAndVenue };
