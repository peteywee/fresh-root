// [P0][API][CODE] Schedules - Client SDK library with improved typing
// Tags: P0, API, CODE

import { collection, doc, getDocs, query, serverTimestamp, setDoc, Query, DocumentReference } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";

import { db } from "../../../app/lib/firebaseClient";

/**
 * Shift document from Firestore
 */
export interface ShiftDoc {
  id: string;
  userId: string;
  role: string;
  startTs: string;
  endTs: string;
  createdAt: unknown;
}

/**
 * Schedule document from Firestore (client-side view)
 */
export interface ScheduleDoc {
  id?: string;
  startDate: string;
  endDate: string;
  createdAt?: unknown;
  state: "draft" | "published" | "archived";
  publishedAt?: unknown;
}

type CreateScheduleArgs = { orgId: string; startDate: string; endDate: string };
type PublishArgs = { orgId: string; scheduleId: string };
type AddShiftArgs = {
  orgId: string;
  scheduleId: string;
  userId: string;
  role: string;
  startTs: string;
  endTs: string;
};
type ListArgs = { orgId: string; scheduleId: string; startISO: string; endISO: string };

/**
 * Helper to convert timestamp to ISO string for comparison
 */
function toISOString(timestamp: unknown): string {
  if (!timestamp) return "";
  if (typeof timestamp === "object" && "toDate" in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return String(timestamp);
}

/**
 * Create a new schedule (draft state)
 */
export async function createWeekOrMonth({ orgId, startDate, endDate }: CreateScheduleArgs) {
  if (!db)
    throw new Error(
      "Firestore database is not initialized. Check your Firebase configuration and NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  
  const ref: DocumentReference<ScheduleDoc> = doc(
    collection(db, `organizations/${orgId}/schedules`),
  ) as DocumentReference<ScheduleDoc>;
  
  await setDoc(ref, { startDate, endDate, createdAt: serverTimestamp(), state: "draft" });
  return { scheduleId: ref.id };
}

/**
 * Add a shift to a schedule
 */
export async function addShift({ orgId, scheduleId, userId, role, startTs, endTs }: AddShiftArgs) {
  if (!db) throw new Error("Firestore database is not initialized");
  
  const ref: DocumentReference<ShiftDoc> = doc(
    collection(db, `organizations/${orgId}/schedules/${scheduleId}/shifts`),
  ) as DocumentReference<ShiftDoc>;
  
  const body: ShiftDoc = { userId, role, startTs, endTs, createdAt: serverTimestamp() } as ShiftDoc;
  await setDoc(ref, body as DocumentData);
  return { id: ref.id, ...body };
}

/**
 * List shifts for a date range (basic client-side filtering)
 */
export async function listShiftsForRange({ orgId, scheduleId, startISO, endISO }: ListArgs) {
  // Basic: fetch all and filter client-side. For prod, add composite indexes and range query.
  if (!db) throw new Error("Firestore database is not initialized");
  
  const qs: Query<ShiftDoc> = query(
    collection(db, `organizations/${orgId}/schedules/${scheduleId}/shifts`),
  ) as Query<ShiftDoc>;
  
  const snap = await getDocs(qs);
  const rows: ShiftDoc[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShiftDoc));
  
  return rows.filter((s) => s.startTs >= startISO && s.startTs <= endISO);
}

/**
 * Publish a schedule (mark as published and create notification)
 */
export async function publishSchedule({ orgId, scheduleId }: PublishArgs) {
  if (!db) throw new Error("Firestore database is not initialized");
  
  const scheduleRef: DocumentReference<ScheduleDoc> = doc(
    db,
    `organizations/${orgId}/schedules/${scheduleId}`,
  ) as DocumentReference<ScheduleDoc>;
  
  await setDoc(
    scheduleRef,
    { state: "published" as const, publishedAt: serverTimestamp() },
    { merge: true },
  );

  // Create in-app message
  interface MessageDoc {
    type: string;
    title: string;
    body: string;
    targets: string;
    recipients: unknown[];
    scheduleId: string;
    createdAt: unknown;
  }
  
  const msgRef: DocumentReference<MessageDoc> = doc(
    collection(db, `organizations/${orgId}/messages`),
  ) as DocumentReference<MessageDoc>;
  
  await setDoc(msgRef, {
    type: "publish_notice",
    title: "Schedule Published",
    body: "The latest schedule has been published. Check your shifts.",
    targets: "members",
    recipients: [], // members implied by targets
    scheduleId,
    createdAt: serverTimestamp(),
  } as DocumentData);

  // OPTIONAL: trigger FCM via callable function or HTTP (not included here)
  return { ok: true };
}
