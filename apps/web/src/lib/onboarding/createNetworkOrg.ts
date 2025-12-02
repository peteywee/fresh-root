// [P1][FIREBASE][HELPER] Create network/org/venue helper
// Tags: FIREBASE, ONBOARDING, HELPERS
import type { CreateNetworkOrgPayload } from "@fresh-schedules/types";
import {
  type Firestore,
  type DocumentReference,
  type WriteBatch,
  Timestamp,
  doc,
  collection,
} from "firebase-admin/firestore";

import { loadAdminFormDraft, markAdminFormDraftConsumed } from "./adminFormDrafts";

import { adminDb } from "@/src/lib/firebase.server";

const db = adminDb as Firestore | undefined;

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
  ipAddress?: string;
  userAgent?: string;
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
  const root = injectedDb ?? db;
  if (!root) throw new Error("admin_db_not_initialized");

  const { basics, venue, formToken } = payload;

  const draft = await loadAdminFormDraft(formToken, injectedDb);
  if (!draft) throw new Error("admin_form_not_found");
  if (draft.userId !== adminUid) throw new Error("admin_form_ownership_mismatch");

  const networkRef = doc(collection(root, "networks")) as DocumentReference<NetworkDoc>;
  const networkId = networkRef.id;
  const now = Timestamp.now();

  const batch: WriteBatch = root.batch();

  const networkDoc: NetworkDoc = {
    id: networkId,
    slug: networkId,
    displayName: basics?.orgName ?? networkId,
    legalName: (draft.payload as { data?: { legalName?: string } })?.data?.legalName ?? basics?.orgName ?? null,
    status: "pending_verification",
    ownerUserId: adminUid,
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };

  batch.set(networkRef, networkDoc);

  const complianceRef = doc(
    collection(networkRef, "compliance"),
    "adminResponsibilityForm"
  ) as DocumentReference<ComplianceDoc>;
  const formDoc: ComplianceDoc = {
    networkId,
    adminUid,
    ...draft.payload,
    ipAddress: draft.ipAddress,
    userAgent: draft.userAgent,
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(complianceRef, formDoc);

  const orgRef = doc(collection(networkRef, "orgs")) as DocumentReference<OrgDoc>;
  const orgId = orgRef.id;
  const orgDoc: OrgDoc = {
    id: orgId,
    networkId,
    displayName: basics?.orgName ?? "Org",
    primaryContactUid: adminUid,
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(orgRef, orgDoc);

  const venueRef = doc(collection(networkRef, "venues")) as DocumentReference<VenueDoc>;
  const venueId = venueRef.id;
  const venueDoc: VenueDoc = {
    id: venueId,
    networkId,
    name: venue?.venueName ?? "Main Venue",
    timeZone: venue?.timeZone ?? "UTC",
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(venueRef, venueDoc);

  const membershipRef = doc(collection(networkRef, "memberships")) as DocumentReference<MembershipDoc>;
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

  await markAdminFormDraftConsumed(formToken, injectedDb);

  return { networkId, orgId, venueId, status: "pending_verification" };
}

export default { createNetworkWithOrgAndVenue };
