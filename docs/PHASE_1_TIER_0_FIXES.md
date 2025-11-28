# FRESH Engine Phase 1: Tier 0 Security Fixes

**Objective:** Fix 13 Tier 0 (Security) violations to reach 0 Tier 0 issues and improve score by ~25 points.

**Baseline:** 13 Tier 0 issues, Score: 0.0
**Target:** 0 Tier 0 issues, Score: ~25+
**Deadline:** Ready for Phase 2 (Tier 1 integrity)

---

## Task Breakdown

### Part 1: Public Endpoints Missing Security Wrappers (6 issues)

**Issue Type:** Tier 0 — API route missing security wrapper

These endpoints are currently exposed without authentication/authorization. Each needs a security wrapper added at the top level.

#### Task 1.1: `apps/web/app/api/health/route.ts`
- **Issue:** No security wrapper
- **Fix:** Wrap handler with `withSecurity` 
- **Status:** ⏳ TODO
- **Expected:** GET handler protected

#### Task 1.2: `apps/web/app/api/healthz/route.ts`
- **Issue:** No security wrapper
- **Fix:** Wrap handler with `withSecurity`
- **Status:** ⏳ TODO
- **Expected:** GET handler protected

#### Task 1.3: `apps/web/app/api/metrics/route.ts`
- **Issue:** No security wrapper
- **Fix:** Wrap handler with `withSecurity`
- **Status:** ⏳ TODO
- **Expected:** GET handler protected

#### Task 1.4: `apps/web/app/api/internal/backup/route.ts`
- **Issue:** No security wrapper
- **Fix:** Wrap handler with `withSecurity` (or more restrictive wrapper for internal use)
- **Status:** ⏳ TODO
- **Expected:** GET handler protected

#### Task 1.5: `apps/web/app/api/session/route.ts`
- **Issue:** No security wrapper
- **Fix:** Wrap handler with `withSecurity`
- **Status:** ⏳ TODO
- **Expected:** All handlers protected

#### Task 1.6: `apps/web/app/api/onboarding/admin-form/route.ts`
- **Issue:** No security wrapper
- **Fix:** Wrap handler with `withSecurity` or `requireRole('admin')`
- **Status:** ⏳ TODO
- **Expected:** GET handler protected

**Pattern to apply:**

Before:
```ts
export async function GET(request: NextRequest) {
  // handler logic
}
```

After:
```ts
export const GET = withSecurity(async (context: NextRequest) => {
  // handler logic
});
```

---

### Part 2: Write Endpoints Missing Validation (7 issues)

**Issue Type:** Tier 0 — Write API routes must validate input using Zod before use

These POST/PATCH endpoints need input validation added. Look for Zod schema imports and validation calls.

#### Task 2.1: `apps/web/app/api/auth/mfa/setup/route.ts`
- **Issue:** POST without validation
- **Fix:** Add `PostSchema` validation before processing
- **Pattern:** `const result = PostSchema.safeParse(body); if (!result.success) return error;`
- **Status:** ⏳ TODO
- **Current:** Check if schema exists in types

#### Task 2.2: `apps/web/app/api/onboarding/activate-network/route.ts`
- **Issue:** POST without validation
- **Fix:** Add input validation schema
- **Status:** ⏳ TODO

#### Task 2.3: `apps/web/app/api/onboarding/create-network-corporate/route.ts`
- **Issue:** POST without validation
- **Fix:** Add input validation schema
- **Status:** ⏳ TODO

#### Task 2.4: `apps/web/app/api/onboarding/create-network-org/route.ts`
- **Issue:** POST without validation
- **Fix:** Add input validation schema
- **Status:** ⏳ TODO

#### Task 2.5: `apps/web/app/api/onboarding/join-with-token/route.ts`
- **Issue:** POST without validation
- **Fix:** Add input validation schema
- **Status:** ⏳ TODO

#### Task 2.6: `apps/web/app/api/onboarding/verify-eligibility/route.ts`
- **Issue:** POST without validation
- **Fix:** Add input validation schema
- **Status:** ⏳ TODO

#### Task 2.7: `apps/web/app/api/session/bootstrap/route.ts`
- **Issue:** POST without validation
- **Fix:** Add input validation schema
- **Status:** ⏳ TODO

**Pattern to apply:**

Before:
```ts
export const POST = withSecurity(async (context) => {
  const body = await parseJson(context.request);
  // use body directly without validation
});
```

After:
```ts
export const POST = withSecurity(async (context) => {
  const body = await parseJson(context.request);
  
  // Validate input
  const result = RequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: result.error.issues },
      { status: 400 }
    );
  }
  
  const validated = result.data;
  // Now use validated data
});
```

---

## Execution Plan

### Step 1: Identify and Fix Part 1 (Security Wrappers)
1. Open each file in Part 1 (6 files)
2. Check current structure
3. Apply `withSecurity` wrapper
4. Test that validator no longer reports security wrapper missing

### Step 2: Identify and Fix Part 2 (Validation)
1. Open each file in Part 2 (7 files)
2. Find or create Zod schema in `packages/types/src/`
3. Add validation logic before processing body
4. Return 400 error if validation fails
5. Test that validator no longer reports validation missing

### Step 3: Verify All Fixes
```bash
FRESH_PATTERNS_MIN_SCORE=0 pnpm lint:patterns --verbose
```

Expected output:
- 🔴 Tier 0 (Security): 0 ✅
- 🟠 Tier 1 (Integrity): 7 (not fixed yet)

### Step 4: Commit Phase 1 Changes
```bash
git add -A
git commit -m "fix: resolve all 13 Tier 0 security violations

- Add security wrappers to 6 public endpoints
- Add Zod validation to 7 write endpoints
- Update schemas as needed

Score improved from 0.0 to ~25 points
Tier 0 violations: 13 → 0 ✅"
```

---

## Verification Checklist

After applying all fixes, verify:

- [ ] All 6 public endpoints have `withSecurity` wrapper
- [ ] All 7 write endpoints validate input with Zod
- [ ] Validator runs without Tier 0 errors
- [ ] Build succeeds: `pnpm build`
- [ ] TypeCheck passes: `pnpm typecheck`
- [ ] Lint passes: `pnpm lint`

---

## Success Criteria

✅ **Phase 1 Complete** when:
- Tier 0 count: 0
- Tier 1 count: 7 (unchanged, will fix in Phase 2)
- Pattern score: ~25+ points
- All 13 Tier 0 violations resolved
- Changes committed to dev branch

---

## Notes

- Schemas may already exist in `packages/types/src/` — check before creating
- Use `parseJson()` utility already in middleware
- Refer to `SYMMETRY_FRAMEWORK.md` for API route fingerprint
- Keep headers consistent: `// [P0][API][CODE] Description`

---

## Timeline

**Estimated time to complete:** 1-2 hours
- Part 1 (wrappers): 30 min
- Part 2 (validation): 60-90 min
- Verification & commit: 15 min

Ready to start? Begin with Part 1 Task 1.1.
