# Block 3 (Integrity Core) — Quick Start

**Status**: ✅ COMPLETE (Nov 11, 2025)

Block 3 is the **Integrity Core**—every write goes through a schema and every read goes through rules that are proven.

---

## What's Complete

- ✅ **Centralized Zod schemas** (`packages/types/src/`)
- ✅ **API validation** on all write routes
- ✅ **Firestore security rules** for tenant isolation and RBAC
- ✅ **Frontend onboarding wizard** (7 pages with routing guards)
- ✅ **Event logging** for all critical operations
- ✅ **Test coverage** (unit, integration, E2E)
- ✅ **CI/CD quality gates** all passing

---

## Key Documents

1. **BLOCK3_COMPLETION.md** - Full completion report with all deliverables
2. **BLOCK3_API_REFERENCE.md** - API endpoint reference with examples
3. **BLOCK3_IMPLEMENTATION.md** - Original implementation specs (still valid)

---

## Quick Verification

```bash
# Typecheck
pnpm -w typecheck

# Lint
pnpm -w lint

# Tests
pnpm test
pnpm test:rules
pnpm test:e2e

# All together
pnpm -w install --frozen-lockfile && \
  pnpm -w typecheck && \
  pnpm -w lint && \
  pnpm test && \
  pnpm test:rules
```

All should **pass** without errors. ✅

---

## Onboarding Flow

```text
1. Sign in → Auto bootstrap session
2. Profile page → Name, phone, timezone, role
3. Intent page → Choose: create-org, create-corporate, or join
4. Admin form → Tax ID, liability, compliance
5. Create network → Organization name, primary venue
6. Complete → Onboarding done, redirects to dashboard
```

Alternatively: **Join with token** → Accept invite to existing org

---

## File Structure

### Schemas

- `packages/types/src/onboarding.ts` - Onboarding state
- `packages/types/src/events.ts` - Event types
- `packages/types/src/networks.ts` - Network schemas
- `packages/types/src/orgs.ts`, `memberships.ts`, etc. - Core schemas

### API Routes

- `apps/web/app/api/onboarding/` - 7 endpoints (profile, eligibility, admin-form, create-network-\*, join-with-token, activate-network)
- `apps/web/app/api/organizations/`, `positions/`, `shifts/`, etc. - Core collection endpoints

### Frontend Pages

- `apps/web/app/onboarding/` - Wizard pages and layout

### Tests

- `apps/web/app/api/onboarding/__tests__/` - Unit/integration tests
- `tests/rules/` - Firestore rules tests
- `tests/e2e/onboarding-full-flow.spec.ts` - End-to-end tests

### Rules & Security

- `firestore.rules` - Security rules
- `storage.rules` - Cloud Storage rules
- `apps/web/app/api/_shared/middleware.ts` - Auth middleware
- `apps/web/app/api/_shared/validation.ts` - Zod schemas for API

---

## Next: Block 4 (Network Tenancy)

Block 3 is the foundation for Block 4, which migrates from org-scoped to network-scoped paths:

```text
Current (Block 3):
  /organizations/{orgId}/...

Future (Block 4):
  /networks/{networkId}/organizations/{orgId}/...
```

See `docs/BLOCK4_PLANNING.md` for details.

---

## Key Patterns

### API Handler Template

```typescript
import { NextResponse } from "next/server";
import { SomeSchema } from "../../_shared/validation";
import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

export async function handler(req: AuthenticatedRequest) {
  const uid = req.user?.uid;
  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const parsed = SomeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // ... business logic, emit events ...

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const POST = withSecurity(handler, { requireAuth: true });
```

### Emitting Events

```typescript
import { logEvent, type NewEvent } from "@/src/lib/eventLog";

const event: NewEvent = {
  at: Date.now(),
  category: "onboarding",
  type: "onboarding.completed",
  actorUserId: uid,
  networkId: networkId,
  payload: { orgName, venueName },
};

await logEvent(event, db);
```

### Frontend Page Pattern

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExamplePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/some-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ /* form data */ }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as any).error || "Failed");
        return;
      }

      router.push("/next-page");
    } catch (err) {
      setError("Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* form fields */}
      <button disabled={submitting}>Submit</button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
```

---

## Troubleshooting

### "Cannot find module '@fresh-schedules/types'"

→ Run `pnpm -w install --frozen-lockfile`

### Firestore rules tests failing

→ Run `firebase emulators:start` then `pnpm test:rules`

### E2E tests not finding Playwright

→ Run `pnpm -w install --frozen-lockfile`

### TypeScript compilation errors

→ Run `pnpm -w typecheck` to see details

---

## Documentation Index

| Document                                     | Purpose                                                          |
| -------------------------------------------- | ---------------------------------------------------------------- |
| **BLOCK3_COMPLETION.md**                     | Full completion report, all deliverables, verification checklist |
| **BLOCK3_API_REFERENCE.md**                  | API endpoint reference with request/response examples            |
| **BLOCK3_IMPLEMENTATION.md**                 | Original implementation specs (reference)                        |
| **V14_FREEZE_INSPECTION_REPORT.md**          | v14 freeze inspection and sign-off                               |
| **BLOCK3_QUICK_START.md**                    | This file—quick reference                                        |
| **docs/COMPLETE_TECHNICAL_DOCUMENTATION.md** | Full system documentation                                        |

---

## Getting Help

- **API questions**: See `BLOCK3_API_REFERENCE.md`
- **Implementation details**: See `BLOCK3_IMPLEMENTATION.md`
- **Debugging**: See `COMPLETE_TECHNICAL_DOCUMENTATION.md`
- **Code examples**: Check test files in `apps/web/app/api/onboarding/__tests__/`

---

**Block 3 Status**: ✅ COMPLETE & READY FOR BLOCK 4

Last updated: November 11, 2025
