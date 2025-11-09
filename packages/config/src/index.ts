// [P0][APP][ENV] Index
// Tags: P0, APP, ENV
/**
 * Application-wide configuration constants.
 * @property {string} name - The name of the application.
 * @property {string} version - The current version of the application.
 * @property {string} description - A brief description of the application.
 */
export const APP_CONFIG = {
  name: "Fresh Schedules",
  version: "0.1.0",
  description: "Modern staff scheduling PWA",
} as const;

/**
 * Firebase configuration, sourced from environment variables.
 * @property {string} apiKey - The Firebase API key.
 * @property {string} authDomain - The Firebase authentication domain.
 * @property {string} projectId - The Firebase project ID.
 * @property {string} storageBucket - The Firebase storage bucket.
 * @property {string} messagingSenderId - The Firebase messaging sender ID.
 * @property {string} appId - The Firebase application ID.
 */
export const FIREBASE_CONFIG = {
  // These will be overridden by environment variables
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
} as const;

/**
 * API configuration.
 * @property {string} baseUrl - The base URL for the API.
 * @property {number} timeout - The default timeout for API requests in milliseconds.
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  timeout: 30000,
} as const;

/**
 * UI-related configuration.
 * @property {string} defaultTheme - The default theme for the application.
 * @property {readonly string[]} supportedThemes - A list of supported themes.
 * @property {object} breakpoints - The responsive breakpoints for the UI.
 * @property {string} breakpoints.sm - Small breakpoint.
 * @property {string} breakpoints.md - Medium breakpoint.
 * @property {string} breakpoints.lg - Large breakpoint.
 * @property {string} breakpoints.xl - Extra-large breakpoint.
 */
export const UI_CONFIG = {
  defaultTheme: "light",
  supportedThemes: ["light", "dark"] as const,
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  } as const,
} as const;
