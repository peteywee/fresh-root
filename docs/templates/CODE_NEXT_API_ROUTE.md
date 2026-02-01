---

title: "Next.js API Route Code Template"
description: "Boilerplate template for Next.js API routes with SDK factory pattern"
keywords:
- template
- next.js
- api
- code
- boilerplate
category: "template"
status: "active"
audience:
- developers
related-docs:
- API\_ROUTE\_DOC\_TEMPLATE.md
- ../standards/SDK\_FACTORY\_COMPREHENSIVE\_GUIDE.md

createdAt: "2026-01-31T12:00:00Z"
lastUpdated: "2026-01-31T12:00:00Z"

---

# Template: CODE_NEXT_API_ROUTE

```ts
/**
 * Next.js API Route: ${Name}
 * Scope: ${Description}
 * Owner: ${Owner}
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
