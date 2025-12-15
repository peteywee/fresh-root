# Fresh Schedules - Copilot Instructions

> **This file is the entry point for VS Code Copilot and AI agents.**  
> **All governance documentation is in `.github/governance/`**

---

## Project Identity

**Fresh Schedules** is a multi-tenant SaaS scheduling platform for restaurants and small businesses.

- **Stack**: Next.js 14, TypeScript, Firebase (Auth + Firestore), Vercel
- **Monorepo**: pnpm workspaces
- **Packages**: `@fresh-schedules/types`, `@fresh-schedules/api-framework`

---

## Core Values (In Order)

1. **Security First** - Tenant isolation is non-negotiable
2. **Type Safety** - All data through Zod schemas
3. **Minimal Blast Radius** - Small, focused changes
4. **Evidence Over Intuition** - Data-backed decisions
5. **Reversibility** - Prefer undoable changes

---

## Agent System

### Available Agents

| Agent | Trigger | Purpose |
|-------|---------|---------|
| **Orchestrator** | Automatic | Routes tasks to correct agent |
| **Architect** | `@architect` | Design schemas, APIs, structure |
| **Refactor** | `@refactor` | Fix code, apply patterns |
| **Guard** | `@guard` | Review PRs, gate merges |
| **Auditor** | `@auditor` | Generate compliance reports |

### Invocation Examples

```
@architect design TimeOff
@refactor fix apps/web/app/api/schedules/route.ts
@guard review PR#42
@auditor report
```

### Natural Language (Orchestrator Routes Automatically)

```
Design a new leave request feature
Fix the pattern violations in the schedules API
Is this PR ready to merge?
Generate a compliance report
```

### Parallel Execution

VS Code Agent Mode can run multiple agents simultaneously. The orchestrator handles:
- Parsing multi-agent tasks
- Launching agents in parallel
- Synthesizing results

---

## Key Patterns

### API Routes (API_001)

```typescript
// ✅ CORRECT
export const GET = createOrgEndpoint({
  roles: ['scheduler', 'manager', 'admin'],
  handler: async ({ context }) => {
    const data = await getSchedules(context.orgId);
    return { success: true, data };
  }
});

// ❌ WRONG
export async function GET(req: Request) {
  const data = await db.collection('schedules').get();
  return Response.json(data);
}
```

### Schemas (TS_002)

```typescript
// ✅ CORRECT
export const ScheduleSchema = z.object({...});
export type Schedule = z.infer<typeof ScheduleSchema>;

// ❌ WRONG - Duplicate definition
export interface Schedule {...}
export const ScheduleSchema = z.object({...});
```

### Firestore Rules (SEC_002)

```javascript
// ✅ CORRECT
match /organizations/{orgId}/schedules/{scheduleId} {
  allow read: if sameOrg(orgId);
  allow write: if sameOrg(orgId) && hasRole(orgId, ['manager']);
}

// ❌ WRONG - No org isolation
match /schedules/{scheduleId} {
  allow read, write: if request.auth != null;
}
```

---

## Quick Commands

```bash
# Validation
pnpm typecheck          # TypeScript
pnpm lint:check         # ESLint
pnpm format:check       # Prettier
pnpm validate:patterns  # Pattern compliance

# Fix (in this order!)
pnpm format             # Format first
pnpm lint --fix         # Then lint
pnpm typecheck          # Verify types

# Testing
pnpm test:unit          # Unit tests
pnpm test:rules         # Firestore rules
pnpm test:e2e           # End-to-end

# Pipeline
pnpm orchestrate --auto # Auto-detect pipeline
pnpm orchestrate Feature.STANDARD  # Explicit
```

---

## Branch Workflow

```
main (production)
└── dev (pre-production)
  ├── feature/* → dev (squash)
  ├── fix/* → dev (squash)
  └── refactor/* → dev (squash)

hotfix/* → main + dev (merge commit)
```

**Naming**: `{type}/{ticket}-{description}`
- `feature/FS-123-add-time-off`
- `fix/FS-456-schedule-calc`

---

## Pipeline Selection

| Scenario | Pipeline |
|----------|----------|
| 1 file, no domain logic | Feature.FAST |
| 2-5 files, single domain | Feature.STANDARD |
| >5 files or security | Feature.HEAVY |
| Schema changes | Schema.STANDARD |
| Security files | Security.HEAVY |

---

## Gate Order

```
STATIC → CORRECTNESS → SAFETY → PERF → AI
```

- **STATIC**: typecheck, lint, format (blocking)
- **CORRECTNESS**: unit, rules, e2e tests (blocking)
- **SAFETY**: patterns, secrets, audit (blocking)
- **PERF**: bundle analysis (conditional)
- **AI**: advisory only (never blocks)

---

## When Fix Breaks Things

The fix commands can fail because:

1. **Wrong order** → Always: `format` then `lint --fix` then `typecheck`
2. **Tool conflicts** → Use `eslint-config-prettier`
3. **Version mismatch** → Run `pnpm dedupe`
4. **Manual needed** → Some patterns require human judgment

See `12_DOCUMENTATION.md` for detailed troubleshooting.

---

## Governance Documentation

All docs in `.github/governance/`:

| Doc | Content |
|-----|---------|
| 01_DEFINITIONS | Terms, values, entities |
| 02_PROTOCOLS | How things work |
| 03_DIRECTIVES | What's required |
| 04_INSTRUCTIONS | How to do tasks |
| 05_BEHAVIORS | Expected behaviors |
| 06_AGENTS | Agent contracts |
| 07_PROMPTS | Prompt templates |
| 08_PIPELINES | Pipeline configs |
| 09_CI_CD | GitHub Actions |
| 10_BRANCH_RULES | Git workflow |
| 11_GATES | Gate configs |
| 12_DOCUMENTATION | Troubleshooting |

---

## File Locations

| Type | Location |
|------|----------|
| Schemas | `packages/types/src/schemas/` |
| API Routes | `apps/web/app/api/` |
| Components | `apps/web/components/` |
| Hooks | `apps/web/hooks/` |
| Rules | `firestore.rules` |
| Rules Tests | `tests/rules/` |
| Governance | `.github/governance/` |

---

## Emergency Contacts

- **Production Down**: Create `hotfix/*` branch, get 1 approval, merge to main
- **Security Breach**: Immediately notify team lead, rotate credentials
- **Data Issue**: Do NOT delete, isolate and investigate

---

**Questions?** Ask an agent: `@architect help with {topic}`
