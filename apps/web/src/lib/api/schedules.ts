// [P1][FIREBASE][HELPERS] Shift management helpers
// Tags: P1, FIREBASE, HELPERS, SHIFTS

export interface ShiftDoc {
  id: string;
  userId: string;
  role: string;
  startTs: string;
  endTs: string;
  createdAt: unknown;
}

export interface ScheduleDoc {
  id?: string;
  startDate: string;
  endDate: string;
  createdAt?: unknown;
  state: "draft" | "published" | "archived";
  publishedAt?: unknown;
}

export interface ListArgs {
  orgId: string;
  scheduleId: string;
  startISO: string;
  endISO: string;
}

import { collection, query, getDocs, setDoc, Query, DocumentData, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebaseClient";

export async function addShift({
  userId,
  role,
  startTs,
  endTs,
}: {
  userId: string;
  role: string;
  startTs: string;
  endTs: string;
}) {
  if (!db) throw new Error("Firestore database is not initialized");

  const ref = doc(collection(db, "shifts"));

  const body = { userId, role, startTs, endTs, createdAt: new Date() };
  await setDoc(ref, body as DocumentData);
  return { ...body, id: ref.id } as ShiftDoc;
}

export async function listShiftsForRange({ orgId, scheduleId, startISO, endISO }: ListArgs) {
  if (!db) throw new Error("Firestore database is not initialized");

  const qs: Query<ShiftDoc> = query(
    collection(db, `organizations/${orgId}/schedules/${scheduleId}/shifts`),
  ) as Query<ShiftDoc>;

  const snap = await getDocs(qs);
  const rows: ShiftDoc[] = snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id } as ShiftDoc;
  });

  return rows.filter((s) => s.startTs >= startISO && s.startTs <= endISO);
}

export async function publishSchedule(_scheduleId: string) {
  return { success: true };
}
