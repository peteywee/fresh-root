# Fresh Schedules Quick Reference Card

> Print this. Keep it nearby. Reference daily.

---

## Task Classification

| If ANY of these → | Classification |
|-------------------|----------------|
| >1 file | **NON-TRIVIAL** |
| Domain logic (Org, Venue, Schedule, Shift, Staff) | **NON-TRIVIAL** |
| Auth/security paths | **NON-TRIVIAL** |
| Schema/query changes | **NON-TRIVIAL** |
| Data migration | **NON-TRIVIAL** |
| Uncertain? | **NON-TRIVIAL** |

| If ALL of these → | Classification |
|-------------------|----------------|
| ≤1 file | TRIVIAL |
| UI/copy only | TRIVIAL |
| Cosmetic risk only | TRIVIAL |
| Existing test coverage | TRIVIAL |

---

## Pipeline Selection

| Scenario | Pipeline |
|----------|----------|
| New feature, single file | `Feature.FAST` |
| New feature, multiple files | `Feature.STANDARD` |
| New feature, security relevant | `Feature.HEAVY` |
| Bug fix, obvious | `Bug.FAST` |
| Bug fix, domain logic | `Bug.STANDARD` |
| Schema change | `Schema.STANDARD` |
| Refactor, isolated | `Refactor.FAST` |
| Refactor, cross-module | `Refactor.HEAVY` |
| Security fix | `Security.STANDARD` |

---

## Gate Classes

| Gate | Commands | Blocking |
|------|----------|----------|
| **STATIC** | `pnpm lint:check && pnpm format:check && pnpm typecheck` | ✅ YES |
| **CORRECTNESS** | `pnpm test:unit && pnpm test:e2e && pnpm test:rules` | ✅ YES |
| **SAFETY** | `pnpm validate:patterns && pnpm validate:secrets` | ✅ YES |
| **PERF** | `pnpm analyze:bundle` | ⚠️ Conditional |
| **AI** | `pnpm validate:ai-context` | ℹ️ Advisory |

---

## Agent Invocations

```
@architect design {feature}      # Design new feature
@refactor fix {file}             # Fix pattern violation
@guard review PR#{number}        # Review PR for merge
@auditor report                  # Generate compliance report
```

### Agent Decision Outputs

| Agent | Outputs |
|-------|---------|
| **Architect** | Schema + API skeleton + Rules + Diagram |
| **Refactor** | Unified diff + Before/after |
| **Guard** | PASS / BLOCK / NEEDS_CHANGES + Violations |
| **Auditor** | Full report + Score + Recommendations |

---

## Pattern IDs

| ID | Layer | Description | Severity |
|----|-------|-------------|----------|
| `API_001` | API | createOrgEndpoint required | ERROR |
| `API_002` | API | Zod validation required | ERROR |
| `API_003` | API | Standardized error responses | ERROR |
| `UI_001` | UI | "use client" for hooks | ERROR |
| `UI_002` | UI | Typed props interface | WARNING |
| `SEC_001` | Rules | sameOrg() check required | ERROR |
| `SEC_002` | Rules | list: false by default | ERROR |
| `SEC_003` | Rules | RBAC on writes | ERROR |

---

## API Route Template

```typescript
// apps/web/app/api/{domain}/route.ts
import { createOrgEndpoint } from '@fresh-schedules/api-framework';
import { z } from 'zod';
import { {Domain}Schema } from '@fresh-schedules/types';

const RequestSchema = z.object({
  // ... request validation
});

export const POST = createOrgEndpoint({
  schema: RequestSchema,
  roles: ['admin', 'manager'],
  handler: async ({ data, org, user }) => {
    // Implementation
    return { success: true, data: result };
  },
});
```

---

## Firestore Rule Template

```javascript
match /{domain}/{orgId}/{subcollection}/{docId} {
  allow read: if isAuthenticated() && sameOrg(orgId);
  allow create: if isAuthenticated() && sameOrg(orgId) && hasAnyRole(['admin', 'manager']);
  allow update: if isAuthenticated() && sameOrg(orgId) && hasAnyRole(['admin', 'manager']);
  allow delete: if isAuthenticated() && sameOrg(orgId) && hasAnyRole(['admin']);
  allow list: if false; // Explicit deny
}
```

---

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm lint:fix              # Fix lint errors
pnpm format:fix            # Fix formatting
pnpm typecheck             # Type check

# Testing
pnpm test:unit             # Unit tests
pnpm test:e2e              # E2E tests
pnpm test:rules            # Firestore rules tests

# Validation
pnpm validate:patterns     # Pattern compliance
pnpm validate:secrets      # Secret leak check

# Orchestrator
pnpm orchestrate Feature.STANDARD         # Run pipeline
pnpm orchestrate --auto --fix             # Auto-detect, fix mode
pnpm orchestrate Security.HEAVY --verbose # Full security audit
```

---

## Branch Naming

```
feature/FS-{ticket}-{description}
fix/FS-{ticket}-{description}
refactor/{scope}-{description}
chore/{scope}-{description}
hotfix/URGENT-{description}
```

---

## CPMEM Template

```
[CPMEM]
task_id: {id}
timestamp: {ISO_8601}
classification: {TRIVIAL|NON-TRIVIAL}
pipeline: {Family.Variant}
scope_summary:
  - domains: [...]
  - key_files: [...]
success_criteria:
  - [x] criterion 1
  - [!] criterion 2 (partial: reason)
gates_status:
  - STATIC: "passed"
  - CORRECTNESS: "user-must-run"
residual_risk:
  - {description}
next_steps:
  - {item}
[/CPMEM]
```

---

## Emergency Contacts

| Situation | Action |
|-----------|--------|
| Production down | `hotfix/*` branch → direct to `main` |
| Security breach | Alert team → `Security.HEAVY` pipeline |
| Data corruption | Freeze writes → investigate → rollback |

---

*Fresh Schedules Protocol v2.0 | December 2025*
