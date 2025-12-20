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
  type DocumentReference,
} from "firebase/firestore";

import { cached } from "./cache";
import { getClientEnv } from "./env";

const env = getClientEnv();

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
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

/**
 * Helper to convert Firestore timestamp to ISO string
 */
function toISOString(dateValue: { toDate?: () => Date } | string): string {
  if (typeof dateValue === "object" && dateValue !== null) {
    const typed = dateValue as { toDate?: unknown };
    if (typeof typed.toDate === "function") {
      return (typed.toDate as () => Date)().toISOString();
    }
  }
  return dateValue as string;
}

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
      weekStart: toISOString(data.weekStart),
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
  const ref: DocumentReference<ScheduleDocData> = doc(
    db,
    "schedules",
    orgId,
    scheduleId,
  ) as DocumentReference<ScheduleDocData>;

  const s = await getDoc(ref);
  const data = s.data();

  if (!data) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  return {
    id: s.id,
    ...data,
  };
}

export { TAG_SCHEDULES };
