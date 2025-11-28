// [P1][FIREBASE][HELPER] Admin form drafts helper
// Tags: FIREBASE, ONBOARDING, HELPERS
import type { CreateAdminResponsibilityFormInput } from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import { type Firestore, type DocumentReference, Timestamp } from "firebase-admin/firestore";

import { adminDb } from "@/src/lib/firebase.server";

const db = adminDb as Firestore | undefined;

export type AdminFormDraft = {
  id: string;
  userId: string;
  payload: CreateAdminResponsibilityFormInput;
  ipAddress: string;
  userAgent: string;
  createdAt: Timestamp | number;
  consumedAt?: Timestamp | null;
};

function generateFormToken() {
  return randomBytes(24).toString("hex");
}

export async function saveAdminFormDraft(
  userId: string,
  payload: CreateAdminResponsibilityFormInput,
  meta: { ipAddress: string; userAgent: string },
  injectedDb?: Firestore,
): Promise<string> {
  const token = generateFormToken();
  const root = injectedDb ?? db;
  if (!root) throw new Error("admin-db-not-initialized");

  const docRef = root.collection("adminFormDrafts").doc(token) as DocumentReference<AdminFormDraft>;

  const draft: AdminFormDraft = {
    id: token,
    userId,
    payload,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    createdAt: Timestamp.now(),
    consumedAt: null,
  };

  await docRef.set(draft);
  return token;
}

export async function loadAdminFormDraft(
  formToken: string,
  injectedDb?: Firestore,
): Promise<AdminFormDraft | null> {
  if (!formToken) return null;
  const root = injectedDb ?? db;
  if (!root) return null;

  const docRef = root.collection("adminFormDrafts").doc(formToken);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  const data = snap.data() as AdminFormDraft;
  return data;
}

export async function markAdminFormDraftConsumed(formToken: string, injectedDb?: Firestore) {
  const root = injectedDb ?? db;
  if (!root) throw new Error("admin-db-not-initialized");
  const docRef = root
    .collection("adminFormDrafts")
    .doc(formToken) as DocumentReference<AdminFormDraft>;
  await docRef.update({ consumedAt: Timestamp.now() });
}

export default {
  saveAdminFormDraft,
  loadAdminFormDraft,
  markAdminFormDraftConsumed,
};
