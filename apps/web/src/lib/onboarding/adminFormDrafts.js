import { randomBytes } from "crypto";
import { adminDb, adminSdk } from "@/src/lib/firebase.server";
const db = adminDb;
function generateFormToken() {
    return randomBytes(24).toString("hex");
}
export async function saveAdminFormDraft(userId, payload, meta, injectedDb) {
    const token = generateFormToken();
    const root = injectedDb ?? db;
    if (!root)
        throw new Error("admin-db-not-initialized");
    const docRef = root.collection("adminFormDrafts").doc(token);
    const draft = {
        id: token,
        userId,
        payload,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        createdAt: adminSdk.firestore.Timestamp.now(),
        consumedAt: null,
    };
    await docRef.set(draft);
    return token;
}
export async function loadAdminFormDraft(formToken, injectedDb) {
    if (!formToken)
        return null;
    const root = injectedDb ?? db;
    if (!root)
        return null;
    const docRef = root.collection("adminFormDrafts").doc(formToken);
    const snap = await docRef.get();
    if (!snap.exists)
        return null;
    const data = snap.data();
    return data;
}
export async function markAdminFormDraftConsumed(formToken, injectedDb) {
    const root = injectedDb ?? db;
    if (!root)
        throw new Error("admin-db-not-initialized");
    const docRef = root
        .collection("adminFormDrafts")
        .doc(formToken);
    await docRef.update({ consumedAt: adminSdk.firestore.Timestamp.now() });
}
export default {
    saveAdminFormDraft,
    loadAdminFormDraft,
    markAdminFormDraftConsumed,
};
