// [P1][FIREBASE][HELPER] Create network/org/venue helper
// Tags: FIREBASE, ONBOARDING, HELPERS
import type { CreateNetworkOrgPayload } from "@fresh-schedules/types";
import type { Firestore, DocumentReference, WriteBatch } from "firebase-admin/firestore";

import { loadAdminFormDraft, markAdminFormDraftConsumed } from "./adminFormDrafts";

import { adminDb, adminSdk } from "@/src/lib/firebase.server";

const db = adminDb as Firestore | undefined;

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
  const root = injectedDb ?? db;
  if (!root) throw new Error("admin_db_not_initialized");

  const { basics, venue, formToken } = payload;

  const draft = await loadAdminFormDraft(formToken, injectedDb);
  if (!draft) throw new Error("admin_form_not_found");
  if (draft.userId !== adminUid) throw new Error("admin_form_ownership_mismatch");

  const networkRef = root.collection("networks").doc() as DocumentReference<
    Record<string, unknown>
  >;
  const networkId = networkRef.id;
  const now = adminSdk.firestore.Timestamp.now();

  const batch: WriteBatch = root.batch();

  const networkDoc = {
    id: networkId,
    slug: networkId,
    displayName: basics?.orgName ?? networkId,
    legalName: draft.payload.data?.legalName ?? basics?.orgName ?? null,
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
    .doc("adminResponsibilityForm") as DocumentReference<Record<string, unknown>>;
  const formDoc = {
    networkId,
    adminUid,
    ...draft.payload,
    ipAddress: draft.ipAddress,
    userAgent: draft.userAgent,
    createdAt: now,
    createdBy: adminUid,
  };
  batch.set(complianceRef, formDoc);

  const orgRef = networkRef.collection("orgs").doc() as DocumentReference<Record<string, unknown>>;
  const orgId = orgRef.id;
  batch.set(orgRef, {
    id: orgId,
    networkId,
    displayName: basics?.orgName ?? "Org",
    primaryContactUid: adminUid,
    createdAt: now,
    createdBy: adminUid,
  });

  const venueRef = networkRef.collection("venues").doc() as DocumentReference<
    Record<string, unknown>
  >;
  const venueId = venueRef.id;
  batch.set(venueRef, {
    id: venueId,
    networkId,
    name: venue?.venueName ?? "Main Venue",
    timeZone: venue?.timeZone ?? "UTC",
    createdAt: now,
    createdBy: adminUid,
  });

  const membershipRef = networkRef.collection("memberships").doc() as DocumentReference<
    Record<string, unknown>
  >;
  batch.set(membershipRef, {
    id: membershipRef.id,
    networkId,
    userId: adminUid,
    roles: ["network_owner"],
    createdAt: now,
    createdBy: adminUid,
  });

  // Commit batch
  if (typeof batch.commit === "function") {
    await batch.commit();
  } else {
    const maybeRoot: any = root;
    if (maybeRoot && typeof maybeRoot.commit === "function") {
      await maybeRoot.commit();
    }
  }

  await markAdminFormDraftConsumed(formToken, injectedDb);

  return { networkId, orgId, venueId, status: "pending_verification" };
}

export default { createNetworkWithOrgAndVenue };
