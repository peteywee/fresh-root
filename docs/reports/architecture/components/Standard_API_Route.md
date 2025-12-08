# Route API Standard (Next.js App Router, Layer 03)
**Purpose**
Define the thin-edge handler pattern: **parse → validate → authorize → app-lib → respond**.
All `apps/web/app/api/**/route.ts` files MUST follow this standard.

**Layering**

- Handlers live in **Layer 03 – API Edge**.
- Business logic lives in \*\*Layer 02 – App Libs (`apps/web/src/lib/**`)\*\*.
- Domain schemas live in **Layer 00 – Domain (`@fresh-schedules/types`)**.
- Infrastructure helpers (Firebase Admin, env, etc.) are consumed via Layer 01.

**Required Rules**

1. Handlers export explicit HTTP methods (`export const GET|POST|... = ...`).
2. No raw Firebase Admin calls here (go through App Libs).
3. Validate inputs with Zod schemas from the Domain layer.
4. Map errors to a consistent JSON shape `{ ok: false, error }`.
5. Keep routes "thin" (prefer ≤ ~60 LOC per method).

**Canonical Handler Template**

```ts
// app/api/<segment>/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// Domain contracts
// import { SomeSchema } from "@fresh-schedules/types";
// App Libs
// import { requireSession, requireRole } from "@/src/lib/api";
// import { doWork } from "@/src/lib/someUseCase";

export const GET = async (req: NextRequest) => {
  try {
    // const session = await requireSession(req);
    // await requireRole(session, ["manager"]);
    // const data = await doWork(/* args */);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    // const session = await requireSession(req);
    // const body = await req.json();
    // const parsed = SomeSchema.parse(body);
    // const result = await doWork(parsed, session);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    const status = err?.name === "ZodError" ? 400 : 500;
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status });
  }
};

// Optional extras for health/ops/resource semantics:
export const HEAD = async () => new Response(null, { status: 200 });
export const DELETE = async (_req: NextRequest) => NextResponse.json({ ok: true });
export const PATCH = async (_req: NextRequest) => NextResponse.json({ ok: true });
```

**Location & References**

Executable example: `apps/web/app/api/_template/route.ts`

API Catalog: `docs/blocks/BLOCK3_API_REFERENCE.md`

Layer 03 contract: `docs/layers/LAYER_03_API_EDGE.md`

**Enforcement (CI)**

Regenerate API catalog and diff on PRs:

```bash
pnpm tsx scripts/gen_api_catalog.ts
```

Fail PR if `docs/blocks/BLOCK3_API_REFERENCE.md` changed but not committed.
