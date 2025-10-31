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

function shouldUseRedirect(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome|chromium|crios/.test(ua);
  const isStandalone = (navigator as any).standalone === true;
  const smallScreen = typeof window !== "undefined" && window.innerWidth < 768;
  return isIOS || isSafari || isStandalone || smallScreen;
}

export async function loginWithGoogleSmart() {
  const provider = new GoogleAuthProvider();
  try {
    if (shouldUseRedirect()) {
      await signInWithRedirect(auth!, provider);
    } else {
      await signInWithPopup(auth!, provider);
    }
  } catch (e) {
    reportError(e as any, { phase: "google_sign_in" });
    // Fallback: try redirect if popup failed (e.g., blocked)
    try {
      await signInWithRedirect(auth!, provider);
    } catch (e2) {
      reportError(e2 as any, { phase: "google_sign_in_fallback" });
      throw e2;
    }
  }
}

// Open the Google popup immediately from a user gesture. This calls the SDK synchronously
// so browsers will treat it as a user-initiated popup and not block it.
export function startGooglePopup(): Promise<unknown> {
  const provider = new GoogleAuthProvider();
  // call signInWithPopup synchronously; the returned Promise can be awaited by the caller.
  return signInWithPopup(auth!, provider) as Promise<unknown>;
}

export async function completeGoogleRedirectOnce(): Promise<boolean> {
  try {
    const res = await getRedirectResult(auth!);
    return !!res?.user;
  } catch (e) {
    reportError(e as any, { phase: "google_redirect_complete" });
    return false;
  }
}

export async function sendEmailLinkRobust(email: string) {
  try {
    if (!auth)
      throw new Error(
        "Firebase auth is not initialized. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set or enable emulators.",
      );
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    await setPendingEmail(email);
  } catch (e) {
    reportError(e as any, { phase: "send_email_link" });
    throw e;
  }
}

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
    reportError(e as any, { phase: "complete_email_link" });
    throw e;
  } finally {
    await clearPendingEmail();
  }
  return true;
}

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

export async function logoutEverywhere() {
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch (e) {
    reportError(e as any, { phase: "session_delete" });
  }
  try {
    const { signOut } = await import("firebase/auth");
    await signOut(auth!);
  } catch (e) {
    reportError(e as any, { phase: "client_signout" });
  }
}
