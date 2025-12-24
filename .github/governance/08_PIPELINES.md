# FRESH SCHEDULES - PIPELINES

> **Version**: 1.0.0  
> **Status**: CANONICAL  
> **Authority**: Sr Dev / Architecture  
> **Binding**: YES - Pipelines are enforced by CI

This document defines all pipeline configurations.

---

## PIPELINE OVERVIEW

### Families

| Family       | Purpose                | Trigger                      |
| ------------ | ---------------------- | ---------------------------- |
| **Feature**  | New functionality      | `feature/*` branches         |
| **Bug**      | Fixing broken behavior | `fix/*` branches             |
| **Schema**   | Type/schema changes    | Changes to `packages/types/` |
| **Refactor** | Code improvements      | `refactor/*` branches        |
| **Security** | Auth, rules, secrets   | Changes to security files    |

### Variants

| Variant      | Criteria                         | Speed       |
| ------------ | -------------------------------- | ----------- |
| **FAST**     | 1 file, no domain logic          | ~30 seconds |
| **STANDARD** | 2-5 files, single domain         | ~2 minutes  |
| **HEAVY**    | >5 files, multi-domain, security | ~5 minutes  |

---

## PIPELINE CONFIGURATIONS

### Feature.FAST

```yaml
name: Feature.FAST
description: Quick validation for single-file, non-critical changes
trigger:
  - Single file changed
  - No domain logic affected
  - No security files

gates:
  - STATIC

timeout: 60_000 # 1 minute
parallel: true
failFast: true
```

**When to use**: Typo fixes, copy changes, single component updates

---

### Feature.STANDARD

```yaml
name: Feature.STANDARD
description: Standard feature development validation
trigger:
  - 2-5 files changed
  - Single domain affected
  - No security implications

gates:
  - STATIC
  - CORRECTNESS

timeout: 180_000 # 3 minutes
parallel: false # Gates run sequentially
failFast: true
```

**When to use**: New component, new hook, API endpoint addition

---

### Feature.HEAVY

```yaml
name: Feature.HEAVY
description: Comprehensive validation for large features
trigger:
  - >5 files changed
  - Multiple domains affected
  - OR any security-adjacent code

gates:
  - STATIC
  - CORRECTNESS
  - SAFETY
  - PERF

timeout: 300_000  # 5 minutes
parallel: false
failFast: true
```

**When to use**: Multi-entity features, cross-cutting changes

---

### Bug.FAST

```yaml
name: Bug.FAST
description: Quick fix for obvious bugs
trigger:
  - Single file fix
  - Clear bug reproduction
  - Existing tests cover case

gates:
  - STATIC

timeout: 60_000
parallel: true
failFast: true
```

**When to use**: Off-by-one errors, null checks, obvious fixes

---

### Bug.STANDARD

```yaml
name: Bug.STANDARD
description: Standard bug fix validation
trigger:
  - Bug fix with test coverage
  - May affect multiple files
  - No security implications

gates:
  - STATIC
  - CORRECTNESS

timeout: 180_000
parallel: false
failFast: true
```

**When to use**: Most bug fixes

---

### Bug.HEAVY

```yaml
name: Bug.HEAVY
description: Complex bug fix with broad impact
trigger:
  - Bug affects multiple systems
  - Requires new test coverage
  - May have regression risk

gates:
  - STATIC
  - CORRECTNESS
  - SAFETY

timeout: 300_000
parallel: false
failFast: true
```

**When to use**: Data corruption bugs, race conditions, complex logic errors

---

### Schema.STANDARD

```yaml
name: Schema.STANDARD
description: Schema/type changes validation
trigger:
  - Changes to packages/types/
  - Changes to .schema.ts files
  - Zod schema modifications

gates:
  - STATIC
  - CORRECTNESS
  - SAFETY

timeout: 240_000 # 4 minutes
parallel: false
failFast: true
```

**When to use**: Any schema modification

---

### Schema.HEAVY

```yaml
name: Schema.HEAVY
description: Breaking schema changes
trigger:
  - Schema field removal
  - Type narrowing
  - Breaking API changes

gates:
  - STATIC
  - CORRECTNESS
  - SAFETY
  - PERF
  - AI # Advisory for migration impact

timeout: 360_000 # 6 minutes
parallel: false
failFast: true
```

**When to use**: Breaking changes, migrations

---

### Refactor.FAST

```yaml
name: Refactor.FAST
description: Quick refactoring validation
trigger:
  - Rename only
  - Single file reorganization
  - No behavior change

gates:
  - STATIC

timeout: 60_000
parallel: true
failFast: true
```

**When to use**: Variable renames, import reorganization

---

### Refactor.STANDARD

```yaml
name: Refactor.STANDARD
description: Standard refactoring validation
trigger:
  - Multi-file refactor
  - Pattern application
  - No behavior change

gates:
  - STATIC
  - CORRECTNESS

timeout: 180_000
parallel: false
failFast: true
```

**When to use**: Pattern migrations, code cleanup

---

### Refactor.HEAVY

```yaml
name: Refactor.HEAVY
description: Large-scale refactoring
trigger:
  - >10 files affected
  - Architecture changes
  - Requires careful verification

gates:
  - STATIC
  - CORRECTNESS
  - SAFETY

timeout: 300_000
parallel: false
failFast: true
```

**When to use**: Package reorganization, major pattern changes

---

### Security.STANDARD

```yaml
name: Security.STANDARD
description: Security-related changes
trigger:
  - Changes to firestore.rules
  - Changes to auth code
  - Changes to api-framework
  - Any file in security paths

gates:
  - STATIC
  - CORRECTNESS
  - SAFETY

timeout: 300_000
parallel: false
failFast: true
required_approvals: 2
```

**When to use**: Any security-related changes

---

### Security.HEAVY

```yaml
name: Security.HEAVY
description: Critical security changes
trigger:
  - firestore.rules changes
  - Auth bypass potential
  - Secrets handling
  - Permission changes

gates:
  - STATIC
  - CORRECTNESS
  - SAFETY
  - PERF
  - AI

timeout: 420_000 # 7 minutes
parallel: false
failFast: true
required_approvals: 2
security_review: required
```

**When to use**: Rule changes, auth modifications, critical security fixes

---

## AUTO-DETECTION RULES

### Detection Priority

```typescript
function detectPipeline(changedFiles: string[]): Pipeline {
  // 1. Security detection (highest priority)
  const securityPatterns = [
    "firestore.rules",
    ".env",
    "**/auth/**",
    "**/security/**",
    "packages/api-framework/**",
  ];

  if (matchesAny(changedFiles, securityPatterns)) {
    return isBreaking(changedFiles) ? "Security.HEAVY" : "Security.STANDARD";
  }

  // 2. Schema detection
  const schemaPatterns = ["packages/types/src/schemas/**", "**/*.schema.ts"];

  if (matchesAny(changedFiles, schemaPatterns)) {
    return isBreaking(changedFiles) ? "Schema.HEAVY" : "Schema.STANDARD";
  }

  // 3. Size-based detection
  const fileCount = changedFiles.length;
  const packages = uniquePackages(changedFiles);

  // Determine family from branch name or content
  const family = detectFamily(changedFiles);

  if (fileCount === 1) {
    return `${family}.FAST`;
  } else if (fileCount <= 5 && packages.length === 1) {
    return `${family}.STANDARD`;
  } else {
    return `${family}.HEAVY`;
  }
}
```

### Family Detection

```typescript
function detectFamily(changedFiles: string[]): Family {
  // Check branch name first
  const branch = getCurrentBranch();

  if (branch.startsWith("feature/")) return "Feature";
  if (branch.startsWith("fix/")) return "Bug";
  if (branch.startsWith("refactor/")) return "Refactor";
  if (branch.startsWith("hotfix/")) return "Security";

  // Fall back to content analysis
  const hasNewFiles = changedFiles.some((f) => isNewFile(f));
  const hasTestChanges = changedFiles.some((f) => f.includes(".test.") || f.includes(".spec."));

  if (hasNewFiles && !hasTestChanges) return "Feature";
  if (!hasNewFiles && hasTestChanges) return "Bug";

  return "Feature"; // Default
}
```

---

## GATE SPECIFICATIONS

### STATIC Gate

```yaml
name: STATIC
displayName: Static Analysis
commands:
  - pnpm lint:check
  - pnpm format:check
  - pnpm typecheck
timeout: 120_000
blocking: true
parallel: true # Commands can run in parallel
autoFix:
  - pnpm lint --fix
  - pnpm format
```

### CORRECTNESS Gate

```yaml
name: CORRECTNESS
displayName: Tests & Correctness
commands:
  - pnpm test:unit
  - pnpm test:rules
  - pnpm test:e2e # Only in HEAVY variants
timeout: 180_000
blocking: true
parallel: false
coverage:
  minimum: 80
  failOnDecrease: true
```

### SAFETY Gate

```yaml
name: SAFETY
displayName: Security & Safety
commands:
  - pnpm validate:patterns
  - git secrets --scan
  - pnpm audit --audit-level=high
timeout: 120_000
blocking: true
parallel: true
thresholds:
  patternScore: 90 # Minimum pattern compliance
  auditLevel: high # Block on high+ vulnerabilities
```

### PERF Gate

```yaml
name: PERF
displayName: Performance Analysis
commands:
  - pnpm build
  - pnpm analyze:bundle
timeout: 180_000
blocking: false # Advisory in most cases
parallel: false
thresholds:
  bundleIncrease: 10 # Warn if >10% increase
  lighthouseScore: 80 # Warn if <80
```

### AI Gate

```yaml
name: AI
displayName: AI Advisory
commands:
  - Context validation (internal)
  - Hallucination check (internal)
timeout: 60_000
blocking: false # Never blocks, only advises
parallel: true
```

---

## PIPELINE EXECUTION

### Execution Order

```
1. STATIC (always first - fastest feedback)
   ↓ pass
2. CORRECTNESS (parallel with SAFETY if both present)
   ↓ pass
3. SAFETY (parallel with CORRECTNESS if both present)
   ↓ pass
4. PERF (only if in pipeline)
   ↓ pass/warn
5. AI (always last, advisory only)
```

### Fail-Fast Behavior

When `failFast: true`:

- First gate failure stops pipeline
- Remaining gates skipped
- Result indicates which gate failed

When `failFast: false`:

- All gates run regardless of failures
- Full report of all issues
- Used for comprehensive audits

### Result Format

```typescript
interface PipelineResult {
  pipeline: string;
  status: "PASSED" | "FAILED" | "PARTIAL";
  duration: number;
  timestamp: string;
  commit: string;
  gates: {
    name: string;
    status: "PASSED" | "FAILED" | "SKIPPED" | "ADVISORY";
    duration: number;
    errors: string[];
    warnings: string[];
    autoFixable: boolean;
  }[];
}
```

---

## OVERRIDES

### Manual Pipeline Selection

```bash
# Override auto-detection
pnpm orchestrate Security.HEAVY --force
```

### Skip Gates (DANGER)

```bash
# Skip specific gate (requires approval comment)
pnpm orchestrate Feature.STANDARD --skip=PERF

# CANNOT skip: STATIC, SAFETY for Security.* pipelines
```

### Emergency Override

For P0 incidents only:

```bash
# Emergency merge (still runs STATIC)
pnpm orchestrate --emergency

# Requires: P0 ticket, team lead approval, post-mortem
```

---

**END OF PIPELINES**

Next document: [09_CI_CD.md](./09_CI_CD.md)
