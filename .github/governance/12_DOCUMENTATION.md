# FRESH SCHEDULES - DOCUMENTATION

> **Version**: 1.0.0\
> **Status**: REFERENCE\
> **Authority**: Sr Dev / Architecture\
> **Binding**: NO - Reference material

This document covers SDK behavior, fix issues, troubleshooting, and known limitations.

---

## SDK OVERVIEW

### What the SDK Does

The Fresh Schedules SDK provides:

1. **Schema Factories** - Build Zod schemas with less boilerplate
2. **Endpoint Factories** - Create secure API routes
3. **Pattern Validation** - Check code against standards
4. **Error Detection** - Find TypeScript issues with fixes

### What the SDK Doesn't Do

1. **Magic fixes** - Some issues require manual intervention
2. **Config management** - tsconfig/eslint changes are manual
3. **Architecture decisions** - Uses existing patterns, doesn't invent
4. **Full type inference** - Complex generics may need help

---

## WHY FIX BREAKS

### The Problem

You run `pnpm lint --fix` and it:

- Fixes some things ✅
- Breaks other things ❌
- Leaves you worse off than before 😤

### Root Causes

#### 1. Conflicting Tools

```bash
# ESLint wants single quotes
const name = 'hello';

# Prettier wants double quotes (if configured)
const name = "hello";

# They fight, you lose
```

**Solution**: Use `eslint-config-prettier` to disable ESLint formatting rules:

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    "next/core-web-vitals",
    "prettier", // This disables conflicting rules
  ],
};
```

#### 2. Order Matters

```bash
# WRONG: Fix in wrong order
pnpm lint --fix  # Might undo format changes
pnpm format

# RIGHT: Format last
pnpm lint --fix
pnpm format
# Or use a combined command
```

#### 3. Type-Breaking Fixes

ESLint can "fix" code that then breaks TypeScript:

```typescript
// BEFORE: Works but lint warning
const result = someFunction();
console.log(result); // 'result' is unused

// AFTER --fix: Lint happy, types broken
someFunction(); // Return value ignored, but type expected it!
```

**Solution**: Always run typecheck after fix:

```bash
pnpm lint --fix && pnpm typecheck
```

#### 4. Partial Fixes

Some patterns can't be auto-fixed:

```typescript
// Pattern violation: Missing org scope
// The fix requires understanding your intent
export async function GET(req: Request) {
  return Response.json(data); // Where's orgId?
}

// SDK can't auto-fix because it doesn't know:
// - What data should be scoped
// - What roles are needed
// - What the handler should do
```

#### 5. Version Mismatches

```bash
# Different packages have different Zod versions
pnpm why zod
# zod@3.22.0 in root
# zod@3.21.0 in packages/types
# zod@3.23.0 in apps/web
# Types don't match, inference breaks
```

**Solution**: Dedupe dependencies:

```bash
pnpm dedupe
# Or pin version in root package.json
```

---

## FIX CAPABILITY MATRIX

| Issue               | Auto-Fix?  | SDK Handles?         | What to Do           |
| ------------------- | ---------- | -------------------- | -------------------- |
| Missing semicolon   | ✅ Yes     | ✅ `pnpm format`     | Run format           |
| Wrong quotes        | ✅ Yes     | ✅ `pnpm format`     | Run format           |
| Unused import       | ✅ Yes     | ✅ `pnpm lint --fix` | Run lint fix         |
| Missing return type | ⚠️ Partial | ⚠️ Suggests          | Add manually         |
| Implicit any        | ⚠️ Partial | ⚠️ Detects           | Add type annotation  |
| Module not found    | ❌ No      | ❌ Reports           | Fix tsconfig         |
| Pattern violation   | ⚠️ Varies  | ✅ Reports           | Follow pattern guide |
| Type mismatch       | ❌ No      | ❌ Reports           | Fix logic            |
| Security issue      | ❌ No      | ✅ Reports           | Manual review        |

### Legend

- ✅ **Yes**: Fully automatic
- ⚠️ **Partial**: Helps but may need manual work
- ❌ **No**: Requires manual intervention

---

## COMMON ISSUES

### TS2307: Module Not Found

```
Cannot find module '@fresh-schedules/types' or its corresponding type declarations.
```

**Cause**: Path mapping not configured

**Fix**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@fresh-schedules/*": ["./packages/*/src"]
    }
  }
}
```

**SDK can**: Detect and report **SDK cannot**: Modify tsconfig

---

### TS2345: Argument Type Mismatch (Zod)

```
Argument of type 'ZodObject<...>' is not assignable to parameter of type 'ZodType<unknown>'
```

**Common Causes**:

1. **Zod version mismatch**

   ```bash
   pnpm why zod
   pnpm dedupe
   ```

1. **Over-constrained generics**

   ```typescript
   // WRONG
   function validate(schema: ZodType<unknown>) {...}

   // RIGHT
   function validate<T extends ZodTypeAny>(schema: T): z.infer<T> {...}
   ```

1. **Missing generic preservation**

   ```typescript
   // WRONG - loses type info
   const wrapped = (schema) => schema.parse(data);

   // RIGHT - preserves type
   const wrapped = <T extends ZodTypeAny>(schema: T) => schema.parse(data) as z.infer<T>;
   ```

**SDK can**: Detect the error, suggest fixes **SDK cannot**: Auto-fix without understanding context

---

### TS7031: Implicit Any Parameter

```
Parameter 'req' implicitly has an 'any' type.
```

**Cause**: Missing type annotation

**Fix**:

```typescript
// BEFORE
export async function GET(req) {...}

// AFTER
import { NextRequest } from 'next/server';
export async function GET(req: NextRequest) {...}
```

**SDK can**: Detect and sometimes suggest type **SDK cannot**: Always know the correct type

---

### Pattern Violations

#### API_001: Missing Org Scope

```typescript
// VIOLATION
export async function GET(req: Request) {
  const data = await db.collection("schedules").get();
  return Response.json(data);
}

// FIX
export const GET = createOrgEndpoint({
  roles: ["scheduler"],
  handler: async ({ context }) => {
    const data = await getSchedules(context.orgId);
    return { success: true, data };
  },
});
```

**SDK can**: Detect violation, show correct pattern **SDK cannot**: Auto-refactor (different
structure)

---

### SEC_001: Firestore Rules Gap

```javascript
// VIOLATION - No org check
match /schedules/{scheduleId} {
  allow read, write: if request.auth != null;
}

// FIX
match /organizations/{orgId}/schedules/{scheduleId} {
  allow read: if sameOrg(orgId);
  allow write: if sameOrg(orgId) && hasRole(orgId, ['manager']);
}
```

**SDK can**: Detect pattern deviation **SDK cannot**: Understand your data model

---

## TROUBLESHOOTING GUIDE

### Fix Workflow

```bash
# Step 1: Run checks to see what's broken
pnpm typecheck
pnpm lint:check
pnpm format:check
pnpm validate:patterns

# Step 2: Fix in correct order
pnpm format                    # Format first
pnpm lint --fix                # Then lint
pnpm typecheck                 # Verify types

# Step 3: If types broke, manual fix needed
# Look at the error, fix the actual issue
# Step 4: Verify patterns
pnpm validate:patterns

# Step 5: Run tests
pnpm test:unit
```

### When Fix Doesn't Work

1. **Read the error** - What exactly failed?
2. **Check the order** - Did you run format before lint?
3. **Check versions** - Are dependencies in sync?
4. **Check config** - Are tools configured correctly?
5. **Manual fix** - Some things need human judgment

### Debug Commands

```bash
# See what ESLint would change
pnpm lint --fix-dry-run

# See TypeScript errors with context
pnpm typecheck | head -50

# See Prettier changes
pnpm format --check --list-different

# See Zod version conflicts
pnpm why zod
pnpm list zod --depth=2

# See all pattern violations with details
node scripts/validate-patterns.mjs --verbose
```

---

## SDK ARCHITECTURE

### How Pattern Validation Works

```
1. Load pattern definitions
   ↓
1. Glob for matching files
   ↓
1. For each file:
   - Read content
   - Apply pattern regex/AST check
   - Record violations
   ↓
1. Calculate compliance score
   ↓
1. Output report
```

### Why It Can't Fix Everything

Pattern validation is **detection**, not **transformation**.

To auto-fix, the SDK would need to:

1. Parse the code AST
2. Understand the semantic meaning
3. Generate correct replacement
4. Preserve all existing behavior
5. Handle edge cases

This is what humans (and AI agents) do. The SDK gives you the **information** to make decisions.

---

## VS CODE INTEGRATION

### Copilot Instructions Location

```
.github/copilot-instructions.md
```

This file tells VS Code Copilot about your project. All governance docs should be summarized here.

### Example copilot-instructions.md

```markdown
# Fresh Schedules - Copilot Instructions

## Project Overview

Multi-tenant SaaS scheduling platform using Next.js, TypeScript, Firebase.

## Key Patterns

- API routes use `createOrgEndpoint()` from `@fresh-schedules/api-framework`
- All types use Zod schemas in `packages/types/`
- Firestore rules enforce org isolation

## Agent Invocations

- `@architect design {feature}` - Design new features
- `@refactor fix {file}` - Fix pattern violations
- `@guard review` - Review current changes
- `@auditor report` - Generate compliance report

## Common Commands

- `pnpm typecheck` - Check types
- `pnpm lint` - Run linter
- `pnpm test:unit` - Run unit tests
- `pnpm orchestrate --auto` - Run appropriate pipeline

## Governance Docs

See `.github/governance/` for full documentation.
```

### Agent Mode Setup

For VS Code to run agents in parallel:

```jsonc
// .vscode/settings.json
{
  "github.copilot.chat.agentMode.enabled": true,
}
```

---

## MAINTAINING THESE DOCS

### When to Update

| Event                | Update                          |
| -------------------- | ------------------------------- |
| New pattern added    | 01_DEFINITIONS, 11_GATES        |
| New agent added      | 06_AGENTS, copilot-instructions |
| Pipeline change      | 08_PIPELINES, 09_CI_CD          |
| Branch rule change   | 10_BRANCH_RULES                 |
| SDK limitation found | 12_DOCUMENTATION                |

### Document Hierarchy

```
01_DEFINITIONS.md     ← Everything references this
       ↓
02_PROTOCOLS.md       ← How things work
03_DIRECTIVES.md      ← What's required
04_INSTRUCTIONS.md    ← How to do things
05_BEHAVIORS.md       ← Expected behaviors
       ↓
06_AGENTS.md          ← Who does what
07_PROMPTS.md         ← How to ask
       ↓
08_PIPELINES.md       ← Validation flows
09_CI_CD.md           ← Automation
10_BRANCH_RULES.md    ← Git workflow
11_GATES.md           ← Check configs
       ↓
12_DOCUMENTATION.md   ← Troubleshooting (this file)
```

---

## QUICK REFERENCE

### Fix Order

```
format → lint --fix → typecheck → validate:patterns
```

### Gate Order

```
STATIC → CORRECTNESS → SAFETY → PERF → AI
```

### Agent Order (for complex tasks)

```
Architect (design) → Refactor (implement) → Guard (review) → Auditor (verify)
```

### When Stuck

1. Read the error message carefully
2. Check this documentation
3. Search past conversations
4. Ask an agent: `@architect help with {issue}`
5. Manual investigation and fix

---

**END OF DOCUMENTATION**

---

## FILE INDEX

| File                | Purpose                     |
| ------------------- | --------------------------- |
| 01_DEFINITIONS.md   | All terms, values, entities |
| 02_PROTOCOLS.md     | How things work             |
| 03_DIRECTIVES.md    | What's required             |
| 04_INSTRUCTIONS.md  | How to do things            |
| 05_BEHAVIORS.md     | Expected behaviors          |
| 06_AGENTS.md        | Agent specifications        |
| 07_PROMPTS.md       | Prompt templates            |
| 08_PIPELINES.md     | Pipeline configurations     |
| 09_CI_CD.md         | GitHub Actions workflows    |
| 10_BRANCH_RULES.md  | Git branch rules            |
| 11_GATES.md         | Gate configurations         |
| 12_DOCUMENTATION.md | This file                   |

**Total**: 12 documents covering complete governance system
