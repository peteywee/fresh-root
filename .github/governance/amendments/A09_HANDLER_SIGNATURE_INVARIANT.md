---

title: "A09: Handler Signature Invariant for SDK Factory Routes"
applyTo: "apps/web/app/api/\*\*/route.ts"
priority: "P0"
tags: \["API", "SDK", "PATTERN", "STABILITY"]
effectiveDate: "2025-12-17"
supersedes: \[]
## relatedAmendments: \["A07\_FIREBASE\_IMPL.md", "A03\_SECURITY\_AMENDMENTS.md"]

# A09: Handler Signature Invariant for SDK Factory Routes
## Problem Statement
SDK factory routes (`createOrgEndpoint`, `createPublicEndpoint`, etc.) have experienced repeated
merge conflicts and automated rewrites due to conflicting incentives:

- **Lint cleanup** removes unused handler parameters to satisfy ESLint.
- **SDK standardization** re-adds parameters (especially `context`) to maintain type consistency.
- Each pass triggers a revert in the next pass, creating a ping-pong merge conflict pattern.

Example from `apps/web/app/api/organizations/[id]/members/[memberId]/route.ts`:

```
Commit A:  handler: async ({ context, params })  ← SDK standardization
Commit B:  handler: async ({ params })           ← Lint cleanup
Commit C:  handler: async ({ context, params })  ← SDK re-standardization
Result:    MERGE CONFLICT on the same line
```

## Solution: Handler Signature Invariant
All SDK factory routes MUST follow a locked-in handler destructuring shape. This breaks the churn
cycle by:

1. **Fixing the type shape** so scripts stop re-adding/removing parameters.
2. **Using underscore convention** to satisfy ESLint without deleting parameters.
3. **Creating a structural invariant** that CI and pre-commit hooks can validate.

## Canonical Handler Signature
### Rule
All handlers created via any SDK factory endpoint (`createEndpoint`, `createOrgEndpoint`,
`createPublicEndpoint`, `createAuthenticatedEndpoint`, `createAdminEndpoint`,
`createRateLimitedEndpoint`) MUST destructure exactly these four parameters:

```typescript
handler: async ({ request, input, context, params }) => {
  // business logic
};
```

### Unused Parameter Convention
If a parameter is not used in the handler, rename it with an underscore prefix **in the
destructuring**:

```typescript
// ✅ CORRECT: Keep shape, prefix unused param
handler: async ({ request: _request, input, context: _context, params }) => {
  // Only uses 'params'
};

// ❌ WRONG: Deleting params changes shape
handler: async ({ params }) => {
  // This triggers re-standardization on next SDK update
};

// ❌ WRONG: Renaming at assignment level (defeats linting)
handler: async ({ request, input, context, params }) => {
  const _request = request;
  const _input = input;
  // This still triggers "unused import" warnings
};
```

### Why Underscore Inside Destructuring
- Keeps the type signature stable (no merge conflicts when SDK adds/removes parameters).
- Satisfies ESLint rule `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: "^_"`.
- Prevents automated scripts from deleting parameters, which would break the invariant.
- Communicates intent: "I know this param exists, I'm just not using it yet."

## ESLint Enforcement
Routes MUST configure ESLint to allow underscore-prefixed destructured arguments:

**File**: `eslint.config.mjs`

```javascript
{
  files: ["apps/web/app/api/**/route.ts"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
},
```

This exempts underscore-prefixed destructured arguments from lint warnings, removing the incentive
to delete them.

## Script Safeguards
All scripts that modify route.ts files (`scripts/complete-migrate-routes.mjs`,
`scripts/safe-migrate-routes.mjs`, `scripts/refactor-all.mjs`) MUST:

1. **Preserve the canonical shape** when replacing handler code.
2. **Never delete top-level destructuring parameters** from handler signatures.
3. **Respect underscore-prefixed parameters** as intentional lint suppressions.

Anti-pattern (FORBIDDEN):

```javascript
// DON'T DO THIS IN SCRIPTS
const newHandler = `handler: async ({ params }) => { ... }`;
// This deletes context/request/input and breaks the invariant
```

Correct pattern:

```javascript
// DO THIS INSTEAD
const newHandler = `handler: async ({ request: _request, input: _input, context, params }) => { ... }`;
// Preserve shape, underscore the params you're not using
```

## CI/Pre-Commit Validation
A validator script (`scripts/validate-handler-signature.mjs`) MUST run in:

1. **Pre-commit hook** — blocks commits with signature deviations.
2. **CI** — blocks PRs with signature deviations.

The validator checks:

- All handlers in route.ts files destructure exactly 4 parameters: `request`, `input`, `context`,
  `params`.
- Parameters may be underscore-prefixed if unused.
- No merge conflict markers in handler code.
- No parameter reordering (destructure in order: request, input, context, params).

Validator output on violation:

```
❌ HANDLER SIGNATURE VIOLATION
   File: apps/web/app/api/schedules/route.ts
   Handler: POST (line 42)

   Expected: handler: async ({ request, input, context, params }) => ...
   Found:    handler: async ({ context, params }) => ...

   Reason: Missing 'request' and 'input' parameters

   Fix: Rename unused params with underscore prefix:
        handler: async ({ request: _request, input: _input, context, params }) => ...
```

## Examples
### ✅ Compliant Examples
**GET handler using only context and params:**

```typescript
export const GET = createOrgEndpoint({
  handler: async ({ request: _request, input: _input, context, params }) => {
    return NextResponse.json({ orgId: context.org!.orgId });
  },
});
```

**POST handler using all parameters:**

```typescript
export const POST = createOrgEndpoint({
  input: CreateShiftSchema,
  handler: async ({ request, input, context, params }) => {
    console.log("Request headers:", request.headers);
    console.log("Input:", input);
    console.log("Context:", context.org!.orgId);
    console.log("Params:", params.id);
    return NextResponse.json({ success: true });
  },
});
```

**DELETE handler using only params:**

```typescript
export const DELETE = createOrgEndpoint({
  handler: async ({ request: _request, input: _input, context: _context, params }) => {
    await db.doc(`orgs/${params.orgId}/items/${params.id}`).delete();
    return NextResponse.json({ deleted: true });
  },
});
```

### ❌ Non-Compliant Examples
**Missing request and input:**

```typescript
handler: async ({ context, params }) => { ... }
// ❌ VIOLATES INVARIANT: Missing 'request' and 'input'
```

**Using underscore at assignment level (defeats ESLint):**

```typescript
handler: async ({ request, input, context, params }) => {
  const _request = request;
  const _input = input;
  // ❌ VIOLATES INTENT: Still triggers ESLint warnings; ESLint rule won't match
};
```

**Wrong parameter order:**

```typescript
handler: async ({ context, request, params, input }) => { ... }
// ❌ VIOLATES INVARIANT: Wrong order
```

## Implementation Timeline
| Phase | Action                                            | Owner    | Target Date  |
| ----- | ------------------------------------------------- | -------- | ------------ |
| **1** | Lock canonical rule (this amendment)              | AI Agent | Dec 17, 2025 |
| **2** | Update ESLint config + fix current route          | AI Agent | Dec 17, 2025 |
| **3** | Audit and harden migration scripts                | AI Agent | Dec 17, 2025 |
| **4** | Create validator script + integrate CI/pre-commit | AI Agent | Dec 17, 2025 |
| **5** | Backfill all 22 remaining routes                  | AI Agent | Dec 17, 2025 |
| **6** | Multi-pass verification (confirm churn is dead)   | AI Agent | Dec 17, 2025 |

## Success Criteria
✅ **Immediate**:

- All route.ts files follow canonical handler signature.
- ESLint no longer flags unused handler parameters.
- No merge conflicts on handler destructuring lines.

✅ **Ongoing**:

- Validator catches signature drift before merge.
- Scripts preserve canonical shape on re-runs (no churn).
- New routes auto-follow the pattern (documented in template).

## Rollout
1. **Apply to all existing routes** (Phase 5 of master plan).
2. **Update API route template** (`apps/web/app/api/_template/route.ts`) to demonstrate canonical
   signature.
1. **Document in README and instructions** (reference this amendment).
2. **Monitor CI validator** for any violations (should be zero after backfill).

## Related Standards
- [A03\_SECURITY\_AMENDMENTS.md](./A03_SECURITY_AMENDMENTS.md) — Organization scoping and auth
  patterns.
- [A07\_FIREBASE\_IMPL.md](./A07_FIREBASE_IMPL.md) — Firebase Admin SDK usage.
- [api-framework-memory.instructions.md](../.github/instructions/api-framework-memory.instructions.md)
  — SDK factory typing strategy.

---

**Status**: ACTIVE\
**Last Updated**: Dec 17, 2025\
**Approval**: AI Agent (Architecture Authority)
