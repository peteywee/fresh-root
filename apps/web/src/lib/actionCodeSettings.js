// Build a client-safe action code settings object.
// Uses a callback path that will complete sign-in and then establish a session if desired.
const origin = typeof window !== "undefined" ? window.location.origin : "";
export const actionCodeSettings = {
    url: `${origin}/auth/callback`,
    handleCodeInApp: true,
};
