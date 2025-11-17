#!/usr/bin/env bash
# [P0][APP][CODE] Bootstrap Tier1
# Tags: P0, APP, CODE
set -euo pipefail

# --- guard: pnpm only ---
corepack enable
corepack prepare pnpm@9.12.0 --activate

# --- ensure dirs ---
mkdir -p apps/web/app/lib
mkdir -p apps/web/app/providers
mkdir -p public

# --- .env.example: append Firebase client keys if missing ---
if ! grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" .env.example 2>/dev/null; then
cat >> .env.example <<'ENV'

# Firebase Web
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
ENV
fi

# --- Firebase client init (no Admin) ---
cat > apps/web/app/lib/firebaseClient.ts <<'TS'
import { initializeApp, getApps, getApp } from 'firebase/app'

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
}

// Initialize exactly once on the client
export const firebaseApp = getApps().length ? getApp() : initializeApp(cfg)
TS

# --- React Query provider wiring ---
cat > apps/web/app/providers/queryClient.ts <<'TS'
'use client'
import { QueryClient } from '@tanstack/react-query'

let _client: QueryClient | null = null

export function getQueryClient() {
  if (!_client) {
    _client = new QueryClient({
      defaultOptions: {
        queries: {
          // Tuned for UX-first dev: fast refetch on focus, reasonable staleness
          refetchOnWindowFocus: true,
          retry: 2,
          staleTime: 30_000,   // 30s
          gcTime: 5 * 60_000   // 5 min
        },
        mutations: {
          retry: 0
        }
      }
    })
  }
  return _client
}
TS

cat > apps/web/app/providers/index.tsx <<'TSX'
'use client'
import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from './queryClient'

export default function Providers({ children }: { children: React.ReactNode }) {
  const client = getQueryClient()
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}
TSX

# --- Firebase hosting/emulator config shell (safe defaults) ---
cat > firebase.json <<'JSON'
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  },
  "emulators": {
    "hosting": { "port": 5073 }
  }
}
JSON

# --- Deny-all rules placeholder (safe until you paste your complete rules) ---
cat > firestore.rules <<'RULES'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny everything by default. Replace with your complete rules set later.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
RULES

# --- minimal manifest (optional; harmless) ---
cat > public/manifest.json <<'JSON'
{
  "name": "Fresh Schedules",
  "short_name": "Fresh",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#111827",
  "icons": []
}
JSON

echo "🔧 Installing only what Tier-1 needs..."
# Firebase client + React Query (pinned, no peer drama)
pnpm --filter @apps/web add firebase@10.12.3 \
  @tanstack/react-query@5.59.0 @tanstack/react-query-devtools@5.59.0

echo "🔎 Typecheck..."
pnpm -r typecheck

echo "🏗️ Build..."
pnpm -r build

echo "✅ Tier-1 applied. Run the dev server:"
echo "   pnpm --filter @apps/web dev"
