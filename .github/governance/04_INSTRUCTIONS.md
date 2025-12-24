# FRESH SCHEDULES - INSTRUCTIONS

> **Version**: 1.0.0  
> **Status**: REFERENCE  
> **Authority**: Sr Dev / Architecture  
> **Binding**: NO - These are guides, not mandates

This document provides step-by-step instructions for common tasks.

---

## INSTRUCTION 01: Creating a New API Endpoint

### Prerequisites

- Feature branch created
- Schema exists in `packages/types/`

### Steps

**Step 1**: Create route file

```bash
mkdir -p apps/web/app/api/[resource]
touch apps/web/app/api/[resource]/route.ts
```

**Step 2**: Import dependencies

```typescript
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { ResourceSchema, CreateResourceSchema } from "@fresh-schedules/types";
import { z } from "zod";
```

**Step 3**: Implement GET handler

```typescript
export const GET = createOrgEndpoint({
  roles: ["scheduler", "manager", "admin"],
  handler: async ({ context, request }) => {
    const { orgId } = context;
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);

    const items = await listResources(orgId, query);
    return { success: true, data: items };
  },
});
```

**Step 4**: Implement POST handler

```typescript
export const POST = createOrgEndpoint({
  roles: ["manager", "admin"],
  handler: async ({ context, request }) => {
    const body = await request.json();
    const validated = CreateResourceSchema.parse(body);

    const created = await createResource(context.orgId, validated);
    return { success: true, data: created };
  },
});
```

**Step 5**: Run gates

```bash
pnpm typecheck
pnpm lint
pnpm test:unit
```

---

## INSTRUCTION 02: Adding a New Schema

### Prerequisites

- Clear requirements for entity shape
- Understanding of validation rules

### Steps

**Step 1**: Create schema file

```bash
touch packages/types/src/schemas/[entity].ts
```

**Step 2**: Define the schema

```typescript
import { z } from "zod";

// Main entity schema
export const EntitySchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create input (no id, no timestamps)
export const CreateEntitySchema = EntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update input (all optional except id)
export const UpdateEntitySchema = EntitySchema.partial().required({ id: true });

// Inferred types
export type Entity = z.infer<typeof EntitySchema>;
export type CreateEntity = z.infer<typeof CreateEntitySchema>;
export type UpdateEntity = z.infer<typeof UpdateEntitySchema>;
```

**Step 3**: Export from index

```typescript
// packages/types/src/index.ts
export * from "./schemas/entity";
```

**Step 4**: Run gates

```bash
pnpm typecheck
pnpm lint
```

---

## INSTRUCTION 03: Adding Firestore Rules

### Prerequisites

- Schema defined
- Access requirements clear

### Steps

**Step 1**: Add helper functions (if needed)

```javascript
// firestore.rules
function sameOrg(orgId) {
  return request.auth != null &&
         get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.status == 'active';
}

function hasRole(orgId, roles) {
  let memberData = get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data;
  return memberData.status == 'active' && memberData.role in roles;
}
```

**Step 2**: Add collection rules

```javascript
match /organizations/{orgId}/entities/{entityId} {
  // Read: any active org member
  allow read: if sameOrg(orgId);

  // Create: managers and above
  allow create: if hasRole(orgId, ['manager', 'admin', 'org_owner']);

  // Update: managers and above
  allow update: if hasRole(orgId, ['manager', 'admin', 'org_owner']);

  // Delete: admins only
  allow delete: if hasRole(orgId, ['admin', 'org_owner']);
}
```

**Step 3**: Write tests

```typescript
// tests/rules/entities.rules.spec.ts
import { assertSucceeds, assertFails } from "@firebase/rules-unit-testing";

describe("Entities Rules", () => {
  it("allows org member to read", async () => {
    const db = getFirestoreForUser({ uid: "member1", orgId: "org1" });
    await assertSucceeds(db.doc("organizations/org1/entities/e1").get());
  });

  it("denies cross-org read", async () => {
    const db = getFirestoreForUser({ uid: "member1", orgId: "org1" });
    await assertFails(db.doc("organizations/org2/entities/e1").get());
  });
});
```

**Step 4**: Run rules tests

```bash
pnpm test:rules
```

---

## INSTRUCTION 04: Fixing a Pattern Violation

### Prerequisites

- Pattern validation report showing violation
- Understanding of correct pattern

### Steps

**Step 1**: Identify violation

```bash
pnpm validate:patterns
# Output: API_001 VIOLATION in apps/web/app/api/foo/route.ts:15
```

**Step 2**: Read pattern definition Look up `API_001` in `01_DEFINITIONS.md` to understand
requirement.

**Step 3**: Fix the code

```typescript
// BEFORE (violating)
export async function GET(req: Request) {
  const data = await db.collection("stuff").get();
  return Response.json(data);
}

// AFTER (compliant)
export const GET = createOrgEndpoint({
  roles: ["scheduler"],
  handler: async ({ context }) => {
    const data = await getStuff(context.orgId);
    return { success: true, data };
  },
});
```

**Step 4**: Verify fix

```bash
pnpm validate:patterns
# Should pass now
```

---

## INSTRUCTION 05: Running Local Development

### Initial Setup

```bash
# Clone repo
git clone git@github.com:peteywee/frsh-root.git
cd frsh-root

# Install dependencies
pnpm install

# Set up environment
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your Firebase credentials

# Start Firebase emulators
pnpm emulators

# In another terminal, start dev server
pnpm dev
```

### Daily Workflow

```bash
# Update dependencies
git pull origin dev
pnpm install

# Create feature branch
git checkout -b feature/FS-123-my-feature dev

# Start dev
pnpm dev

# Run checks before commit
pnpm typecheck && pnpm lint && pnpm test:unit

# Commit
git add -A
git commit -m "feat(scope): description"

# Push and open PR
git push -u origin feature/FS-123-my-feature
```

---

## INSTRUCTION 06: Deploying to Production

### Prerequisites

- All gates pass on `dev`
- Required approvals obtained
- Changelog updated

### Steps

**Step 1**: Merge dev to main

```bash
git checkout main
git pull origin main
git merge dev --no-ff -m "Release: v1.2.3"
git push origin main
```

**Step 2**: Create release tag

```bash
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
```

**Step 3**: Verify deployment

- Check Vercel deployment status
- Run smoke tests against production
- Monitor error tracking for new issues

---

## INSTRUCTION 07: Creating a Hotfix

### Prerequisites

- P0/P1 issue identified
- Root cause understood

### Steps

**Step 1**: Create hotfix branch from main

```bash
git checkout main
git pull origin main
git checkout -b hotfix/FS-999-critical-bug
```

**Step 2**: Implement minimal fix Focus only on the immediate problem. No refactoring.

**Step 3**: Run Security.HEAVY pipeline

```bash
pnpm orchestrate Security.HEAVY
```

**Step 4**: Get emergency approval

- Contact team lead
- Document impact and fix

**Step 5**: Merge to main AND dev

```bash
git checkout main
git merge hotfix/FS-999-critical-bug --no-ff
git push origin main

git checkout dev
git merge hotfix/FS-999-critical-bug --no-ff
git push origin dev
```

**Step 6**: Tag release

```bash
git checkout main
git tag -a v1.2.4 -m "Hotfix: Critical bug fix"
git push origin v1.2.4
```

**Step 7**: Post-mortem Document within 48 hours:

- What happened
- Root cause
- How it was fixed
- How to prevent recurrence

---

## INSTRUCTION 08: Using the Orchestrator

### Auto-Detection Mode

```bash
# Detect pipeline from changed files
pnpm orchestrate --auto

# Dry run to see what would execute
pnpm orchestrate --auto --dry-run
```

### Explicit Pipeline Mode

```bash
# Run specific pipeline
pnpm orchestrate Feature.STANDARD

# Run with verbose output
pnpm orchestrate Feature.STANDARD --verbose

# Run with auto-fix for fixable issues
pnpm orchestrate Feature.STANDARD --fix
```

### CI Mode

```bash
# Write results to file for CI consumption
pnpm orchestrate --auto --ci
```

---

## INSTRUCTION 09: Invoking Agents

### Direct Invocation

```
@architect design TimeOff
@refactor fix apps/web/app/api/schedules/route.ts
@guard review PR#42
@auditor report
```

### Natural Language

```
Design a new leave request feature for employees
Fix the pattern violations in the schedules API
Is PR 42 ready to merge?
Generate a compliance report for the last sprint
```

### Composite Tasks

```
Design and review a new shift swap feature
# Orchestrator will run Architect, then Guard
```

---

## INSTRUCTION 10: Debugging Gate Failures

### STATIC Gate Failures

**TypeScript errors**:

```bash
pnpm typecheck
# Read error output, fix type issues
```

**Lint errors**:

```bash
pnpm lint
# Auto-fix if possible
pnpm lint --fix
```

**Format errors**:

```bash
pnpm format:check
# Auto-fix
pnpm format
```

### CORRECTNESS Gate Failures

**Unit test failures**:

```bash
pnpm test:unit
# Run specific test for debugging
pnpm test:unit -- --grep "failing test name"
```

**Rules test failures**:

```bash
pnpm test:rules
# Check firestore.rules against test expectations
```

### SAFETY Gate Failures

**Pattern violations**:

```bash
pnpm validate:patterns
# Check violation details, fix code
```

**Secret detection**:

```bash
git secrets --scan
# Remove any detected secrets
# Rotate compromised credentials
```

---

**END OF INSTRUCTIONS**

Next document: [05_BEHAVIORS.md](./05_BEHAVIORS.md)
