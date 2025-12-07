# Subagent Team Plan: Parallel Batch Fixes

**Created**: December 7, 2025  
**Status**: Active  
**Purpose**: Orchestrate parallel workers for efficient batch fixes

---

## Team Structure

### Primary Orchestrator (Main Agent)
- **Role**: Task decomposition, dependency analysis, state management
- **Responsibilities**:
  - Parse user requests into atomic tasks
  - Spawn workers for parallelizable work
  - Aggregate results and resolve conflicts
  - Final validation and commit

### Worker Teams

#### 1. Research Worker
- **Trigger**: Before any implementation
- **Tasks**:
  - Search codebase for patterns
  - Read related files
  - Identify dependencies
  - Report findings to orchestrator
- **Parallel**: Yes (can run alongside Planning)

#### 2. Validation Worker
- **Trigger**: After implementation or during planning
- **Tasks**:
  - Run typecheck (`pnpm -w typecheck`)
  - Run lint (`pnpm lint`)
  - Run tests (`pnpm test`)
  - Pattern validation (`node scripts/validate-patterns.mjs`)
- **Parallel**: Yes (runs alongside Implementation)

#### 3. Implementation Worker
- **Trigger**: After Research completes
- **Tasks**:
  - Apply code changes via edit tools
  - Use `multi_replace_string_in_file` for batched edits
  - Create new files as needed
- **Parallel**: No (sequential per file, parallel across files)

#### 4. Documentation Worker
- **Trigger**: Continuous during session
- **Tasks**:
  - Track decisions made
  - Document safeguards created
  - Update relevant markdown files
- **Parallel**: Yes (runs alongside all workers)

---

## Execution Patterns

### Pattern 1: Batch Fix Execution
```
┌─────────────────────────────────────────────────────────────┐
│ Orchestrator: Parse request, create TODO list              │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌───────────────────┐               ┌───────────────────┐
│ Research Worker   │               │ Documentation     │
│ (parallel search) │               │ Worker (tracking) │
└─────────┬─────────┘               └───────────────────┘
          │
          ▼
┌───────────────────┐
│ Implementation    │
│ Worker (edits)    │◄────────────────────┐
└─────────┬─────────┘                     │
          │                               │
          ▼                               │
┌───────────────────┐     Fail?     ┌─────┴─────────────┐
│ Validation Worker │───────────────▶│ Fix & Retry      │
│ (test, lint, type)│               │                   │
└─────────┬─────────┘               └───────────────────┘
          │
          ▼ Pass
┌───────────────────┐
│ Commit & Report   │
└───────────────────┘
```

### Pattern 2: Concurrent File Operations
When editing multiple independent files:
1. Group files by dependency
2. Edit independent groups in parallel batches
3. Validate each batch before proceeding
4. Use `multi_replace_string_in_file` for efficiency

### Pattern 3: Error Recovery (3-Strike Rule)
```
Error Count 1: Fix and document
Error Count 2: Fix and analyze pattern
Error Count 3: STOP - Create safeguard rule
```

---

## CI/CD Integration

### Parallel Job Strategy (GitHub Actions)

```yaml
jobs:
  # Phase 1: Fast checks (parallel)
  lint:        # 30s
  typecheck:   # 45s
  patterns:    # 15s
  
  # Phase 2: Tests (parallel, after Phase 1)
  unit-tests:        # 60s
  integration-tests: # 90s
  e2e-tests:         # 120s
  
  # Phase 3: Build (after Phase 2)
  build:       # 90s
  
  # Phase 4: Deploy (after Phase 3)
  deploy:      # varies
```

### Expected Speedup
- Sequential: ~7-8 minutes
- Parallel: ~3-4 minutes (50% reduction)

---

## Task Batching Rules

### Batch Size
- **Small batch**: 3-5 related files
- **Medium batch**: 6-10 related files
- **Large batch**: 11+ files (split into chunks)

### Batching Criteria
1. Same domain/feature
2. No circular dependencies
3. Independent validation possible

### Batch Execution
```bash
# Example: Fix 10 API routes in batches of 3
Batch 1: zones, venues, shifts (parallel edits)
  └─ Validate batch
Batch 2: schedules, positions, memberships (parallel edits)
  └─ Validate batch
Batch 3: publish, internal, session, onboarding (parallel edits)
  └─ Validate batch
Full validation run
Commit
```

---

## Quality Gates

### Pre-Commit Checklist
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors (or only suppressions documented)
- [ ] Tests: All passing
- [ ] Pattern score: ≥90
- [ ] No secrets in code
- [ ] No console.log in production code

### Review Protocol
1. **SrDev Review (Red Team)**: Security, edge cases, anti-patterns
2. **Chief of Tech Review**: Architecture, scalability, production-readiness
3. **Final Approval**: Both reviewers sign off

---

## Command Reference

```bash
# Parallel validation
pnpm -w typecheck &
pnpm lint &
pnpm test &
wait

# Sequential test suites
pnpm test              # Unit tests
pnpm test:integration  # Integration tests
pnpm test:e2e          # E2E tests

# Pattern validation
node scripts/validate-patterns.mjs --verbose

# Batch commit
git add -A && git commit -m "fix: batch fixes from subagent team"
```

---

**End of Subagent Team Plan**
