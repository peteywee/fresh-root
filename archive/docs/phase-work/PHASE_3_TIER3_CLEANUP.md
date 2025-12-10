# FRESH Engine Phase 3: Tier 3 Style Cleanup (Optional)
**Objective:** Add missing API headers to remaining routes for style compliance.

**Baseline:** 45 Tier 3 (Style) violations
**Target:** 0 Tier 3 violations (optional)
**Score Improvement:** ~22 points (if completed)
**Scope:** Optional but recommended to reach 70+ score threshold

---

## Issue Summary
**Tier 3 violations are style/cosmetic only:**

- Missing standard headers on API routes
- Missing headers on schema files

**Current violations:**

- \~32 API routes missing header: `// [P#][API][CODE] Description`
- \~13 schema files missing header: `// [P#][SCHEMA][DOMAIN] Description`

---

## Standard Headers
### API Route Header
All route.ts files should start with:

```ts
// [P0][API][CODE] Brief description of endpoint
// Tags: tag1, tag2 (optional)

import { ... }
```

**Example:**

```ts
// [P0][API][CODE] Health check endpoint
// Tags: monitoring, public

export async function GET(request: NextRequest) {
  // ...
}
```

### Schema Header
All schema files should start with:

```ts
// [P1][SCHEMA][DOMAIN] Brief description of entity
// Tags: tag1, tag2 (optional)

import { z } from "zod";
```

**Example:**

```ts
// [P1][SCHEMA][DOMAIN] Compliance reporting schema
// Tags: compliance, validation

export const ComplianceSchema = z.object({
  // ...
});
```

---

## Files to Update
### API Routes (Priority: Low)
The following routes need headers added:

```
apps/web/app/api/_template/route.ts
apps/web/app/api/attendance/route.ts
apps/web/app/api/auth/mfa/setup/route.ts
apps/web/app/api/health/route.ts
apps/web/app/api/healthz/route.ts
apps/web/app/api/internal/backup/route.ts
apps/web/app/api/items/route.ts
apps/web/app/api/join-tokens/route.ts
apps/web/app/api/metrics/route.ts
apps/web/app/api/onboarding/activate-network/route.ts
apps/web/app/api/onboarding/admin-form/route.ts
apps/web/app/api/onboarding/create-network-corporate/route.ts
apps/web/app/api/onboarding/create-network-org/route.ts
apps/web/app/api/onboarding/join-with-token/route.ts
apps/web/app/api/onboarding/profile/route.ts
apps/web/app/api/onboarding/verify-eligibility/route.ts
apps/web/app/api/organizations/[id]/members/[memberId]/route.ts
apps/web/app/api/organizations/[id]/members/route.ts
apps/web/app/api/organizations/[id]/route.ts
apps/web/app/api/organizations/route.ts
apps/web/app/api/positions/[id]/route.ts
apps/web/app/api/positions/route.ts
apps/web/app/api/publish/route.ts
apps/web/app/api/schedules/[id]/route.ts
apps/web/app/api/schedules/route.ts
apps/web/app/api/session/bootstrap/route.ts
apps/web/app/api/session/route.ts
apps/web/app/api/shifts/[id]/route.ts
apps/web/app/api/shifts/route.ts
apps/web/app/api/users/profile/route.ts
apps/web/app/api/venues/route.ts
apps/web/app/api/widgets/route.ts
apps/web/app/api/zones/route.ts
```

### Schema Files (Priority: Medium)
```
packages/types/src/compliance/index.ts
packages/types/src/compliance.ts
packages/types/src/corporates.ts
packages/types/src/errors.ts
packages/types/src/events.ts
packages/types/src/links/corpOrgLinks.v14.ts
packages/types/src/links/index.ts
packages/types/src/messages.ts
packages/types/src/onboarding.ts
packages/types/src/rbac.ts
packages/types/src/receipts.ts
packages/types/src/widgets.ts
```

---

## Implementation Strategy
### Option A: Automated Script
Create a script to add headers to all files:

```bash
# !/bin/bash
# Add API header to all route.ts
for file in $(find apps/web/app/api -name 'route.ts'); do
  if ! grep -q "// \[P" "$file"; then
    sed -i '1i // [P0][API][CODE] API endpoint handler' "$file"
  fi
done

# Add schema header to all schema files
for file in $(find packages/types/src -name '*.ts'); do
  if ! grep -q "// \[P" "$file"; then
    sed -i '1i // [P1][SCHEMA][DOMAIN] Schema definition' "$file"
  fi
done
```

### Option B: Manual Per-File
Edit each file individually to add appropriate header based on content.

**Recommendation:** Option A (automated) + manual review for accuracy.

---

## Execution Steps
1. **Review current state:**

   ```bash
   pnpm lint:patterns:verbose | grep "Header Present"
   ```

1. **Apply headers using script or manual edits**

1. **Verify:**

   ```bash
   FRESH_PATTERNS_MIN_SCORE=0 pnpm lint:patterns --verbose
   ```

   Expected: 🟢 Tier 3 (Style): 0

1. **Commit:**

   ```bash
   git commit -m "style: add standard headers to all API routes and schemas

   Add consistent file headers following SYMMETRY_FRAMEWORK pattern:
   - // [P0][API][CODE] for route handlers
   - // [P1][SCHEMA][DOMAIN] for schema definitions

   Tier 3 violations: 45 → 0 ✅
   Pattern score improved to 70+ ✅"
   ```

---

## Verification Checklist
- \[ ] All API routes have `// [P#][API][CODE]` header
- \[ ] All schema files have `// [P#][SCHEMA][DOMAIN]` header
- \[ ] Validator reports 0 Tier 3 issues
- \[ ] Score ≥ 70

---

## Success Criteria
✅ **Phase 3 Complete** when:

- Tier 0: 0 ✅
- Tier 1: 0 ✅
- Tier 3: 0 ✅
- Score: 70+ ✅

**Final State:** All tiers clean, ready for production standards enforcement.

---

## Priority
🟡 **Optional** — Not required for security/integrity

- Improves developer experience
- Standardizes codebase appearance
- Enables better tooling/automation

**When to do:** After Phase 1 & 2 are complete and validated.

---

## Timeline
**Estimated time to complete:** 30-45 minutes

- Script generation: 10 min
- Review & adjust: 15 min
- Verification: 10 min
- Commit: 5 min

Can be done in parallel or after Phase 2, depending on priority.
