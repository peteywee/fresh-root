// [P0][APP][CODE] Db
// Tags: P0, APP, CODE
// Server-first Firestore read helpers with cache tags.
// NOTE: Keep this file importable by server components only.
import { initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { cached } from "./cache";
import { ENV } from "./env";

const app = initializeApp({
  apiKey: ENV.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: ENV.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

export type ScheduleLite = {
  id: string;
  orgId: string;
  weekStart: string; // ISO string
  venueId: string;
  status: "draft" | "published";
};

type ScheduleDocData = {
  orgId: string;
  weekStart: { toDate: () => Date } | string;
  venueId: string;
  status: "draft" | "published";
  [key: string]: unknown;
};

const TAG_SCHEDULES = (orgId: string) => `schedules:${orgId}`;

async function _fetchRecentSchedulesLite(orgId: string, max = 10): Promise<ScheduleLite[]> {
  // Ensure indexes exist: (weekStart DESC, venueId ASC) on schedules/{orgId}/{scheduleId}
  const ref = collection(db, "schedules", orgId, "schedules");
  const q = query(ref, orderBy("weekStart", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as ScheduleDocData;
    return {
      id: d.id,
      orgId: data.orgId,
      weekStart:
        typeof data.weekStart === "object" &&
        data.weekStart !== null &&
        typeof (data.weekStart as { toDate?: unknown }).toDate === "function"
          ? (data.weekStart as { toDate: () => Date }).toDate().toISOString()
          : (data.weekStart as string),
      venueId: data.venueId,
      status: data.status,
    };
  });
}

export const fetchRecentSchedulesLite = (orgId: string, max = 10) =>
  cached<
    Parameters<typeof _fetchRecentSchedulesLite>,
    Awaited<ReturnType<typeof _fetchRecentSchedulesLite>>
  >(`recentSchedules:${orgId}:${max}`, _fetchRecentSchedulesLite, {
    tag: TAG_SCHEDULES(orgId),
    ttl: 60,
  })(orgId, max);

export async function fetchScheduleDoc(orgId: string, scheduleId: string) {
  const ref = doc(db, "schedules", orgId, scheduleId);
  const s = await getDoc(ref);
  return { id: s.id, ...(s.data() as ScheduleDocData) };
}

export { TAG_SCHEDULES };
