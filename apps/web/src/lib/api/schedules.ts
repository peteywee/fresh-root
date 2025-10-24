import { db } from '../../../app/lib/firebaseClient';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

type CreateScheduleArgs = { orgId: string; startDate: string; endDate: string; };
type PublishArgs = { orgId: string; scheduleId: string; };
type AddShiftArgs = { orgId: string; scheduleId: string; userId: string; role: string; startTs: string; endTs: string; };
type ListArgs = { orgId: string; scheduleId: string; startISO: string; endISO: string; };

export async function createWeekOrMonth({ orgId, startDate, endDate }: CreateScheduleArgs) {
  const ref = doc(collection(db!, `organizations/${orgId}/schedules`));
  await setDoc(ref, { startDate, endDate, createdAt: serverTimestamp(), state: 'draft' });
  return { scheduleId: ref.id };
}

export async function addShift({ orgId, scheduleId, userId, role, startTs, endTs }: AddShiftArgs) {
  const ref = doc(collection(db!, `organizations/${orgId}/schedules/${scheduleId}/shifts`));
  const body = { userId, role, startTs, endTs, createdAt: serverTimestamp() };
  await setDoc(ref, body);
  return { id: ref.id, ...body };
}

export async function listShiftsForRange({ orgId, scheduleId, startISO, endISO }: ListArgs) {
  // Basic: fetch all and filter client-side. For prod, add composite indexes and range query.
  const qs = query(collection(db!, `organizations/${orgId}/schedules/${scheduleId}/shifts`));
  const snap = await getDocs(qs);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  return rows.filter((s) => s.startTs >= startISO && s.startTs <= endISO);
}

export async function publishSchedule({ orgId, scheduleId }: PublishArgs) {
  const scheduleRef = doc(db!, `organizations/${orgId}/schedules/${scheduleId}`);
  await setDoc(scheduleRef, { state: 'published', publishedAt: serverTimestamp() }, { merge: true });

  // Create in-app message
  const msgRef = doc(collection(db!, `organizations/${orgId}/messages`));
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
