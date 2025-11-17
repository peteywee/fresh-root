// [P0][APP][CODE] Db
// Tags: P0, APP, CODE
// Server-first Firestore read helpers with cache tags.
// NOTE: Keep this file importable by server components only.
import { initializeApp } from "firebase/app";
import { collection, getFirestore, getDocs, getDoc, doc, query, orderBy, limit, } from "firebase/firestore";
import { cached } from "./cache";
import { ENV } from "./env";
const app = initializeApp({
    apiKey: ENV.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: ENV.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: ENV.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);
const TAG_SCHEDULES = (orgId) => `schedules:${orgId}`;
async function _fetchRecentSchedulesLite(orgId, max = 10) {
    // Ensure indexes exist: (weekStart DESC, venueId ASC) on schedules/{orgId}/{scheduleId}
    const ref = collection(db, "schedules", orgId, "schedules");
    const q = query(ref, orderBy("weekStart", "desc"), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            orgId: data.orgId,
            weekStart: typeof data.weekStart === "object" &&
                data.weekStart !== null &&
                typeof data.weekStart.toDate === "function"
                ? data.weekStart.toDate().toISOString()
                : data.weekStart,
            venueId: data.venueId,
            status: data.status,
        };
    });
}
export const fetchRecentSchedulesLite = (orgId, max = 10) => cached(`recentSchedules:${orgId}:${max}`, _fetchRecentSchedulesLite, {
    tag: TAG_SCHEDULES(orgId),
    ttl: 60,
})(orgId, max);
export async function fetchScheduleDoc(orgId, scheduleId) {
    const ref = doc(db, "schedules", orgId, scheduleId);
    const s = await getDoc(ref);
    return { id: s.id, ...s.data() };
}
export { TAG_SCHEDULES };
