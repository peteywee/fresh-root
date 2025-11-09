// [P0][APP][CODE] ActionCodeSettings
// Tags: P0, APP, CODE
import type { ActionCodeSettings } from "firebase/auth";

/**
 * @fileoverview This file defines the action code settings for Firebase email action links.
 * These settings are used to configure the URL that users are redirected to after
 * completing an email-based action, such as verifying their email or resetting their password.
 */

// Build a client-safe action code settings object.
// Uses a callback path that will complete sign-in and then establish a session if desired.
const origin = typeof window !== "undefined" ? window.location.origin : "";

/**
 * The action code settings for Firebase email action links.
 * @property {string} url - The URL to redirect to after the action is completed.
 * @property {boolean} handleCodeInApp - Whether the action should be handled in the app.
 */
export const actionCodeSettings: ActionCodeSettings = {
  url: `${origin}/auth/callback`,
  handleCodeInApp: true,
};
