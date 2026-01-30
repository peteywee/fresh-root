# ERROR PATTERN: Type Assertions Bypassing Zod Validation

**Status**: ACTIVE SAFEGUARD\
**Detection Date**: December 12, 2025\
**Severity**: P0 CRITICAL\
**Occurrences Detected**: 20+\
**High-Risk Files**: `batch/route.ts` (6), `shifts/route.ts` (3), `positions/route.ts` (2)

---

## Problem Definition

The **Triad of Trust** pattern requires:

1. ✅ Zod schema in `packages/types/src/`
2. ✅ API route with input validation
3. ✅ Firestore rules enforcement

**This pattern violates rule #2** by using type assertions (`as Record<string, unknown>`, `as any`)
that:

- Bypass Zod schema validation
- Hide type mismatches at runtime
- Defeat TypeScript's type safety
- Create security vulnerabilities (unvalidated data flows)

### ❌ ANTI-PATTERN Examples

```typescript
// BAD: Type assertion bypasses validation
const validated = input as Record<string, unknown>;
const data = (item as any).payload || {};
const result = await process(input as any);
```

**Why this breaks trust**:

```
Zod validation ✅ → Type Assertion ❌ → No validation happening!
                    (Trust broken here)
```

---

## Detection Rules

### ESLint Configuration

Add to `eslint.config.mjs`:

```javascript
{
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-type-assertion': 'off',  // Allow when necessary
    'no-type-assertion-without-validation': {       // Custom rule
      severity: 'error',
      patterns: [
        'as Record<',
        'as any',
        '(.*as.*unknown)',
      ]
    }
  }
}
```

### Pre-Commit Hook Check

Add to `.husky/pre-commit`:

```bash
# Detect type assertions bypassing validation
if grep -r "as Record<string, unknown>\|as any\|(.*as.*unknown)" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir=node_modules \
  apps/web/app/api/ 2>/dev/null; then
  echo "ERROR: Type assertions detected in API routes"
  echo "Use z.parse() or z.safeParse() instead of type assertions"
  exit 1
fi
```

---

## Required Fix Pattern

### ✅ CORRECT: Use Zod Validation

```typescript
// GOOD: Zod validation enforced
import { z } from "zod";
import { ShiftSchema } from "@fresh-schedules/types";

export const PATCH = createOrgEndpoint({
  input: ShiftSchema.partial(),  // ← Input validated here
  handler: async ({ input, context }) => {
    // input is type-safe and validated
    const shiftData = input;  // ✅ No type assertion needed

    // Firestore operation
    await db.doc(...).update(shiftData);
    return NextResponse.json(shiftData);
  },
});
```

### Refactoring Rules

1. **Never use `as any`**
   - Replace with explicit Zod schema
   - Or narrow type with `if` checks

1. **Never use `as Record<string, unknown>`**
   - Define proper schema
   - Use `z.record()` if needed

1. **Array items must be validated**
   - Don't do: `(item as any).payload`
   - Do: `ItemSchema.parse(item).payload`

---

## Files Requiring Fix (Priority Order)

| File                         | Issue              | Fix                                |
| ---------------------------- | ------------------ | ---------------------------------- |
| `batch/route.ts`             | 6× `as any`        | Define item schema, validate array |
| `shifts/route.ts`            | 3× type assertions | Use SDK factory input validation   |
| `positions/route.ts`         | 2× type assertions | Use SDK factory input validation   |
| `organizations/route.ts`     | 2× type assertions | Use SDK factory input validation   |
| `session/bootstrap/route.ts` | `context: any`     | Type context parameter             |
| `publish/route.ts`           | `context: any`     | Type context parameter             |

---

## Validation Gates

### Before Commit

```bash
# Must pass with 0 violations
eslint --rule '@typescript-eslint/no-explicit-any: error' apps/web/app/api/**/*.ts
```

### TypeScript Strict Mode

Ensure `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true
  }
}
```

### Test Coverage

All routes with assertions must have:

- ✅ Input validation tests
- ✅ Type safety tests
- ✅ Firestore rule tests

---

## Architecture Decision

### Why This Matters

The **Triad of Trust** pattern ensures:

```
Schema (Source of Truth)
    ↓
API Route (Validates input)
    ↓
Firestore Rules (Enforces at DB)
```

Type assertions break this chain at step 2, allowing invalid data to flow to Firestore where
security rules might also fail, leaving gaps.

### Long-term Solution

1. **Create SafeInput wrapper type** in `packages/api-framework`
2. **Auto-generate schemas** from TypeScript interfaces
3. **Enforce at lint time** - reject all type assertions in API routes
4. **Add pattern validator** - `node scripts/validate-patterns.mjs` includes this check

---

## Red Team Veto Triggers

🚫 **BLOCK DEPLOYMENT IF:**

- New type assertions added to API routes
- Any `as any` in handler functions
- Input parameter typed as `unknown` instead of validated schema
- Batch operations bypass item validation

---

## Next Steps

1. ✅ **Safeguard Created** (this file)
2. 🔜 **Fix High-Risk Routes** (batch/route.ts first)
3. 🔜 **Add ESLint Rule** (prevent regression)
4. 🔜 **Update Pattern Validator** (enforce automatically)
5. 🔜 **Security Red Team Review** (sign-off)

---

**Created**: 2025-12-12\
**Validated By**: Error Protocol v3.2\
**Status**: ACTIVE ENFORCEMENT\
**Last Updated**: 2025-12-12
