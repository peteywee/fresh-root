# Fresh Schedules Protocol & Directive Improvement Report
**Repository**: `peteywee/frsh-root` (Fresh Schedules)\
**Date**: December 12, 2025\
**Classification**: NON-TRIVIAL (Refactor.HEAVY + Security.STANDARD)

---

## Executive Summary
This document provides a comprehensive analysis of the current repository governance architecture
and recommends improvements across protocols, directives, tools, and agent behavior contracts. The
goal is to establish a post-CrewOps orchestration system that is more maintainable, enforceable, and
cognitively aligned with development workflows.

---

## Part 1: Current State Analysis
### 1.1 Existing Governance Files Identified
From past conversation context:

| File                                         | Category  | Status           |
| -------------------------------------------- | --------- | ---------------- |
| `.github/BATCH_PROTOCOL_OFFICIAL.md`         | Protocol  | Active, binding  |
| `.github/BRANCH_STRATEGY_GOVERNANCE.md`      | Directive | Active           |
| `.github/BRANCH_STRATEGY_QUICK_REFERENCE.md` | Index     | Active           |
| `.github/GOVERNANCE_DEPLOYMENT_STATUS.md`    | Index     | Active           |
| `.github/SR_DEV_DIRECTIVE.md`                | Directive | Active           |
| `.github/copilot-instructions.md`            | Index     | Binding          |
| `.github/SECURITY_FIXES.md`                  | Protocol  | Needs signals    |
| `.github/WORKER_DECISION_TREE.md`            | Protocol  | Legacy (CrewOps) |
| `docs/crewops/*`                             | Legacy    | **DEPRECATED**   |

### 1.2 Current Agent Modes
The system currently supports four agent personas:

1. **FRESH Architect** — Designs structure & boundaries
2. **FRESH Refactor** — Produces diffs for pattern violations
3. **FRESH Guard** — PR review gatekeeper
4. **FRESH Auditor** — Full compliance reports

### 1.3 Identified Issues
| Issue                                            | Severity | Location                        |
| ------------------------------------------------ | -------- | ------------------------------- |
| CrewOps deprecation creates orchestration gap    | **HIGH** | `docs/crewops/`                 |
| Batch protocol references deprecated systems     | MEDIUM   | `BATCH_PROTOCOL_OFFICIAL.md`    |
| Branch rules need rewrite (per user)             | **HIGH** | `.github/BRANCH_STRATEGY_*`     |
| Agent modes lack explicit contracts              | MEDIUM   | Scattered across `.github/`     |
| Pattern validation is JavaScript, not TypeScript | LOW      | `scripts/validate-patterns.mjs` |
| Missing unified tool registry                    | MEDIUM   | No central manifest             |
| No agent personality/tone specification          | LOW      | Agent invocations               |

---

## Part 2: Protocol Improvements
### 2.1 New Protocol Architecture
Replace the current flat structure with a hierarchical protocol system:

```
.github/
├── protocols/
│   ├── 00_META_PROTOCOL.md           # How to read/interpret protocols
│   ├── 01_CLASSIFICATION_PROTOCOL.md  # TRIVIAL vs NON-TRIVIAL
│   ├── 02_PIPELINE_PROTOCOL.md        # Feature/Bug/Schema/Refactor/Security
│   ├── 03_GATE_PROTOCOL.md            # Static/Correctness/Safety/Perf/AI gates
│   ├── 04_BATCH_PROTOCOL.md           # Multi-change coordination
│   └── 05_EMERGENCY_PROTOCOL.md       # Hotfix procedures
├── directives/
│   ├── SR_DEV_DIRECTIVE.md            # Senior dev authority
│   ├── BRANCH_DIRECTIVE.md            # Branch governance (rewritten)
│   ├── SECURITY_DIRECTIVE.md          # Security requirements
│   └── DEPLOYMENT_DIRECTIVE.md        # Release procedures
├── contracts/
│   ├── AGENT_CONTRACTS.md             # Agent behavior specifications
│   ├── TOOL_CONTRACTS.md              # Tool input/output contracts
│   └── API_CONTRACTS.md               # API route requirements
└── indexes/
    ├── QUICK_REFERENCE.md             # Print-friendly summary
    ├── TOOL_REGISTRY.md               # All tools and their purposes
    └── PATTERN_CATALOG.md             # Canonical patterns
```

### 2.2 New Classification Protocol
Replace the existing task classification with this enhanced version:

```markdown
# 01_CLASSIFICATION_PROTOCOL.md
## Classification Matrix
| Dimension  | TRIVIAL (ALL true) | NON-TRIVIAL (ANY true)                                             |
| ---------- | ------------------ | ------------------------------------------------------------------ |
| **Scope**  | ≤1 file            | >1 file OR cross-module                                            |
| **Domain** | UI/copy only       | Domain logic (Org, Venue, Schedule, Shift, Staff, Forecast, Labor) |
| **Data**   | No persistence     | Schema/query/collection changes                                    |
| **Auth**   | None               | Auth/authz/security paths                                          |
| **Risk**   | Cosmetic only      | Data loss, security, money impact                                  |
| **Tests**  | Existing coverage  | New tests required                                                 |

## Fail-Closed Rule
If classification is uncertain → NON-TRIVIAL

## Pipeline Selection Matrix
| Scenario                       | Pipeline         | Gates Required      |
| ------------------------------ | ---------------- | ------------------- |
| New feature, isolated          | Feature.FAST     | STATIC              |
| New feature, cross-domain      | Feature.STANDARD | STATIC, CORRECTNESS |
| New feature, security-relevant | Feature.HEAVY    | ALL                 |
| Bug, obvious fix               | Bug.FAST         | STATIC              |
| Bug, domain logic              | Bug.STANDARD     | STATIC, CORRECTNESS |
| Bug, data corruption           | Bug.HEAVY        | ALL                 |
| Schema change                  | Schema.STANDARD  | ALL + MIGRATION     |
| Refactor, isolated             | Refactor.FAST    | STATIC              |
| Refactor, cross-module         | Refactor.HEAVY   | ALL                 |
| Security fix                   | Security.\*      | ALL + RED TEAM      |
```

### 2.3 New Gate Protocol
```markdown
# 03_GATE_PROTOCOL.md
## Gate Classes
### STATIC Gate
- **Tools**: ESLint, Prettier, TypeScript
- **Commands**: `pnpm lint:fix`, `pnpm format:fix`, `pnpm typecheck`
- **Pass Criteria**: Zero errors, zero warnings in strict mode
- **Blocking**: YES (merge-blocking)

### CORRECTNESS Gate
- **Tools**: Vitest (unit), Playwright (E2E), Rules tests
- **Commands**: `pnpm test:unit`, `pnpm test:e2e`, `pnpm test:rules`
- **Pass Criteria**: 100% passing, coverage thresholds met
- **Blocking**: YES

### SAFETY Gate
- **Tools**: `validate-patterns.ts`, secret scans, dependency audit
- **Commands**: `pnpm validate:patterns`, `pnpm audit`, `pnpm secrets:check`
- **Pass Criteria**: All patterns compliant, no secrets, no critical CVEs
- **Blocking**: YES

### PERF/COST Gate
- **Tools**: Bundle analyzer, Lighthouse, Firebase cost estimator
- **Commands**: `pnpm analyze:bundle`, `pnpm audit:perf`
- **Pass Criteria**: No regression >10%, cost estimate approved
- **Blocking**: CONDITIONAL (for performance-sensitive changes)

### AI Gate
- **Tools**: Context validator, hallucination checker
- **Commands**: `pnpm validate:ai-context`
- **Pass Criteria**: Context complete, no hallucination flags
- **Blocking**: ADVISORY (for AI-assisted changes)

## Gate Execution Order
1. STATIC (always first, fastest feedback)
2. CORRECTNESS (after static passes)
3. SAFETY (parallel with correctness)
4. PERF/COST (if applicable)
5. AI (if AI-assisted)
```

---

## Part 3: Directive Improvements
### 3.1 Rewritten Branch Directive
```markdown
# BRANCH_DIRECTIVE.md
## Branch Hierarchy
```

main (production) ├── dev (pre-production validation) │ ├── feature/_(new features) │ ├── fix/_
(bug fixes) │ ├── refactor/_(code improvements) │ └── chore/_ (maintenance) └── hotfix/\*
(emergency production fixes)

```

## Branch Rules
### Protected Branches
| Branch | Required Checks | Required Reviews | Force Push |
|--------|-----------------|------------------|------------|
| `main` | ALL gates | 2 approvals | ❌ NEVER |
| `dev` | STATIC, CORRECTNESS | 1 approval | ❌ NEVER |
| `feature/*` | STATIC | 0 | ✅ ALLOWED |

### Naming Conventions
```

feature/FS-{ticket}-{short-description} fix/FS-{ticket}-{short-description}
refactor/{scope}-{description} chore/{scope}-{description} hotfix/URGENT-{description}

```

### Merge Strategy
| Source → Target | Strategy | Squash |
|-----------------|----------|--------|
| `feature/*` → `dev` | Squash merge | YES |
| `dev` → `main` | Merge commit | NO |
| `hotfix/*` → `main` | Merge commit | NO |
| `hotfix/*` → `dev` | Cherry-pick | N/A |

## Governance Triggers
| Event | Action |
|-------|--------|
| PR opened to `dev` | Run STATIC + CORRECTNESS gates |
| PR opened to `main` | Run ALL gates + require 2 reviews |
| Direct push to `main` | **BLOCKED** |
| Force push to protected | **BLOCKED** |
| PR approved | Trigger dev deployment |
| Dev deployment success | Enable merge to main |
```

### 3.2 New Security Directive
```markdown
# SECURITY_DIRECTIVE.md
## Non-Negotiable Requirements
### API Route Security
Every API route in `apps/web/app/api/` MUST:

1. Use `createOrgEndpoint` or `createNetworkEndpoint` wrapper
2. Validate all inputs with Zod schemas from `@fresh-schedules/types`
3. Include explicit role checks via `hasAnyRole()`
4. Return standardized error responses

### Firestore Rules
Every collection rule MUST:

1. Include `sameOrg(orgId)` or `isNetworkMember()` check
2. Deny list operations by default: `allow list: if false`
3. Include RBAC on write: `hasAnyRole([...])`
4. Be tested in `tests/rules/`

### Environment Variables
1. NO secrets in `.env.local` committed to repo
2. All secrets via environment injection at runtime
3. Secret patterns validated by `scripts/validate-secrets.ts`

### SDK Usage
1. Use factory functions from `@fresh-schedules/sdk-wrappers`
2. NO direct Firebase Admin imports in route handlers
3. All SDK calls wrapped with error handling

## Violation Response
| Severity                    | Response                               |
| --------------------------- | -------------------------------------- |
| CRITICAL (data exposure)    | Block merge, alert team, immediate fix |
| HIGH (auth bypass possible) | Block merge, require security review   |
| MEDIUM (missing validation) | Block merge, require fix               |
| LOW (style/convention)      | Warning, fix in follow-up              |
```

---

## Part 4: Tool Improvements
### 4.1 Tool Registry
Create a central tool manifest at `.github/TOOL_REGISTRY.md`:

```markdown
# TOOL_REGISTRY.md
## Validation Tools
| Tool                | Purpose                | Command                  | Gate        |
| ------------------- | ---------------------- | ------------------------ | ----------- |
| `validate-patterns` | Pattern compliance     | `pnpm validate:patterns` | SAFETY      |
| `validate-secrets`  | Secret leak detection  | `pnpm validate:secrets`  | SAFETY      |
| `validate-deps`     | Dependency layer check | `pnpm validate:deps`     | SAFETY      |
| `validate-schemas`  | Zod schema consistency | `pnpm validate:schemas`  | CORRECTNESS |

## Analysis Tools
| Tool                 | Purpose               | Command                   | Output              |
| -------------------- | --------------------- | ------------------------- | ------------------- |
| `analyze-deps`       | Dependency graph      | `pnpm analyze:deps`       | `deps.json`         |
| `analyze-coverage`   | Test coverage map     | `pnpm analyze:coverage`   | `coverage.json`     |
| `analyze-complexity` | Cyclomatic complexity | `pnpm analyze:complexity` | `complexity.json`   |
| `analyze-bundle`     | Bundle size analysis  | `pnpm analyze:bundle`     | `bundle-stats.json` |

## Generation Tools
| Tool              | Purpose              | Command                | Output                |
| ----------------- | -------------------- | ---------------------- | --------------------- |
| `gen-types`       | Type generation      | `pnpm gen:types`       | `packages/types/`     |
| `gen-routes`      | Route manifest       | `pnpm gen:routes`      | `route-manifest.json` |
| `gen-rules-tests` | Firestore test stubs | `pnpm gen:rules-tests` | `tests/rules/`        |

## Orchestration Tools (Post-CrewOps)
| Tool                | Purpose              | Command                  | Notes            |
| ------------------- | -------------------- | ------------------------ | ---------------- |
| `orchestrate`       | Run full pipeline    | `pnpm orchestrate`       | Replaces CrewOps |
| `orchestrate:ci`    | CI-specific pipeline | `pnpm orchestrate:ci`    | GitHub Actions   |
| `orchestrate:local` | Local dev pipeline   | `pnpm orchestrate:local` | Fix mode         |
```

### 4.2 New Orchestrator Tool
Replace CrewOps with a TypeScript-based orchestrator:

```typescript
// scripts/orchestrate.ts

interface PipelineConfig {
  family: "Feature" | "Bug" | "Schema" | "Refactor" | "Security";
  variant: "FAST" | "STANDARD" | "HEAVY";
  gates: GateClass[];
  parallel: boolean;
}

interface GateClass {
  name: string;
  command: string;
  blocking: boolean;
  timeout: number;
}

const GATE_DEFINITIONS: Record<string, GateClass> = {
  STATIC: {
    name: "Static Analysis",
    command: "pnpm lint:check && pnpm format:check && pnpm typecheck",
    blocking: true,
    timeout: 120_000,
  },
  CORRECTNESS: {
    name: "Tests",
    command: "pnpm test:unit && pnpm test:e2e && pnpm test:rules",
    blocking: true,
    timeout: 300_000,
  },
  SAFETY: {
    name: "Security",
    command: "pnpm validate:patterns && pnpm validate:secrets",
    blocking: true,
    timeout: 60_000,
  },
  PERF: {
    name: "Performance",
    command: "pnpm analyze:bundle",
    blocking: false,
    timeout: 180_000,
  },
};

async function runPipeline(config: PipelineConfig): Promise<PipelineResult> {
  const results: GateResult[] = [];

  for (const gate of config.gates) {
    const result = await runGate(gate);
    results.push(result);

    if (result.status === "FAILED" && gate.blocking) {
      return { status: "BLOCKED", results, blockedBy: gate.name };
    }
  }

  return { status: "PASSED", results };
}
```

### 4.3 Migrate `validate-patterns.mjs` to TypeScript
```typescript
// scripts/validate-patterns.ts

import { Project, SourceFile } from "ts-morph";
import * as path from "path";

interface PatternViolation {
  file: string;
  line: number;
  pattern: string;
  message: string;
  severity: "ERROR" | "WARNING";
  autoFixable: boolean;
}

interface PatternRule {
  id: string;
  name: string;
  description: string;
  layer: "api" | "service" | "ui" | "types" | "rules";
  check: (file: SourceFile) => PatternViolation[];
  fix?: (file: SourceFile) => void;
}

const PATTERN_RULES: PatternRule[] = [
  {
    id: "API_001",
    name: "createOrgEndpoint Required",
    description: "All API routes must use createOrgEndpoint or createNetworkEndpoint",
    layer: "api",
    check: (file) => {
      const violations: PatternViolation[] = [];
      const imports = file.getImportDeclarations();
      const hasOrgEndpoint = imports.some(
        (i) =>
          i.getModuleSpecifierValue().includes("api-framework") &&
          i
            .getNamedImports()
            .some((n) => ["createOrgEndpoint", "createNetworkEndpoint"].includes(n.getName())),
      );

      if (!hasOrgEndpoint && file.getFilePath().includes("/api/")) {
        violations.push({
          file: file.getFilePath(),
          line: 1,
          pattern: "API_001",
          message: "Missing createOrgEndpoint/createNetworkEndpoint import",
          severity: "ERROR",
          autoFixable: false,
        });
      }

      return violations;
    },
  },
  {
    id: "UI_001",
    name: "Use Client Directive",
    description: 'Components using hooks must have "use client" directive',
    layer: "ui",
    check: (file) => {
      const violations: PatternViolation[] = [];
      const hasHooks = file.getFullText().match(/use(State|Effect|Context|Ref|Memo|Callback)/);
      const hasUseClient =
        file.getFullText().startsWith('"use client"') ||
        file.getFullText().startsWith("'use client'");

      if (hasHooks && !hasUseClient) {
        violations.push({
          file: file.getFilePath(),
          line: 1,
          pattern: "UI_001",
          message: 'Component uses hooks but missing "use client" directive',
          severity: "ERROR",
          autoFixable: true,
        });
      }

      return violations;
    },
    fix: (file) => {
      file.insertText(0, '"use client";\n\n');
    },
  },
  // ... more rules
];

export async function validatePatterns(rootDir: string): Promise<ValidationReport> {
  const project = new Project({
    tsConfigFilePath: path.join(rootDir, "tsconfig.json"),
  });

  const violations: PatternViolation[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    for (const rule of PATTERN_RULES) {
      const ruleViolations = rule.check(sourceFile);
      violations.push(...ruleViolations);
    }
  }

  return {
    totalFiles: project.getSourceFiles().length,
    violations,
    errorCount: violations.filter((v) => v.severity === "ERROR").length,
    warningCount: violations.filter((v) => v.severity === "WARNING").length,
    passed: violations.filter((v) => v.severity === "ERROR").length === 0,
  };
}
```

---

## Part 5: Agent Behavior Contracts
### 5.1 Agent Contract Specification
````markdown
# AGENT_CONTRACTS.md
## Contract Structure
Each agent mode has a defined contract with:

- **Identity**: Name, purpose, authority level
- **Triggers**: When this agent activates
- **Inputs**: What context it needs
- **Outputs**: What it produces
- **Constraints**: What it cannot do
- **Personality**: Tone and communication style

---

## FRESH Architect Agent
### Identity
- **Name**: FRESH Architect
- **Purpose**: Design structure, boundaries, and patterns
- **Authority**: Can propose schema changes, new patterns, deprecations

### Triggers
- "As FRESH architect, design..."
- "Architect mode: create..."
- Schema design requests
- New feature architecture requests

### Inputs Required
- Feature requirements or problem statement
- Current relevant schemas (auto-loaded from `packages/types/`)
- Affected API routes
- Security requirements

### Outputs
| Artifact                     | Format              | Location                      |
| ---------------------------- | ------------------- | ----------------------------- |
| Schema proposal              | TypeScript + Zod    | `packages/types/src/schemas/` |
| API route design             | TypeScript skeleton | `apps/web/app/api/`           |
| Firestore rules              | Security rules DSL  | `firestore.rules`             |
| Architecture decision record | Markdown            | `docs/adr/`                   |

### Constraints
- MUST NOT directly modify production code (propose only)
- MUST reference canonical patterns from `PATTERN_CATALOG.md`
- MUST include security considerations
- MUST NOT create new patterns without justification

### Personality
- **Tone**: Authoritative but collaborative
- **Style**: Thorough explanations, multiple options when appropriate
- **Bias**: Prefer existing patterns over new ones
- **Communication**: Uses diagrams, tables, structured formats

---

## FRESH Refactor Agent
### Identity
- **Name**: FRESH Refactor
- **Purpose**: Fix pattern violations and improve code quality
- **Authority**: Can modify code to match patterns

### Triggers
- "As FRESH refactor, fix..."
- "Refactor mode: improve..."
- Pattern violation found in audit
- Technical debt tickets

### Inputs Required
- File(s) to refactor
- Specific violation or improvement goal
- Pattern rules from `PATTERN_CATALOG.md`

### Outputs
| Artifact     | Format       | Notes                 |
| ------------ | ------------ | --------------------- |
| Code diff    | Unified diff | Ready for PR          |
| Before/after | Code blocks  | For review            |
| Explanation  | Markdown     | Why changes were made |

### Constraints
- MUST produce minimal diffs (change only what's necessary)
- MUST NOT change behavior (unless explicitly requested)
- MUST pass STATIC gate locally before outputting
- MUST NOT introduce new dependencies without approval

### Personality
- **Tone**: Precise, technical
- **Style**: Diff-focused, minimal commentary
- **Bias**: Conservative changes, smallest possible fix
- **Communication**: Code-centric, explanations only when non-obvious

---

## FRESH Guard Agent
### Identity
- **Name**: FRESH Guard
- **Purpose**: Review PRs for compliance and quality
- **Authority**: Can block/approve merges

### Triggers
- "As FRESH guard, review..."
- "Guard mode: check this PR..."
- PR opened to `dev` or `main`
- Manual review request

### Inputs Required
- PR diff
- Target branch
- Author context
- Related tickets

### Outputs
| Artifact        | Format                       | Notes                   |
| --------------- | ---------------------------- | ----------------------- |
| Review decision | PASS / BLOCK / NEEDS_CHANGES | Clear verdict           |
| Violation list  | Structured list              | With severity           |
| Recommendations | Markdown                     | Improvement suggestions |

### Decision Matrix
| Finding                     | Count | Verdict         |
| --------------------------- | ----- | --------------- |
| Critical security           | ≥1    | **BLOCK**       |
| Pattern violation (ERROR)   | ≥1    | **BLOCK**       |
| Pattern violation (WARNING) | ≥5    | NEEDS_CHANGES   |
| Pattern violation (WARNING) | 1-4   | PASS with notes |
| Clean                       | 0     | **PASS**        |

### Constraints
- MUST check all files in diff
- MUST NOT approve own changes (if applicable)
- MUST provide actionable feedback for blocks
- MUST NOT block for style preferences not in patterns

### Personality
- **Tone**: Firm but fair
- **Style**: Checklist-based, systematic
- **Bias**: Err on the side of blocking (fail-closed)
- **Communication**: Clear verdicts, specific line references

---

## FRESH Auditor Agent
### Identity
- **Name**: FRESH Auditor
- **Purpose**: Generate comprehensive compliance reports
- **Authority**: Read-only analysis, no modifications

### Triggers
- "As FRESH auditor, generate report..."
- "Auditor mode: scan..."
- Scheduled compliance checks
- Pre-release audits

### Inputs Required
- Scope (full repo, specific directory, specific patterns)
- Report format preference
- Historical comparison (optional)

### Outputs
| Artifact               | Format            | Location                   |
| ---------------------- | ----------------- | -------------------------- |
| Full compliance report | Markdown          | `docs/reports/compliance/` |
| Executive summary      | Markdown (1 page) | `docs/reports/`            |
| Metrics JSON           | JSON              | `docs/reports/metrics/`    |
| Trend analysis         | Markdown + charts | `docs/reports/trends/`     |

### Report Structure
```markdown
# Compliance Report - {date}
## Executive Summary
- Overall Score: {X}/100
- Critical Issues: {N}
- Gate Status: {PASS/FAIL}

## By Pattern Category
### API Patterns (Score: X/100)
### UI Patterns (Score: X/100)
### Security Patterns (Score: X/100)
### Type Patterns (Score: X/100)
## Issue Catalog
[Sorted by severity]

## Recommendations
[Prioritized action items]

## Trend Analysis
[Comparison with previous audits]
```
````

### Constraints
- MUST NOT modify any files
- MUST produce deterministic results for same input
- MUST include timestamps and commit hashes
- MUST NOT make assumptions about intent

### Personality
- **Tone**: Neutral, data-driven
- **Style**: Report format, heavy on metrics
- **Bias**: Completeness over brevity
- **Communication**: Tables, scores, charts

````

### 5.2 Agent Invocation Syntax
Create clear invocation patterns:

```markdown
# Agent Invocation Syntax
## Quick Reference
| Intent | Invocation |
|--------|------------|
| Design new feature | `@architect design {feature}` |
| Fix pattern violation | `@refactor fix {file} {pattern}` |
| Review PR | `@guard review PR#{number}` |
| Full audit | `@auditor report --scope={path}` |

## Full Syntax
### Architect
````

@architect design {feature\_name} --schemas: {comma-separated schema names} --apis: {comma-separated
route paths} --security: {role requirements}

```

### Refactor
```

@refactor fix {file\_path} --pattern: {pattern\_id} --auto: {true|false}

```

### Guard
```

@guard review {PR\_reference} --strict: {true|false} --focus: {security|patterns|all}

```

### Auditor
```

@auditor report --scope: {path|full} --format: {full|summary|json} --compare: {commit\_hash}

```
```

---

## Part 6: Implementation Roadmap
### Phase 1: Foundation (Week 1)
| Task                                    | Owner       | Deliverable            |
| --------------------------------------- | ----------- | ---------------------- |
| Create `.github/protocols/` structure   | Architect   | Directory structure    |
| Write `00_META_PROTOCOL.md`             | Architect   | Protocol reading guide |
| Write `01_CLASSIFICATION_PROTOCOL.md`   | Architect   | Classification rules   |
| Migrate `validate-patterns.mjs` → `.ts` | Implementer | TypeScript validator   |

### Phase 2: Contracts (Week 2)
| Task                            | Owner       | Deliverable              |
| ------------------------------- | ----------- | ------------------------ |
| Write `AGENT_CONTRACTS.md`      | Architect   | All 4 agent specs        |
| Write `TOOL_CONTRACTS.md`       | Architect   | Tool I/O specs           |
| Create orchestrator skeleton    | Implementer | `scripts/orchestrate.ts` |
| Write new `BRANCH_DIRECTIVE.md` | Architect   | Branch rules             |

### Phase 3: Integration (Week 3)
| Task                        | Owner       | Deliverable        |
| --------------------------- | ----------- | ------------------ |
| Update GitHub Actions       | Implementer | New gate workflows |
| Create `TOOL_REGISTRY.md`   | Architect   | Tool manifest      |
| Remove CrewOps dependencies | Implementer | Clean deprecation  |
| Integration testing         | QA          | Full pipeline test |

### Phase 4: Validation (Week 4)
| Task                 | Owner     | Deliverable      |
| -------------------- | --------- | ---------------- |
| Security review      | Security  | Sign-off         |
| Documentation review | Docs      | Updated docs     |
| Team training        | Architect | Training session |
| Soft launch          | All       | Gradual rollout  |

---

## Part 7: Success Metrics
### Governance Health Metrics
| Metric                   | Target | Measurement                   |
| ------------------------ | ------ | ----------------------------- |
| Classification accuracy  | >95%   | Manual audit of 20 random PRs |
| Gate execution time      | <5 min | CI timing                     |
| False positive rate      | <5%    | Manual review of blocks       |
| Pattern compliance       | >90%   | Auditor reports               |
| Agent invocation success | >95%   | Agent usage logs              |

### Developer Experience Metrics
| Metric                    | Target      | Measurement        |
| ------------------------- | ----------- | ------------------ |
| Time to first commit      | <30 min     | New dev onboarding |
| PR cycle time             | <2 days     | GitHub metrics     |
| Gate failure clarity      | >4/5 rating | Dev survey         |
| Documentation findability | >4/5 rating | Dev survey         |

---

## Appendix A: Migration from CrewOps
### Deprecated Items
| CrewOps Component                 | Replacement                     |
| --------------------------------- | ------------------------------- |
| `docs/crewops/BATCH_WORKERS.md`   | `scripts/orchestrate.ts`        |
| `docs/crewops/WORKER_DISPATCH.md` | GitHub Actions workflows        |
| `.github/WORKER_DECISION_TREE.md` | `01_CLASSIFICATION_PROTOCOL.md` |
| CrewOps batch execution           | `pnpm orchestrate`              |

### Migration Steps
1. **Freeze** CrewOps usage (mark deprecated)
2. **Create** new orchestrator
3. **Parallel run** both systems for 1 week
4. **Validate** equivalent behavior
5. **Remove** CrewOps files
6. **Update** all references

---

## Appendix B: Pattern Catalog Quick Reference
| Pattern ID | Layer | Description                  | Severity |
| ---------- | ----- | ---------------------------- | -------- |
| API\_001    | API   | createOrgEndpoint required   | ERROR    |
| API\_002    | API   | Zod validation required      | ERROR    |
| API\_003    | API   | Standardized error responses | ERROR    |
| UI\_001     | UI    | "use client" for hooks       | ERROR    |
| UI\_002     | UI    | Typed props interface        | WARNING  |
| SEC\_001    | Rules | sameOrg() check required     | ERROR    |
| SEC\_002    | Rules | list: false by default       | ERROR    |
| SEC\_003    | Rules | RBAC on writes               | ERROR    |
| TYPE\_001   | Types | Export from index.ts         | WARNING  |
| TYPE\_002   | Types | Zod schema naming            | WARNING  |

---

## Appendix C: CPMEM Template
```
[CPMEM]
task_id: {short_identifier}
timestamp: {ISO_8601}
classification: {TRIVIAL|NON-TRIVIAL}
pipeline: {Family.Variant}
scope_summary:
  - domains: [{affected_domains}]
  - key_files: [{changed_files}]
success_criteria:
  - [x] {criterion_1}
  - [x] {criterion_2}
  - [!] {criterion_3} (partial: {reason})
changes_summary:
  - {bullet_list_of_changes}
gates_status:
  - STATIC: "{planned|passed|user-must-run}"
  - CORRECTNESS: "{status}"
  - SAFETY: "{status}"
  - PERF/COST: "{status}"
  - AI: "{status}"
residual_risk:
  - {risk_description}
next_steps:
  - {follow_up_items}
[/CPMEM]
```
