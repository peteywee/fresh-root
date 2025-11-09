// [P0][AUTH][CODE] Auth Helpers
// Tags: P0, AUTH, CODE
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  getRedirectResult,
} from "firebase/auth";

import { actionCodeSettings } from "./actionCodeSettings";
import { setPendingEmail, getPendingEmail, clearPendingEmail } from "./auth/pendingEmail.store";
import { reportError } from "./error/reporting";
import { auth } from "../../app/lib/firebaseClient";

// Extend Navigator to include non-standard iOS standalone property
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

/**
 * Determines whether to use redirect-based sign-in instead of a popup.
 * This is useful for mobile devices and browsers that block popups.
 * @returns {boolean} True if redirect should be used, false otherwise.
 */
function shouldUseRedirect(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome|chromium|crios/.test(ua);
  const isStandalone = (navigator as NavigatorWithStandalone).standalone === true;
  const smallScreen = typeof window !== "undefined" && window.innerWidth < 768;
  return isIOS || isSafari || isStandalone || smallScreen;
}

/**
 * Initiates Google sign-in using either a popup or redirect, depending on the environment.
 * It also includes a fallback to redirect if the popup fails.
 */
export async function loginWithGoogleSmart() {
  const provider = new GoogleAuthProvider();
  try {
    if (shouldUseRedirect()) {
      await signInWithRedirect(auth!, provider);
    } else {
      await signInWithPopup(auth!, provider);
    }
  } catch (e) {
    reportError(e as unknown, { phase: "google_sign_in" });
    // Fallback: try redirect if popup failed (e.g., blocked)
    try {
      await signInWithRedirect(auth!, provider);
    } catch (e2) {
      reportError(e2 as unknown, { phase: "google_sign_in_fallback" });
      throw e2;
    }
  }
}

/**
 * Starts the Google sign-in process using a popup.
 * This should be called from a user gesture to avoid popup blockers.
 * @returns {Promise<unknown>} A promise that resolves with the sign-in result.
 */
export function startGooglePopup(): Promise<unknown> {
  const provider = new GoogleAuthProvider();
  // call signInWithPopup synchronously; the returned Promise can be awaited by the caller.
  return signInWithPopup(auth!, provider) as Promise<unknown>;
}

/**
 * Completes the Google sign-in redirect flow.
 * This should be called on the page that Firebase redirects to after a successful sign-in.
 * @returns {Promise<boolean>} A promise that resolves to true if the sign-in was successful, false otherwise.
 */
export async function completeGoogleRedirectOnce(): Promise<boolean> {
  try {
    const res = await getRedirectResult(auth!);
    return !!res?.user;
  } catch (e) {
    reportError(e as unknown, { phase: "google_redirect_complete" });
    return false;
  }
}

/**
 * Sends a sign-in link to the user's email address.
 * @param {string} email - The user's email address.
 */
export async function sendEmailLinkRobust(email: string) {
  try {
    if (!auth)
      throw new Error(
        "Firebase auth is not initialized. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set or enable emulators.",
      );
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    await setPendingEmail(email);
  } catch (e) {
    reportError(e as unknown, { phase: "send_email_link" });
    throw e;
  }
}

/**
 * Completes the email link sign-in process if the current URL is a sign-in link.
 * @returns {Promise<boolean>} A promise that resolves to true if the sign-in was successful, false otherwise.
 */
export async function completeEmailLinkIfPresent(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!isSignInWithEmailLink(auth!, window.location.href)) return false;

  let email = await getPendingEmail();
  if (!email) {
    // Fallback: prompt to supply email
    email = window.prompt("Please confirm your email to complete sign-in") || "";
  }
  if (!email) return false;

  try {
    await signInWithEmailLink(auth!, email, window.location.href);
  } catch (e) {
    reportError(e as unknown, { phase: "complete_email_link" });
    throw e;
  } finally {
    await clearPendingEmail();
  }
  return true;
}

/**
 * Establishes a server-side session by sending the user's ID token to the backend.
 */
export async function establishServerSession() {
  const idToken = await auth?.currentUser?.getIdToken(true);
  if (!idToken) throw new Error("Missing idToken");
  const resp = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    reportError(new Error("Session POST failed"), { body: msg });
    throw new Error("Failed to create session");
  }
}

/**
 * Logs the user out from both the client and the server.
 */
export async function logoutEverywhere() {
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch (e) {
    reportError(e as unknown, { phase: "session_delete" });
  }
  try {
    const { signOut } = await import("firebase/auth");
    await signOut(auth!);
  } catch (e) {
    reportError(e as unknown, { phase: "client_signout" });
  }
}
