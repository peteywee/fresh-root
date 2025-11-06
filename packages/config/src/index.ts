// [P0][APP][ENV] Index
// Tags: P0, APP, ENV
export const APP_CONFIG = {
  name: "Fresh Schedules",
  version: "0.1.0",
  description: "Modern staff scheduling PWA",
} as const;

export const FIREBASE_CONFIG = {
  // These will be overridden by environment variables
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  timeout: 30000,
} as const;

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
