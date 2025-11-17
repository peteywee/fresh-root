#!/usr/bin/env bash
# [P0][APP][CODE] Bootstrap Tier2
# Tags: P0, APP, CODE
set -euo pipefail

corepack enable
corepack prepare pnpm@9.12.0 --activate

# --- ensure directories ---
mkdir -p apps/web/app/(app)/dashboard
mkdir -p apps/web/app/api/health
mkdir -p apps/web/app/lib

# --- env validation (Zod) ---
cat > apps/web/app/lib/env.ts <<'TS'
import { z } from "zod";

/**
 * Build-time and runtime env validation for the client bundle.
 * Fail fast in dev if anything is missing/malformed.
 */
const EnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "Missing NEXT_PUBLIC_FIREBASE_API_KEY"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;

/** Validate once and memoize. */
let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;
  const raw = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `- ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid client environment:\n${issues}`);
  }
  _env = parsed.data;
  return _env;
}
TS

# --- planning helpers (safe math; no deps) ---
cat > apps/web/app/lib/planning.ts <<'TS'
/**
 * Labor planning formulas (safe, pure helpers).
 * allowed$ = forecastSales * (laborPct/100)
 * allowedHours = allowed$ / avgWage
 */
export function allowedLaborDollars(forecastSales: number, laborPct: number): number {
  if (forecastSales < 0 || laborPct < 0) return 0;
  return +(forecastSales * (laborPct / 100)).toFixed(2);
}

export function allowedHours(allowedDollars: number, avgWage: number): number {
  if (allowedDollars <= 0 || avgWage <= 0) return 0;
  return +(allowedDollars / avgWage).toFixed(2);
}

/** Example composite utility */
export function computeAllowed(forecastSales: number, laborPct: number, avgWage: number) {
  const dollars = allowedLaborDollars(forecastSales, laborPct);
  const hours = allowedHours(dollars, avgWage);
  return { dollars, hours };
}
TS

# --- zustand store (simple, no peer drama) ---
cat > apps/web/app/lib/store.ts <<'TS'
'use client';

import { create } from "zustand";

type UIState = {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
};

export const useUIStore = create<UIState>((set) => ({
  theme: "light",
  setTheme: (t) => set({ theme: t }),
}));
TS

# --- dashboard page (pure UI) ---
cat > apps/web/app/(app)/dashboard/page.tsx <<'TSX'
import { computeAllowed } from "@/app/lib/planning";

export const metadata = { title: "Dashboard — Fresh Schedules" };

export default function DashboardPage() {
  // Simple example values (adjust later)
  const forecastSales = 5000;
  const laborPct = 18;
  const avgWage = 16;

  const { dollars, hours } = computeAllowed(forecastSales, laborPct, avgWage);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border p-4">
          <div className="text-xs opacity-70">Forecast Sales</div>
          <div className="text-xl">${forecastSales.toLocaleString()}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs opacity-70">Allowed Labor $ ({laborPct}%)</div>
          <div className="text-xl">${dollars.toLocaleString()}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-xs opacity-70">Allowed Hours (avg ${avgWage}/hr)</div>
          <div className="text-xl">{hours.toLocaleString()}</div>
        </div>
      </div>
    </main>
  );
}
TSX

# --- minimal API health route (no server deps) ---
cat > apps/web/app/api/health/route.ts <<'TS'
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
TS

# --- ensure env example has client keys placeholders ---
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

echo "🔧 Installing deps required by Tier-2..."
pnpm --filter @apps/web add zod@3.23.8 zustand@4.5.2

echo "🔎 Typecheck..."
pnpm -r typecheck

echo "🏗️ Build..."
pnpm -r build

echo "✅ Tier-2 applied. Start dev:"
echo "   pnpm --filter @apps/web dev"
