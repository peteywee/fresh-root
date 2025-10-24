#!/usr/bin/env bash
set -euo pipefail

corepack enable
corepack prepare pnpm@9.12.0 --activate

# --- ensure dirs ---
mkdir -p apps/web/app/api/_shared
mkdir -p apps/web/app/api/items
mkdir -p apps/web/app/lib
mkdir -p apps/web/app/components
mkdir -p "apps/web/app/\(app)\/protected"

# --- API validation helpers (Zod) ---
cat > apps/web/app/api/_shared/validation.ts <<'TS'
import { z } from "zod";

/** Standard API error payload shape */
export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

/** Build a 400 error response with consistent shape */
export function badRequest(message: string, details?: unknown, code = "BAD_REQUEST") {
  return Response.json({ error: { code, message, details } } as ApiError, { status: 400 });
}

/** Build a 500 error response with consistent shape */
export function serverError(message = "Internal Server Error", details?: unknown, code = "INTERNAL") {
  return Response.json({ error: { code, message, details } } as ApiError, { status: 500 });
}

/** Build a 200 response */
export function ok<T>(data: T) {
  return Response.json(data, { status: 200 });
}

/** Utility to parse JSON request bodies against a Zod schema */
export async function parseJson<T>(req: Request, schema: z.ZodType<T>) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new Error("Invalid JSON");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const details = parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }));
    return { success: false as const, details };
  }
  return { success: true as const, data: parsed.data };
}
TS

# --- Example resource: POST /api/items (validate + return) ---
cat > apps/web/app/api/items/route.ts <<'TS'
import { z } from "zod";
import { parseJson, badRequest, ok, serverError } from "../_shared/validation";

/**
 * A simple example endpoint to demonstrate:
 * - Zod validation
 * - Standard error shape
 * - Returning JSON
 */
const CreateItemInput = z.object({
  name: z.string().min(1, "name is required"),
});

export async function POST(req: Request) {
  try {
    const parsed = await parseJson(req, CreateItemInput);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.details);
    }
    const { name } = parsed.data;

    // Normally you'd write to Firestore here. We'll simulate a created item.
    const item = { id: crypto.randomUUID(), name, createdAt: Date.now() };
    return ok(item);
  } catch (e: any) {
    return serverError(e?.message ?? "Unexpected error");
  }
}

// Optional: GET returns a static list (safe demo)
export async function GET() {
  return ok([{ id: "demo-1", name: "Sample", createdAt: 0 }]);
}
TS

# --- HTTP helper for client (fetch wrapper + error normalization) ---
cat > apps/web/app/lib/http.ts <<'TS'
import type { ApiError } from "@/app/api/_shared/validation";

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Typed fetch wrapper expecting JSON. Throws HttpError on non-2xx with normalized shape. */
export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? JSON.parse(text || "{}") : (text || "");
  if (!res.ok) {
    const apiErr = (body as ApiError)?.error;
    const code = apiErr?.code ?? String(res.status);
    const msg = apiErr?.message ?? "Request failed";
    const details = apiErr?.details;
    throw new HttpError(res.status, msg, code, details);
  }
  return body as T;
}
TS

# --- React Query mutation example (client-only) ---
cat > apps/web/app/lib/useCreateItem.ts <<'TS'
'use client';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from './http';

type Item = { id: string; name: string; createdAt: number };
type CreateItemInput = { name: string };

export function useCreateItem() {
  return useMutation({
    mutationFn: async (payload: CreateItemInput) => {
      const data = await apiFetch<Item>('/api/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    },
    onError(err) {
      // eslint-disable-next-line no-console
      console.error('CreateItem failed:', err);
    },
  });
}
TS

# --- ProtectedRoute shell (no auth yet; non-breaking) ---
cat > apps/web/app/components/ProtectedRoute.tsx <<'TSX'
'use client';

import React from 'react';

/**
 * Minimal placeholder guard:
 * - No real auth check yet (to avoid adding peers/deps)
 * - If "auth" not implemented, we still render children + banner.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthed = false; // replace when auth is wired
  if (!isAuthed) {
    return (
      <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 text-sm">
        <div className="font-semibold">Not authenticated</div>
        <div className="opacity-80">Auth not wired yet; showing content for development.</div>
        <div className="mt-3">{children}</div>
      </div>
    );
  }
  return <>{children}</>;
}
TSX

# --- Demo "protected" page using the mutation hook (works without auth) ---
cat > "apps/web/app/(app)/protected/page.tsx" <<'TSX'
'use client';

import React from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useCreateItem } from '@/app/lib/useCreateItem';

export default function ProtectedDemoPage() {
  const createItem = useCreateItem();

  return (
    <ProtectedRoute>
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Protected Demo</h1>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = (form.elements.namedItem('name') as HTMLInputElement);
            const name = input.value.trim();
            if (name) createItem.mutate({ name });
            input.value = '';
          }}
        >
          <input
            name="name"
            placeholder="New item name"
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded px-3 py-2 text-sm border bg-black text-white"
            disabled={createItem.isPending}
          >
            {createItem.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {createItem.isError && (
          <div className="text-sm text-red-700">
            {(createItem.error as any)?.message ?? 'Error'}
          </div>
        )}
        {createItem.isSuccess && (
          <pre className="text-xs bg-gray-100 p-3 rounded">
            {JSON.stringify(createItem.data, null, 2)}
          </pre>
        )}
      </main>
    </ProtectedRoute>
  );
}
TSX

# --- Upload stub (client-only; no SDKs yet) ---
cat > apps/web/app/components/UploadStub.tsx <<'TSX'
'use client';

import React from 'react';

export default function UploadStub() {
  return (
    <div className="p-4 border rounded text-sm">
      <div className="font-semibold">Upload (Stub)</div>
      <p className="opacity-80 mb-2">This only captures a file and logs it — no storage SDK yet.</p>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // eslint-disable-next-line no-console
            console.log('Selected file:', { name: file.name, size: file.size, type: file.type });
          }
        }}
      />
    </div>
  );
}
TSX

# --- Tailwind theme tokens (safe overwrite) ---
cat > apps/web/tailwind.config.ts <<'TS'
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0EA5E9', dark: '#0284C7' },
        surface: { DEFAULT: '#111827', light: '#F9FAFB' },
      },
      borderRadius: {
        xl: '0.75rem',
      }
    }
  },
  plugins: []
}
export default config
TS

echo "🔎 Typecheck..."
pnpm -r typecheck

echo "🏗️ Build..."
pnpm -r build

echo "✅ Tier-3 applied. Try pages:"
echo "   - /api/items (GET) returns demo list"
echo "   - /(app)/protected to test mutation + ProtectedRoute"
echo "Run: pnpm --filter @apps/web dev"
