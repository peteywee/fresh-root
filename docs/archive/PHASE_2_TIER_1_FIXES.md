# FRESH Engine Phase 2: Tier 1 Integrity Fixes

**Objective:** Fix 7 Tier 1 (Integrity) violations to reach 0 Tier 1 issues and improve score by ~7 points.

**Baseline:** 7 Tier 1 issues
**Target:** 0 Tier 1 issues
**Score Improvement:** ~7 points (would reach ~32+ after Phase 1)
**Start After:** Phase 1 complete (Tier 0 = 0)

---

## Issue Breakdown

### Issue 1: `packages/types/src/compliance/index.ts`

- **Violations:**
  1. Missing Zod import
  2. Missing type inference pattern
- **Fix:** Add Zod schema and inferred type
- **Pattern:**

  ```ts
  import { z } from "zod";

  export const ComplianceSchema = z.object({
    // define fields
  });

  export type Compliance = z.infer<typeof ComplianceSchema>;
  ```

### Issue 2: `packages/types/src/index.ts`

- **Violations:**
  1. Missing type inference pattern
- **Fix:** Check what types are exported; ensure they use z.infer pattern
- **Note:** This may be a re-export file; apply pattern consistently

### Issue 3: `packages/types/src/links/corpOrgLinks.v14.ts`

- **Violations:**
  1. Missing Zod import
  2. Missing type inference pattern
- **Fix:** Add Zod schema and inferred type for this versioned entity

### Issue 4: `packages/types/src/links/corpOrgLinks.v14.ts` (same file)

- **Note:** Counted twice in validator output; both violations in same file

### Issue 5: `packages/types/src/links/index.ts`

- **Violations:**
  1. Missing Zod import
  2. Missing type inference pattern
- **Fix:** Add Zod schema and inferred type

### Issue 6: `packages/types/src/links/index.ts` (same file)

- **Note:** Counted twice; both violations in same file

### Issue 7: (summary)

- **Total unique files to fix:** 3
  1. `packages/types/src/compliance/index.ts` (2 violations)
  2. `packages/types/src/links/corpOrgLinks.v14.ts` (2 violations)
  3. `packages/types/src/links/index.ts` (2 violations)

---

## Implementation Plan

### Step 1: Review Current Files

Check what exists in each file:

```bash
cat packages/types/src/compliance/index.ts
cat packages/types/src/links/corpOrgLinks.v14.ts
cat packages/types/src/links/index.ts
```

### Step 2: Fix `compliance/index.ts`

If currently re-exporting types without schemas:

```ts
// Before
export type Compliance = {
  /* fields */
};

// After
import { z } from "zod";

export const ComplianceSchema = z.object({
  // Define fields based on current type
});

export type Compliance = z.infer<typeof ComplianceSchema>;
```

### Step 3: Fix `links/corpOrgLinks.v14.ts`

Same pattern — wrap existing type definition in Zod schema.

### Step 4: Fix `links/index.ts`

Same pattern — ensure all exports follow `Schema + z.infer<typeof Schema>` pattern.

### Step 5: Verify

Run validator:

```bash
FRESH_PATTERNS_MIN_SCORE=0 pnpm lint:patterns --verbose
```

Expected output:

- 🔴 Tier 0 (Security): 0 ✅
- 🟠 Tier 1 (Integrity): 0 ✅
- 🎯 Complete Triads: 3/3 ✅

### Step 6: Commit

```bash
git add -A
git commit -m "fix: resolve 7 Tier 1 integrity violations

Add Zod schemas and type inference patterns to:
- packages/types/src/compliance/index.ts
- packages/types/src/links/corpOrgLinks.v14.ts
- packages/types/src/links/index.ts

Ensures all cross-API entity types follow Zod pattern.

Tier 1 violations: 7 → 0 ✅
Score improved from ~25 to ~32 points"
```

---

## Verification Checklist

- \[ ] `packages/types/src/compliance/index.ts` has `z.infer` type export
- \[ ] `packages/types/src/links/corpOrgLinks.v14.ts` has Zod schema
- \[ ] `packages/types/src/links/index.ts` has Zod schema
- \[ ] Validator reports 0 Tier 1 issues
- \[ ] TypeCheck passes
- \[ ] Build succeeds

---

## Success Criteria

✅ **Phase 2 Complete** when:

- Tier 0 count: 0 ✅
- Tier 1 count: 0 ✅
- Score: ~32+ points
- All 7 Tier 1 violations resolved

---

## After Phase 2

With Tier 0 and Tier 1 complete, you'll have:

- ✅ 0 security violations
- ✅ 0 integrity violations
- 🟡 45 style/header violations (optional Phase 3)
- 🎯 Score: ~32-38 points (depending on Triad bonuses)

**Next milestone:** Reach score 70+ by addressing remaining issues or Tier 3 cleanup.

---

## Timeline

**Estimated time to complete:** 30-45 minutes

- Review & fix files: 20-30 min
- Verification: 10 min
- Commit: 5 min

Can proceed immediately after Phase 1 completion.
