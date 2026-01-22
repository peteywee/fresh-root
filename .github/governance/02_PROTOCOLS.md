# FRESH SCHEDULES - PROTOCOLS

> **Version**: 1.0.0\
> **Status**: CANONICAL\
> **Authority**: Sr Dev / Architecture\
> **Binding**: YES - All protocols are enforceable

This document defines the operational protocols for Fresh Schedules development.

---

## PROTOCOL 01: CLASSIFICATION

**Purpose**: Determine change complexity before work begins.

### Classification Decision Tree

```
START
  │
  ├─ Does change touch auth, security, or firestore.rules?
  │    └─ YES → CRITICAL
  │
  ├─ Does change modify schema in packages/types/?
  │    └─ YES → NON-TRIVIAL (minimum)
  │
  ├─ Does change affect >1 file?
  │    └─ YES → NON-TRIVIAL
  │
  ├─ Does change touch domain logic?
  │    │  (Schedule, Shift, Staff, Venue, Member, Org)
  │    └─ YES → NON-TRIVIAL
  │
  ├─ Does change involve data persistence?
  │    └─ YES → NON-TRIVIAL
  │
  └─ All NO → TRIVIAL
```

### Classification Matrix

| Dimension    | TRIVIAL          | NON-TRIVIAL       | CRITICAL                  |
| ------------ | ---------------- | ----------------- | ------------------------- |
| **Files**    | 1                | 2-10              | >10 or security files     |
| **Scope**    | Single component | Cross-module      | System-wide               |
| **Domain**   | UI/copy only     | Business logic    | Auth/billing/data         |
| **Data**     | None             | Read-only queries | Mutations/migrations      |
| **Tests**    | Existing pass    | New tests needed  | Security tests required   |
| **Rollback** | Trivial          | Planned           | Migration script required |

### Output Format

After classification, document:

```markdown
**Classification**: [TRIVIAL | NON-TRIVIAL | CRITICAL] **Rationale**: [Why this classification]
**Pipeline**: [Selected pipeline] **Risk Flags**: [Any concerns]
```

---

## PROTOCOL 02: PIPELINE SELECTION

**Purpose**: Map classification to appropriate validation pipeline.

### Pipeline Families

| Family       | When to Use                            | Minimum Gates               |
| ------------ | -------------------------------------- | --------------------------- |
| **Feature**  | New functionality                      | STATIC                      |
| **Bug**      | Fixing broken behavior                 | STATIC, CORRECTNESS         |
| **Schema**   | Type/schema changes                    | STATIC, CORRECTNESS, SAFETY |
| **Refactor** | Code improvements (no behavior change) | STATIC, CORRECTNESS         |
| **Security** | Auth, rules, secrets                   | ALL GATES                   |

### Variant Selection

| Variant      | Criteria                             | Gates Included       |
| ------------ | ------------------------------------ | -------------------- |
| **FAST**     | 1 file, no domain logic              | STATIC only          |
| **STANDARD** | 2-5 files OR single domain           | STATIC, CORRECTNESS  |
| **HEAVY**    | >5 files OR multi-domain OR security | All applicable gates |

### Selection Matrix

| Scenario                     | Pipeline          |
| ---------------------------- | ----------------- |
| Fix typo in component        | Feature.FAST      |
| Add new button               | Feature.FAST      |
| New API endpoint             | Feature.STANDARD  |
| Bug in schedule calculation  | Bug.STANDARD      |
| Fix auth bypass              | Security.HEAVY    |
| Add new schema field         | Schema.STANDARD   |
| Rename function across files | Refactor.STANDARD |
| Multi-entity feature         | Feature.HEAVY     |
| Firestore rules change       | Security.HEAVY    |

---

## PROTOCOL 03: GATE EXECUTION

**Purpose**: Define how gates run and what blocks/passes.

### Gate Order (Mandatory)

```
1. STATIC     → [blocking] Must pass before any other gate
2. CORRECTNESS → [blocking] Tests must pass
3. SAFETY     → [blocking] Patterns and security
4. PERF       → [conditional] Only for HEAVY pipelines
5. AI         → [advisory] Never blocks, only advises
```

### Gate Specifications

#### STATIC Gate

| Check      | Command             | Fail Behavior        |
| ---------- | ------------------- | -------------------- |
| TypeScript | `pnpm typecheck`    | BLOCK                |
| Lint       | `pnpm lint:check`   | BLOCK                |
| Format     | `pnpm format:check` | BLOCK (auto-fixable) |

**Auto-Fix Available**: `pnpm lint --fix && pnpm format`

#### CORRECTNESS Gate

| Check       | Command           | Fail Behavior      |
| ----------- | ----------------- | ------------------ |
| Unit Tests  | `pnpm test:unit`  | BLOCK              |
| Rules Tests | `pnpm test:rules` | BLOCK              |
| E2E Tests   | `pnpm test:e2e`   | BLOCK (HEAVY only) |

#### SAFETY Gate

| Check              | Command                  | Fail Behavior          |
| ------------------ | ------------------------ | ---------------------- |
| Pattern Validation | `pnpm validate:patterns` | BLOCK if <90 score     |
| Secret Scan        | `git secrets --scan`     | BLOCK                  |
| Dependency Audit   | `pnpm audit`             | BLOCK on high/critical |

#### PERF Gate

| Check       | Command              | Fail Behavior         |
| ----------- | -------------------- | --------------------- |
| Bundle Size | `pnpm build:analyze` | Warn if >10% increase |
| Lighthouse  | CI only              | Warn if <80 score     |

#### AI Gate

| Check               | Purpose                       | Fail Behavior |
| ------------------- | ----------------------------- | ------------- |
| Context Validator   | Verify agent context complete | Advisory      |
| Hallucination Check | Flag uncertain claims         | Advisory      |

### Gate Result Format

```typescript
interface GateResult {
  gate: "STATIC" | "CORRECTNESS" | "SAFETY" | "PERF" | "AI";
  status: "PASSED" | "FAILED" | "SKIPPED" | "ADVISORY";
  duration: number; // ms
  errors: string[];
  warnings: string[];
  autoFixable: boolean;
}
```

---

## PROTOCOL 04: MERGE CONTROL

**Purpose**: Define when and how code merges.

### Merge Requirements by Branch

| Target | From                       | Requirements                              |
| ------ | -------------------------- | ----------------------------------------- |
| `main` | `dev` only                 | All gates pass, 2 approvals, no conflicts |
| `dev`  | `feature/*`, `fix/*`, etc. | STATIC + CORRECTNESS pass, 1 approval     |
| `dev`  | `hotfix/*`                 | All gates pass, 1 approval                |

### Merge Strategies

| Scenario       | Strategy     | Rationale             |
| -------------- | ------------ | --------------------- |
| Feature → dev  | Squash       | Clean history         |
| Fix → dev      | Squash       | Clean history         |
| Refactor → dev | Squash       | Clean history         |
| Dev → main     | Merge commit | Preserve PR reference |
| Hotfix → main  | Merge commit | Audit trail           |

### Conflict Resolution

1. Rebase feature branch on target
2. Resolve conflicts locally
3. Re-run gates
4. Request re-review if substantial changes

---

## PROTOCOL 05: EMERGENCY PROCEDURES

**Purpose**: Handle production incidents.

### Severity Levels

| Level  | Definition                                  | Response Time |
| ------ | ------------------------------------------- | ------------- |
| **P0** | Production down, data loss, security breach | Immediate     |
| **P1** | Major feature broken, revenue impact        | <1 hour       |
| **P2** | Minor feature broken, workaround exists     | <4 hours      |
| **P3** | Cosmetic issue, no functional impact        | Next sprint   |

### Hotfix Protocol

1. Create `hotfix/[ticket]-[description]` from `main`
2. Implement minimal fix
3. Run Security.HEAVY pipeline
4. Get 1 approval (2 for security issues)
5. Merge to `main` AND `dev`
6. Tag release: `v[major].[minor].[patch+1]`
7. Post-mortem within 48 hours

### Rollback Protocol

1. Identify failing commit
2. `git revert [commit]` on `main`
3. Run STATIC gate
4. Emergency merge (skip normal approval if P0)
5. Verify production stable
6. Root cause analysis

---

## PROTOCOL 06: AGENT INVOCATION

**Purpose**: Define how agents are activated and routed.

### Invocation Patterns

| Pattern                      | Agent Routed             | Example                              |
| ---------------------------- | ------------------------ | ------------------------------------ |
| `@architect {verb} {target}` | Architect                | `@architect design TimeOff`          |
| `@refactor {verb} {file}`    | Refactor                 | `@refactor fix schedule.ts`          |
| `@guard {verb} PR#{n}`       | Guard                    | `@guard review PR#42`                |
| `@auditor {verb}`            | Auditor                  | `@auditor report`                    |
| Natural language design      | Orchestrator → Architect | "Design a new leave request feature" |
| Natural language review      | Orchestrator → Guard     | "Is this PR ready?"                  |

### Orchestrator Routing Rules

```
IF message contains explicit @agent trigger
  → Route directly to that agent

ELSE IF message is design/architecture question
  → Route to Architect

ELSE IF message is about fixing/refactoring code
  → Route to Refactor

ELSE IF message is about PR/merge/approval
  → Route to Guard

ELSE IF message requests report/audit/metrics
  → Route to Auditor

ELSE IF message requires multiple perspectives
  → Run Composite mode (parallel agents)
  → Synthesize results

ELSE
  → Handle directly without agent
```

### Parallel Execution Protocol

When orchestrator detects multi-agent task:

1. Parse task into sub-tasks
2. Assign each sub-task to appropriate agent
3. Launch agents in parallel (VS Code Agent Mode)
4. Collect results as they complete
5. Synthesize into unified response
6. Present with attribution

---

## PROTOCOL 07: ERROR HANDLING

**Purpose**: Standardize error responses and recovery.

### Error Categories

| Category   | HTTP Code | User Message              | Log Level |
| ---------- | --------- | ------------------------- | --------- |
| Validation | 400       | Specific field errors     | INFO      |
| Auth       | 401       | "Authentication required" | WARN      |
| Forbidden  | 403       | "Permission denied"       | WARN      |
| Not Found  | 404       | "Resource not found"      | INFO      |
| Conflict   | 409       | Specific conflict reason  | INFO      |
| Server     | 500       | "Something went wrong"    | ERROR     |

### Response Format

```typescript
// Success
{
  success: true,
  data: T
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: Record<string, string[]>
  }
}
```

### Recovery Procedures

| Error Type         | Recovery Action                             |
| ------------------ | ------------------------------------------- |
| Validation failure | Return field-level errors, let user correct |
| Auth expired       | Trigger re-auth flow                        |
| Rate limited       | Return `Retry-After` header                 |
| Server error       | Log full context, return generic message    |

---

## PROTOCOL 08: DOCUMENTATION

**Purpose**: Keep docs current and discoverable.

### Documentation Requirements

| Change Type      | Required Docs                         |
| ---------------- | ------------------------------------- |
| New API endpoint | OpenAPI spec, README example          |
| New schema       | Schema catalog entry, migration notes |
| New component    | Storybook story, props documentation  |
| Config change    | Update relevant config docs           |
| Breaking change  | Migration guide, changelog entry      |

### Location Standards

| Doc Type       | Location             |
| -------------- | -------------------- |
| API Reference  | `docs/api/`          |
| Schema Catalog | `docs/schemas/`      |
| Architecture   | `docs/architecture/` |
| Governance     | `.github/`           |
| Component Docs | Storybook / inline   |

---

**END OF PROTOCOLS**

Next document: [03_DIRECTIVES.md](./03_DIRECTIVES.md)
