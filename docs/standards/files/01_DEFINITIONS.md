# FRESH SCHEDULES - DEFINITIONS

> **Version**: 1.0.0  
> **Status**: CANONICAL  
> **Authority**: Sr Dev / Architecture  
> **Last Updated**: 2025-12-12

This document defines all terms, values, entities, and concepts used throughout the Fresh Schedules governance system. All other documents reference these definitions.

---

## 1. CORE VALUES

These values govern all development decisions. When in conflict, apply in order.

| # | Value | Definition | Example |
|---|-------|------------|---------|
| 1 | **Security First** | No code ships that compromises tenant isolation, auth, or data integrity | Block PR that queries without `orgId` filter |
| 2 | **Type Safety** | All data flows through Zod schemas; no `any`, no `unknown` escapes | Reject handler with implicit `any` parameter |
| 3 | **Minimal Blast Radius** | Changes affect smallest possible scope; prefer small PRs | Split 500-line PR into 5 focused PRs |
| 4 | **Evidence Over Intuition** | Decisions backed by data, tests, or documented patterns | "Pattern X is better because benchmark shows 40% faster" |
| 5 | **Reversibility** | Prefer changes that can be undone; flag irreversible actions | Schema migration requires rollback script |

---

## 2. DOMAIN TERMS

### 2.1 Business Entities

| Term | Definition | Firestore Collection |
|------|------------|---------------------|
| **Organization (Org)** | Top-level tenant container. All data scoped to org. | `organizations` |
| **Venue** | Physical location belonging to an org | `organizations/{orgId}/venues` |
| **Schedule** | Time-bounded shift container (e.g., "Week of Dec 15") | `organizations/{orgId}/schedules` |
| **Shift** | Single work period with start/end time and role | `organizations/{orgId}/shifts` |
| **Staff** | Employee/worker record within an org | `organizations/{orgId}/staff` |
| **Member** | User's membership in an org with role | `organizations/{orgId}/members` |
| **Network** | Multi-org grouping (franchise/corporate) | `networks` |

### 2.2 Roles & Permissions

| Role | Scope | Can Do | Cannot Do |
|------|-------|--------|-----------|
| `org_owner` | Full org | Everything | Delete org (requires support) |
| `admin` | Full org | Manage members, settings, billing | Transfer ownership |
| `manager` | Venue(s) | Create/edit schedules, manage staff | Billing, org settings |
| `scheduler` | Venue(s) | Create/edit schedules | Manage staff, settings |
| `staff` | Self | View own shifts, request time off | Edit schedules, manage others |
| `network_admin` | Network | View all orgs, aggregate reports | Modify individual org data |

### 2.3 Status Enums

```typescript
// Schedule statuses
type ScheduleStatus = 'draft' | 'published' | 'active' | 'completed' | 'archived';

// Shift statuses
type ShiftStatus = 'open' | 'assigned' | 'confirmed' | 'completed' | 'cancelled';

// Member statuses
type MemberStatus = 'invited' | 'active' | 'suspended' | 'removed';
```

---

## 3. TECHNICAL TERMS

### 3.1 Architecture Components

| Term | Definition | Location |
|------|------------|----------|
| **API Framework** | Endpoint factories for auth, rate limiting, validation | `packages/api-framework/` |
| **Types Package** | Zod schemas and TypeScript types | `packages/types/` |
| **Firestore Rules** | Security rules enforcing tenant isolation | `firestore.rules` |
| **Web App** | Next.js 14 application | `apps/web/` |

### 3.2 Pattern Identifiers

| Pattern ID | Category | What It Validates |
|------------|----------|-------------------|
| `API_001` | Security | API routes use `createOrgEndpoint` or `createNetworkEndpoint` |
| `API_002` | Validation | All inputs validated with Zod before processing |
| `API_003` | Response | Consistent response format with `success`, `data`, `error` |
| `UI_001` | Components | Use `@/components/ui/*` for primitives |
| `UI_002` | State | Server state via React Query, client via Zustand |
| `SEC_001` | Auth | Firebase Auth for all authenticated routes |
| `SEC_002` | Isolation | Firestore queries include `orgId` in path or filter |
| `SEC_003` | Secrets | No secrets in client code; use server actions |
| `TS_001` | Types | No `any` type; use `unknown` with type guards |
| `TS_002` | Inference | Use `z.infer<typeof Schema>` for Zod types |
| `TS_003` | Generics | Preserve generics through wrapper functions |

### 3.3 File Classifications

| Classification | Pattern | Example |
|----------------|---------|---------|
| **API Route** | `apps/web/app/api/**/*.ts` | `apps/web/app/api/schedules/route.ts` |
| **Schema** | `packages/types/src/schemas/*.ts` | `packages/types/src/schemas/schedule.ts` |
| **Component** | `apps/web/components/**/*.tsx` | `apps/web/components/schedule-card.tsx` |
| **Hook** | `apps/web/hooks/*.ts` | `apps/web/hooks/use-schedule.ts` |
| **Server Action** | `apps/web/app/**/actions.ts` | `apps/web/app/schedules/actions.ts` |
| **Security Rule** | `firestore.rules` | Single file |
| **Test** | `**/*.test.ts`, `**/*.spec.ts` | `tests/rules/schedules.rules.spec.ts` |
| **Config** | `*.config.{js,ts,mjs}` | `next.config.mjs`, `tailwind.config.ts` |

---

## 4. GOVERNANCE TERMS

### 4.1 Document Types

| Type | Purpose | Binding? | Location |
|------|---------|----------|----------|
| **Protocol** | How things work (mechanics) | YES | `.github/protocols/` |
| **Directive** | What's required (rules) | YES | `.github/directives/` |
| **Instruction** | How to do specific tasks | NO | `.github/instructions/` |
| **Contract** | Agent/tool specifications | YES | `.github/contracts/` |
| **Index** | Quick reference, lookups | NO | `.github/indexes/` |

### 4.2 Classification Terms

| Term | Definition | Criteria |
|------|------------|----------|
| **TRIVIAL** | Low-risk, minimal scope change | ≤1 file, no domain logic, no auth, no data persistence |
| **NON-TRIVIAL** | Higher risk, broader scope | >1 file OR domain logic OR auth OR data changes |
| **CRITICAL** | Highest risk, requires review | Security, billing, data migration, schema changes |

### 4.3 Pipeline Terms

| Term | Definition |
|------|------------|
| **Gate** | Validation checkpoint (STATIC, CORRECTNESS, SAFETY, PERF, AI) |
| **Pipeline** | Ordered sequence of gates for a change type |
| **Family** | Category of pipeline (Feature, Bug, Schema, Refactor, Security) |
| **Variant** | Intensity level (FAST, STANDARD, HEAVY) |

---

## 5. AGENT TERMS

### 5.1 Agent Roles

| Agent | Role | Authority |
|-------|------|-----------|
| **Orchestrator** | Route tasks to correct agent, aggregate results | Parse invocations, dispatch, synthesize |
| **Architect** | Design schemas, APIs, structures | Propose changes, define patterns |
| **Refactor** | Fix pattern violations, apply fixes | Modify code within pattern constraints |
| **Guard** | Review PRs, gate merges | PASS/BLOCK/NEEDS_CHANGES verdicts |
| **Auditor** | Generate compliance reports | Full read access, metrics generation |

### 5.2 Invocation Terms

| Term | Definition | Example |
|------|------------|---------|
| **Trigger** | Pattern that activates an agent | `@architect design`, `@guard review` |
| **Invocation** | Complete agent request | `@architect design TimeOff feature` |
| **Sub-Agent** | Agent spawned by orchestrator for parallel work | Architect + Guard running simultaneously |
| **Verdict** | Agent's final output/decision | `PASS`, `BLOCK`, `NEEDS_CHANGES` |

### 5.3 Execution Modes

| Mode | Description | Parallelism |
|------|-------------|-------------|
| **Sequential** | One agent at a time, in order | None |
| **Parallel** | Multiple agents simultaneously | Yes |
| **Delegated** | Orchestrator routes to single agent | N/A |
| **Composite** | Orchestrator runs multiple agents, synthesizes | Yes |

---

## 6. SDK TERMS

### 6.1 Factory Functions

| Factory | Purpose | Input | Output |
|---------|---------|-------|--------|
| `createOrgEndpoint` | Org-scoped API route with auth | Config object | Route handler |
| `createNetworkEndpoint` | Network-scoped API route | Config object | Route handler |
| `Entity` | Domain entity schema builder | Name, fields | Schema + CRUD schemas |
| `SubEntity` | Embedded object schema | Name, fields | Zod schema |
| `DefineEnum` | Type-safe enum | Name, values | Zod enum |

### 6.2 Validation Terms

| Term | Definition | When Fixable |
|------|------------|--------------|
| **Auto-Fixable** | SDK can correct automatically | `pnpm lint --fix` resolves |
| **Manual-Fix** | Requires developer intervention | Config changes, logic errors |
| **Advisory** | Warning only, doesn't block | Style preferences, suggestions |

---

## 7. ERROR TERMS

### 7.1 TypeScript Error Categories

| Category | Error Codes | Common Cause |
|----------|-------------|--------------|
| **Module Resolution** | TS2307 | Missing `@fresh-schedules/*` path in tsconfig |
| **Type Mismatch** | TS2345, TS2322 | Zod version mismatch, incorrect inference |
| **Implicit Any** | TS7031, TS7006 | Missing type annotation on parameter |
| **Property Access** | TS2339 | Generic lost in wrapper function |
| **Null/Undefined** | TS2532, TS18048 | Missing null check |

### 7.2 Fix Capability Matrix

| Error Type | Auto-Fix? | SDK Handles? | Manual Required? |
|------------|-----------|--------------|------------------|
| Lint violations | ✅ Yes | ✅ Yes | No |
| Format issues | ✅ Yes | ✅ Yes | No |
| TS7031 Implicit Any | ⚠️ Partial | ✅ Suggests | Sometimes |
| TS2307 Module | ❌ No | ❌ No | ✅ Yes (tsconfig) |
| TS2345 Zod | ⚠️ Partial | ✅ Detects | Often |
| Pattern violations | ⚠️ Partial | ✅ Reports | Depends |

---

## 8. BRANCH TERMS

| Branch | Purpose | Merges To | From |
|--------|---------|-----------|------|
| `main` | Production code | Deploys | `dev` only |
| `dev` | Pre-production validation | `main` | Feature branches |
| `feature/*` | New functionality | `dev` | `dev` |
| `fix/*` | Bug fixes | `dev` | `dev` |
| `refactor/*` | Code improvements | `dev` | `dev` |
| `chore/*` | Maintenance tasks | `dev` | `dev` |
| `hotfix/*` | Emergency production fixes | `main` + `dev` | `main` |

---

## 9. GATE TERMS

| Gate | Purpose | Commands | Blocking? |
|------|---------|----------|-----------|
| **STATIC** | Syntax & style | `pnpm lint`, `pnpm format:check`, `pnpm typecheck` | Yes |
| **CORRECTNESS** | Tests pass | `pnpm test:unit`, `pnpm test:rules`, `pnpm test:e2e` | Yes |
| **SAFETY** | Security & patterns | `pnpm validate:patterns`, secret scan, `pnpm audit` | Yes |
| **PERF** | Performance budget | Bundle analysis, Lighthouse | Conditional |
| **AI** | Context validation | Hallucination check, context validator | Advisory |

---

## 10. VS CODE / COPILOT TERMS

| Term | Definition | Location |
|------|------------|----------|
| **Copilot Instructions** | Global instructions for all Copilot interactions | `.github/copilot-instructions.md` |
| **Agent Mode** | VS Code's multi-agent execution capability | Extension setting |
| **Sub-Agent** | Parallel agent instance spawned by orchestrator | Runtime concept |
| **Workspace** | VS Code's project context | `.vscode/` folder |
| **Design Workspace** | Multi-agent design session | Agent Mode feature |

---

## APPENDIX A: ABBREVIATIONS

| Abbrev | Full Term |
|--------|-----------|
| SDK | Software Development Kit |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| PR | Pull Request |
| CI | Continuous Integration |
| CD | Continuous Deployment |
| Org | Organization |
| Auth | Authentication |
| Authz | Authorization |
| RBAC | Role-Based Access Control |
| OWASP | Open Web Application Security Project |
| TS | TypeScript |
| Zod | TypeScript-first schema validation library |

---

## APPENDIX B: FILE EXTENSION REFERENCE

| Extension | Type | Handler |
|-----------|------|---------|
| `.ts` | TypeScript source | `tsc`, `tsx` |
| `.tsx` | TypeScript + JSX | `tsc`, `tsx` |
| `.mjs` | ES Module JavaScript | Node.js |
| `.json` | JSON data | Node.js, any |
| `.md` | Markdown documentation | Rendered |
| `.yml` / `.yaml` | YAML config | GitHub Actions, etc. |
| `.rules` | Firestore rules | Firebase emulator |

---

**END OF DEFINITIONS**

Next document: [02_PROTOCOLS.md](./02_PROTOCOLS.md)
