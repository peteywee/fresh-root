# 🧭 Project Rules for This Workspace (Fresh Schedules v14)

## 1. File-Level JSDoc Overview is Mandatory

Every new `.ts` or `.tsx` file starts with a header like:

```typescript
/**
 * [P1][API][ONBOARDING] Create Network + Org Endpoint (server)
 * Tags: api, onboarding, network, org, venue, membership
 *
 * Overview:
 * - Validates user role and email verification status
 * - Creates Network, Org, Venue, and Membership v14 docs
 * - Emits onboarding_network_created and onboarding_org_created events
 * - Marks onboarding as complete via markOnboardingComplete()
 */
```

Include priority + domain tags (P0–P3, DOMAIN), then a short bulleted overview of main responsibilities and side-effects.

## 2. Use v14 Types and Contracts Exactly

Never hand-roll schemas for Networks, Orgs, Venues, Corporates, Memberships, Onboarding.

**Always import from `@fresh-schedules/types`**:

```typescript
import {
  CreateOrgOnboardingSchema,
  CreateNetworkSchema,
  type Network,
  type Organization,
} from "@fresh-schedules/types";
```

## 3. Repeated-Problem Rule (3-Strikes)

When a bug or code smell occurs **≥ 3 times**, stop copying patterns.

**Create a helper/factory instead** and refactor previous sites to use it.

Examples:
- Duplicate auth checks → extract to `requireRole()` helper
- JSON parsing errors → extract to `parseJSON()` utility
- Firestore field updates → extract to `updateFirestoreDoc()` helper

## 4. Stop and Refactor on Third Recurrence

If you see:
- The same auth validation appearing 3+ times → consolidate
- The same error handler pattern 3+ times → create middleware
- The same Zod schema validation 3+ times → extract to shared validation module

**Do not add a 4th copy.**

## 5. Never Bypass for Speed

❌ **Don't skip:**
- File-level JSDoc headers (even "one-off" utils)
- Type contracts from v14 schemas
- The 3-strikes rule "just this once"
- Error handling or input validation

✅ **Consistency > velocity.** A few extra minutes now saves debugging later.

## 6. Event Emission on State Changes

All onboarding API routes **must emit events** via `logEvent()` from `apps/web/src/lib/eventLog.ts`:

```typescript
import { logEvent } from "@/src/lib/eventLog";

// After creating a network
await logEvent({
  eventType: "onboarding_network_created",
  userId: uid,
  data: { networkId: network.id, orgId: org.id },
});
```

**Event types defined in:** `packages/types/src/events.ts`

## 7. Firestore Document Structure

All documents must conform to v14 schemas:
- `networks/{networkId}` ← `Network` schema from packages/types
- `organizations/{orgId}` ← `Organization` schema from packages/types
- `venues/{venueId}` ← `Venue` schema from packages/types
- `users/{uid}/onboarding` ← `UserOnboarding` schema (single source of truth)

**Never add fields outside the schema** without updating `packages/types/src/[schema].ts` first.

## 8. Onboarding Status = Single Source of Truth

**Only** `users/{uid}.onboarding` tracks onboarding state. Do not rely on custom claims or other markers.

Update via `markOnboardingComplete()` from `apps/web/src/lib/userOnboarding.ts`:

```typescript
await markOnboardingComplete(uid, adminDb, {
  completedAt: Date.now(),
  networkId: network.id,
  orgId: org.id,
  onboardingFlow: "create-org",
});
```

## 9. Testing Requirements

- All new API routes must have unit tests in `apps/web/src/__tests__/`
- Firestore/Storage rules changes must have tests in `tests/rules/`
- Run before commit: `pnpm lint && pnpm typecheck`

## 10. Auto-Tagging & Pre-Commit Hooks

Files are automatically tagged on commit via `.husky/pre-commit`.  
**Never manually edit tags**—let the automation handle it.

For watch-mode tagging during dev:
```bash
pnpm watch:tags
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Add fsdoc header | Type `fsdoc` + Tab in VS Code |
| Typecheck | `pnpm -w typecheck` |
| Lint | `pnpm -w lint` |
| Run tests | `pnpm test` |
| Watch tagging | `pnpm watch:tags` |
| Check memory | `free -h && pnpm cache:info` |


- Status: trial, active, pending_verification, or complete

### 3. User Onboarding State (Single Source of Truth)

Canonical record is `users/{uid}.onboarding`.

**Helper**: `markOnboardingComplete()` in `apps/web/src/lib/userOnboarding.ts`

Usage:

```typescript
await markOnboardingComplete({
  adminDb,
  uid,
  intent: "create_org",
  networkId: networkRef.id,
  orgId: orgRef.id,
  venueId: venueRef.id
});
```

- Called after successful transaction (best-effort)
- Sets status, intent, completedAt (milliseconds)
- No-op if adminDb undefined (dev/test safe)

### 4. Firestore Rules (Static & Testable)

All paths MUST have explicit rules in `firestore.rules`.

**Join Tokens** (special):

- Path: `join_tokens/{tokenId}` (global, not nested)
- Read: authenticated users in org
- Write: admin SDK only
- Tests: `packages/rules-tests/src/rules.test.ts` must include auth + unauthenticated cases

Test pattern:

```typescript
test("authenticated user can read join token", async () => {
  const db = authed("u1");
  const ref = doc(db, "join_tokens", "token-1");
  await assertSucceeds(getDoc(ref));
});
```

## File Headers

Every file MUST start with:

```typescript
// [PRIORITY][AREA][COMPONENT] Brief description
// Tags: keyword1, keyword2
/**
 * @fileoverview
 * Detailed purpose of this file.
 */
```

**Priority**: P0 (critical), P1 (high), P2 (medium), P3 (low)
**Area**: API, APP, ENV, RULES, TYPES, UTIL
**Component**: ONBOARDING, NETWORK, ORG, VENUE, CORPORATE, MEMBERSHIP, etc.

## Three-Occurrence Rule

If a pattern appears 3+ times across the codebase, refactor into a shared helper:

1. First: exact copy
1. Second: exact copy
1. Third: MUST extract and share

## Quality Gates (Before Every Commit)

- `pnpm -w typecheck` passes
- `pnpm -w lint` passes (no errors)
- `pnpm test` passes for modified files
- `pnpm -w test:rules` passes for rule changes

## Testing Strategy

**Unit Tests** (`pnpm test`):

- Schema validation (input/output)
- Error handling (422, 400, 401, 403, 500)
- Helper functions (deterministic results)

**Rules Tests** (`pnpm -w test:rules`):

- Auth scenarios (authenticated, unauthenticated)
- Read/write permissions
- Path-level access

**E2E Tests** (`pnpm test:e2e` on main branch only):

- Full user flows
- Network creation → Firestore → onboarding state
- Role-based access

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| ISO strings instead of milliseconds | Schema validation fails | Use Date.now() always |
| Missing Zod validation | Type errors at runtime | safeParse before use |
| No JSDoc header | Confusion for next person | Add header with PRIORITY, AREA, COMPONENT |
| Timestamp inconsistency | Date comparisons fail | Milliseconds only |
| Unauthenticated rule paths | Security vulnerability | Test both auth states |

## Useful Commands

```bash
# Type check
pnpm -w typecheck

# Lint with auto-fix
pnpm -w lint --fix

# Unit tests
pnpm test

# Rules tests
pnpm -w test:rules

# E2E tests (main branch only)
pnpm -w test:e2e

# Full CI check
pnpm -w install --frozen-lockfile && \
  pnpm -w typecheck && \
  pnpm -w lint && \
  pnpm -w test && \
  pnpm -w test:rules
```

## Key Contacts

Code Owner: Patrick Craven

## References

- Types: `packages/types/src/onboarding.ts`
- Helpers: `apps/web/src/lib/userOnboarding.ts`
- API Routes: `apps/web/app/api/onboarding/*`
- Rules: `firestore.rules` + `packages/rules-tests/src/rules.test.ts`
- Copilot Instructions: `/fresh-root/.github/copilot-instructions.md`

[area]: #