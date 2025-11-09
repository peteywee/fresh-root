// [P0][AUTH][CODE] PendingEmail Store
// Tags: P0, AUTH, CODE
import { kvSet, kvGet, kvDelete } from "../storage/kv";

const KEY = "emailForSignIn";
const TTL_MS_DEFAULT = 15 * 60 * 1000; // 15 minutes

/**
 * Stores the user's email address temporarily for the email link sign-in process.
 *
 * @param {string} email - The user's email address.
 * @param {number} [ttlMs=TTL_MS_DEFAULT] - The time-to-live for the stored email in milliseconds.
 */
export async function setPendingEmail(email: string, ttlMs: number = TTL_MS_DEFAULT) {
  await kvSet(KEY, email, ttlMs);
}

/**
 * Retrieves the user's email address that was stored for the email link sign-in process.
 *
 * @returns {Promise<string | null>} A promise that resolves to the user's email address, or `null` if not found.
 */
export async function getPendingEmail(): Promise<string | null> {
  return kvGet<string>(KEY);
}

/**
 * Clears the stored email address after the sign-in process is complete.
 */
export async function clearPendingEmail() {
  await kvDelete(KEY);
}
