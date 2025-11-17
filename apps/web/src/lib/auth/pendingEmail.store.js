// [P0][AUTH][CODE] PendingEmail Store
// Tags: P0, AUTH, CODE
import { kvSet, kvGet, kvDelete } from "../storage/kv";
const KEY = "emailForSignIn";
const TTL_MS_DEFAULT = 15 * 60 * 1000; // 15 minutes
export async function setPendingEmail(email, ttlMs = TTL_MS_DEFAULT) {
    await kvSet(KEY, email, ttlMs);
}
export async function getPendingEmail() {
    return kvGet(KEY);
}
export async function clearPendingEmail() {
    await kvDelete(KEY);
}
