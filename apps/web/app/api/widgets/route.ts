// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
# Template: CODE_NEXT_API_ROUTE

```ts
/**
 * Next.js API Route: widgets
 * Scope: CRUD for widgets
 * Owner: platform
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/app/api/_shared/middleware";
import { requireSession } from "@/app/api/_shared/security";

const Body = z.object({
  // body fields
});

export async function POST(req: NextRequest) {
  return withRateLimit(async () => {
    const session = await requireSession(req);
    if (!session?.uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const json = await req.json().catch(() => ({}));
    const parsed = Body.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

    // TODO: implement business logic
    return NextResponse.json({ ok: true }, { status: 200 });
  });
}
```
