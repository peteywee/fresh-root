# TypeScript Error Prevention & Pattern Recognition
## Series-A Standards: Error Safeguards
This document tracks recurring error patterns across FRESH-ROOT and establishes safeguards to prevent them from reoccurring.

---

## Error Pattern Analysis: Recent Session
### Summary
**Date**: December 1, 2025\
**Total Errors Found**: 427 TypeScript errors (all in `@apps/web`)\
**Root Cause**: SDK factory migration (commit 6639062) introduced broken code refactoring\
**Resolution**: Reverted route files to previous working commit HEAD

### Error Breakdown
| Error Code | Count | Category | Pattern                                | Prevention                                      |
| ---------- | ----- | -------- | -------------------------------------- | ----------------------------------------------- |
| TS1128     | 233   | Syntax   | "Declaration or statement expected"    | Missing closing braces/parens in handlers       |
| TS1005     | 158   | Syntax   | "Unexpected token or missing operator" | Malformed function signatures                   |
| TS1472     | 32    | Syntax   | "catch/finally expected"               | Incomplete try-catch blocks                     |
| TS1109     | 4     | Type     | Type compatibility issues              | React version mismatch (Link, Image components) |

### Errors Occurring >3 Times
#### 1. **TS1128: "Declaration or statement expected" (233 occurrences)**
**Pattern Identified**: Route handlers had duplicate/malformed function signatures

```typescript
// BROKEN (from SDK factory migration):
export const POST = createAuthenticatedEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (req: NextRequest, context: { params: Record<string, string>; userId: string }) => {
      // Double async signatures, nesting error
      try {
        body = await req.json(;  // Missing closing paren
  }
});  // Misplaced closing braces
```

**Why It Happened**: Refactor merged two different handler patterns (old `withSecurity` and new `createAuthenticatedEndpoint`)

**Prevention Rule**:

- ✅ Use code review checklist for refactors affecting >5 files
- ✅ Run `pnpm typecheck` before committing refactors
- ✅ Use `git diff` to spot doubled code blocks during rebase/merge
- ✅ Add ESLint rule to detect nested async function declarations

---

#### 2. **TS1005: "')' expected" (158 occurrences)**
**Pattern Identified**: Missing closing parentheses in method calls

```typescript
// BROKEN:
body = await req.json(;  // Missing closing paren

// CORRECT:
body = await req.json();
```

**Files Affected**: All 22 route files in `app/api/*`

**Prevention Rule**:

- ✅ Enable IDE bracket-matching highlighting
- ✅ Use Prettier's bracket-tracking formatter
- ✅ Add pre-commit ESLint rule: `no-missing-parens` (custom rule)
- ✅ Add TypeScript strict mode check for incomplete expressions

---

#### 3. **TS1472: "catch or finally expected" (32 occurrences)**
**Pattern Identified**: Try blocks without catch/finally due to malformed nesting

```typescript
// BROKEN:
try {
  body = await req.json(;
}
// No catch clause, error before catch reaches parser
```

**Prevention Rule**:

- ✅ ESLint rule: `no-empty-try-catch` with mandatory catch
- ✅ Require `catch` or `finally` after every `try`
- ✅ TypeScript: Enable `strict` mode to catch incomplete statements

---

### Root Causes (Avoid >3 Recurrence)
| Cause                                  | Occurrences | Prevention                              | Status          |
| -------------------------------------- | ----------- | --------------------------------------- | --------------- |
| Incomplete refactors without typecheck | 427         | Require pre-commit typecheck            | ✅ Implemented  |
| Merging conflicting handler patterns   | 427         | Code review for refactors               | ✅ Policy added |
| Copy-paste errors in duplicated code   | 233         | Remove `eslint_d` daemon (inconsistent) | ✅ Done         |
| Malformed async/await syntax           | 158         | Enable ESLint strict parsing            | ✅ In progress  |
| Missing try-catch braces               | 32          | Enforce brace style formatting          | ✅ Pre-commit   |

---

## ESLint Configuration: Safeguards
### Current Rules (Root: `eslint.config.mjs`)
```javascript
// Prevent incomplete try-catch
'no-empty': ['error', { allowEmptyCatch: false }],

// Prevent async nesting issues
'@typescript-eslint/no-floating-promises': 'error',

// Enforce consistent brace style
'brace-style': ['error', '1tbs', { allowSingleLine: false }],

// Prevent unused variables (common in incomplete refactors)
'unused-imports/no-unused-imports': 'error',
```

### To Add for Enhanced Protection
```javascript
// Custom rule: detect doubled handler signatures
'no-duplicate-case': 'error',  // Catches duplicate patterns

// Custom rule: enforce complete statements
'no-incomplete-function-calls': 'error',  // Custom ESLint plugin

// TypeScript strict mode
'@typescript-eslint/prefer-function-type': 'error',
```

---

## Pre-Commit Hook Safeguards
### File: `.husky/pre-commit`
**Current State**: Runs typecheck, format, and tag-files

**Enhanced Protection Needed**:

```bash
# !/bin/sh
# Pre-commit: Prevent syntax errors before commit
# 1. Enforce pnpm (prevent npm accidents)
node scripts/enforce-pnpm.js || exit 1

# 2. Auto-tag files (track changes)
node scripts/tag-files.mjs || exit 1

# 3. TYPE CHECK REQUIRED - prevents TS1128/TS1005 errors
pnpm -w typecheck || exit 1

# 4. Format (catches brace/paren issues)
pnpm -w format || exit 1

# 5. Lint (catches unused-imports, etc)
pnpm -w lint || exit 1

# 6. Detect common error patterns
node scripts/detect-error-patterns.js || exit 1

echo "[husky] Pre-commit checks passed ✅"
```

---

## Error Prevention Checklist
### Before Committing Code Changes
- \[ ] Ran `pnpm typecheck` - all errors fixed?
- \[ ] Ran `pnpm lint` - no new warnings?
- \[ ] Ran `pnpm format` - consistent style?
- \[ ] Check `git diff` for doubled code blocks?
- \[ ] Is `try` followed by `catch` or `finally`?
- \[ ] Are function parentheses balanced? (matching parens)
- \[ ] No nested `async () => async () => {}` patterns?
- \[ ] Commits reference which error patterns are fixed?

### Before Pushing to Remote
- \[ ] `git --no-pager diff HEAD~1 HEAD` shows clean changes?
- \[ ] Pre-push hook passed all checks?
- \[ ] No "red herring" changes from merge conflicts?
- \[ ] CI/CD pipeline will pass lint and typecheck?

### Before Merging PR
- \[ ] Code review approved?
- \[ ] No errors marked as "BROKEN" in comments?
- \[ ] TypeScript errors are 0 in CI logs?
- \[ ] Linting score improved or unchanged?

---

## Series-A Standards Enforcement
### Level 1: Local Development (Your Machine)
```bash
# Install pre-commit hooks
pnpm install

# Automatic checks on every commit
git commit -m "fix: ..."  # Pre-commit hook runs typecheck

# Skip if needed (only for debugging)
git commit --no-verify
```

### Level 2: Branch Protection (GitHub)
```yaml
# .github/workflows/ci.yml
- name: Type Check
  run: pnpm typecheck

- name: Lint
  run: pnpm lint

- name: Error Pattern Detection
  run: node scripts/detect-error-patterns.js
```

### Level 3: Release Gating (Series-A)
```bash
# Release script checks for zero errors
pnpm release:series-a  # Fails if any TS errors exist
```

---

## Monitoring Dashboard (Future)
**TODO**: Add error metrics collection:

```bash
# Count errors by category each week
pnpm typecheck 2>&1 | grep "error TS" > error-report.txt

# Track trend
cat error-report.txt | wc -l  # Should stay at 13 (React version only)
```

---

## References
- **TypeScript Error Codes**: https://www.typescriptlang.org/docs/handbook/error-index.html
- **ESLint Rules**: https://eslint.org/docs/rules/
- **Husky Docs**: https://typicode.github.io/husky/
- **Series-A Standards**: See `docs/PRODUCTION_READINESS.md`

---

**Last Updated**: December 1, 2025\
**Maintained By**: FRESH-ROOT Core Team\
**Severity Level**: Series-A Compliance - Errors logged for future prevention
