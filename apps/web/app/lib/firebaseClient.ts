import { initializeApp, getApps, getApp } from 'firebase/app'
import { z } from 'zod'

// Validate expected NEXT_PUBLIC_ env vars used to initialize Firebase.
const EnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1)
})

const rawEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

let cfg = undefined as undefined | {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket?: string
  appId: string
}

try {
  const parsed = EnvSchema.parse(rawEnv)
  cfg = {
    apiKey: parsed.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: parsed.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: parsed.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: parsed.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: parsed.NEXT_PUBLIC_FIREBASE_APP_ID
  }
} catch (err) {
  // In dev this will surface useful messages but won't crash the server build.
  // Consumers should still ensure they set the NEXT_PUBLIC_FIREBASE_* vars.
  // eslint-disable-next-line no-console
  console.warn('Firebase env validation failed:', err)
}

// Initialize exactly once on the client. Only attempt initialize if cfg is valid.
export const firebaseApp = ((): ReturnType<typeof getApp> | undefined => {
  if (typeof window === 'undefined') return undefined
  if (!cfg) return undefined
  return getApps().length ? getApp() : initializeApp(cfg)
})()
