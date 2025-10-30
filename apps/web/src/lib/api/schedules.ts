import { collection, doc, getDocs, query, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '../../../app/lib/firebaseClient';

type CreateScheduleArgs = { orgId: string; startDate: string; endDate: string; };
type PublishArgs = { orgId: string; scheduleId: string; };
type AddShiftArgs = { orgId: string; scheduleId: string; userId: string; role: string; startTs: string; endTs: string; };
type ListArgs = { orgId: string; scheduleId: string; startISO: string; endISO: string; };

interface Shift {
  id: string;
  userId: string;
  role: string;
  startTs: string;
  endTs: string;
  createdAt: unknown;
}

export async function createWeekOrMonth({ orgId, startDate, endDate }: CreateScheduleArgs) {
  if (!db) throw new Error('Firestore database is not initialized. Check your Firebase configuration and NEXT_PUBLIC_FIREBASE_* environment variables.');
  const ref = doc(collection(db, `organizations/${orgId}/schedules`));
  await setDoc(ref, { startDate, endDate, createdAt: serverTimestamp(), state: 'draft' });
  return { scheduleId: ref.id };
}

export async function addShift({ orgId, scheduleId, userId, role, startTs, endTs }: AddShiftArgs) {
  if (!db) throw new Error('Firestore database is not initialized');
  const ref = doc(collection(db, `organizations/${orgId}/schedules/${scheduleId}/shifts`));
  const body = { userId, role, startTs, endTs, createdAt: serverTimestamp() };
  await setDoc(ref, body);
  return { id: ref.id, ...body };
}

export async function listShiftsForRange({ orgId, scheduleId, startISO, endISO }: ListArgs) {
  // Basic: fetch all and filter client-side. For prod, add composite indexes and range query.
  if (!db) throw new Error('Firestore database is not initialized');
  const qs = query(collection(db, `organizations/${orgId}/schedules/${scheduleId}/shifts`));
  const snap = await getDocs(qs);
  const rows: Shift[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Shift));
  return rows.filter((s) => s.startTs >= startISO && s.startTs <= endISO);
}

export async function publishSchedule({ orgId, scheduleId }: PublishArgs) {
  if (!db) throw new Error('Firestore database is not initialized');
  const scheduleRef = doc(db, `organizations/${orgId}/schedules/${scheduleId}`);
  await setDoc(scheduleRef, { state: 'published', publishedAt: serverTimestamp() }, { merge: true });

  // Create in-app message
  const msgRef = doc(collection(db, `organizations/${orgId}/messages`));
  await setDoc(msgRef, {
    type: 'publish_notice',
    title: 'Schedule Published',
    body: 'The latest schedule has been published. Check your shifts.',
    targets: 'members',
    recipients: [], // members implied by targets
    scheduleId,
    createdAt: serverTimestamp()
  });

  // OPTIONAL: trigger FCM via callable function or HTTP (not included here)
  return { ok: true };
}
