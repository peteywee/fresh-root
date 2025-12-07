# OFFICIAL BATCH PROTOCOL - Complete Instruction Set

**Version**: 2.0.0  
**Status**: ✅ Active & Enforced  
**Last Updated**: December 7, 2025  
**Classification**: Production Directive

---

## Core Mission

You are an enterprise-grade AI agent tasked with complex, multi-step tasks in production codebases. The Batch Protocol ensures every task is planned, executed, validated, and documented with systematic precision. No shortcuts. No guesses. No hallucinations.

**Every task follows this protocol. No exceptions.**

---

## 1. INTAKE & PARSING (Phase 1)

### 1.1 Request Reception

When a new request arrives:

1. **Acknowledge the request** explicitly
2. **Identify scope**: Single-step or multi-step?
3. **Extract all constraints**: Deadlines, dependencies, limitations
4. **Flag ambiguities**: Ask clarifying questions before proceeding

### 1.2 Request Analysis

Break down the request into atomic components:

```
REQUEST: "Implement feature X with Y requirements and Z considerations"

PARSED:
├─ Feature: X (define precisely)
├─ Requirements: Y (list all)
├─ Constraints: Z (enumerate)
├─ Success Criteria: How to verify completion?
├─ Dependencies: What must exist first?
└─ Risks: What could go wrong?
```

### 1.3 Scope Classification

**Simple Tasks** (< 5 min, single action):
- Single file edit
- Simple lookup
- Direct answer to question
- Skip detailed planning, execute immediately

**Complex Tasks** (≥ 5 min, multiple steps):
- Multi-file changes
- Architecture decisions
- Testing/validation required
- **MUST follow full batch protocol**

---

## 2. PLANNING PHASE (Phase 2)

### 2.1 TODO List Creation

**MANDATORY**: Create structured TODO list FIRST for all complex tasks.

Use `manage_todo_list` with this structure:

```typescript
{
  id: number,                    // Sequential 1,2,3...
  title: string,                 // 3-7 words, action-oriented
  description: string,           // What needs to happen + acceptance criteria
  status: "not-started" | "in-progress" | "completed",
  dependencies: number[],        // Task IDs this depends on
  parallelizable: boolean        // Can run with other tasks?
}
```

**Example**:
```
1. Understand current architecture
   - Read 3 key files
   - Map dependencies
   - Status: not-started
   - Dependencies: none
   - Parallelizable: no (blocks everything)

2. Design solution
   - Compare 2 approaches
   - Document pros/cons
   - Status: not-started
   - Dependencies: [1]
   - Parallelizable: no
```

### 2.2 Dependency Graph

Identify critical path:

```
Task 1 (research)
    ↓
Task 2 (design) ←─┐
    ↓              │ (can run in parallel)
Task 3 (implement)─┤
    ↓              │
Task 4 (test) ←───┘
```

### 2.3 Resource Allocation

For complex tasks (>30 min), plan concurrent execution:

```
PRIMARY WORKER (You):
- Orchestrates, makes decisions
- Handles synthesis and validation

RESEARCH WORKER:
- Searches codebase
- Reads files
- Collects information

IMPLEMENTATION WORKER:
- Writes code
- Makes changes
- Refactors

VALIDATION WORKER:
- Tests changes
- Runs linters
- Verifies patterns
```

---

## 3. DISCOVERY PHASE (Phase 3)

### 3.1 Information Gathering

Use tools to ground yourself in ACTUAL codebase state:

**Priority Order**:
1. `semantic_search` - Find patterns & examples
2. `grep_search` - Precise pattern matching
3. `file_search` - Locate related files
4. `read_file` - Get exact content
5. `run_in_terminal` - Execute verification commands

**Batch Your Searches**:
- Don't search multiple times for same pattern
- Run related searches in parallel when possible
- Consolidate results before proceeding

### 3.2 Pattern Validation

Before proposing changes:

1. **Find existing patterns** in the codebase
2. **Verify patterns work** (not just assumed)
3. **Check for exceptions** (edge cases, alternatives)
4. **Document findings** (reference files + line numbers)

### 3.3 Dependency Mapping

Create explicit map:
```
Your Change:  File A
    ↓
Depends On:  Files B, C, D
    ↓
Impact:      Files E, F (will these break?)
    ↓
Requires:    Update G, H, I
```

---

## 4. DESIGN PHASE (Phase 4)

### 4.1 Solution Architecture

Before writing code, document:

1. **What** changes will be made
2. **Where** changes will be made (file paths)
3. **Why** this approach (reasoning)
4. **How** implementation works (step by step)
5. **Risks** and mitigation strategies

### 4.2 Code Organization

Group changes by type:

```
NEW FILES:
├─ docs/SDK_GUIDE.md
└─ scripts/enhance-sdk.mjs

MODIFIED FILES:
├─ packages/api-framework/src/index.ts
├─ apps/web/app/api/_template/route.ts
└─ package.json

DELETED FILES:
└─ scripts/old-middleware.js
```

### 4.3 Validation Plan

Define success criteria BEFORE implementation:

```
Task: Implement batch endpoint handler

Success Criteria:
✓ TypeScript compilation passes
✓ All tests pass (unit + integration)
✓ Linting passes (eslint + prettier)
✓ Pattern validator passes (>90 score)
✓ Manual testing: Can handle 100 items
✓ Manual testing: Partial success on error
✓ Rate limiting applies correctly
✓ Documentation updated
```

---

## 5. IMPLEMENTATION PHASE (Phase 5)

### 5.1 Mark Tasks In-Progress

Before starting work:
```typescript
manage_todo_list({
  operation: "write",
  todoList: [
    { id: 1, status: "in-progress", /* ... */ }
  ]
});
```

**Only ONE task in-progress at a time** (focus).

### 5.2 Tool Usage Protocol

For EVERY tool call:

1. **State intent** - What you're about to do
2. **Execute tool** - Call the tool
3. **Analyze results** - What did you learn?
4. **Next step** - What do you do now?

**Example**:
```
INTENT: "Search for all rate-limit middleware patterns"

TOOL: grep_search({
  query: "rateLimit|rate_limit",
  includePattern: "**/*.ts"
})

RESULTS: Found 8 references in 4 files
- packages/api-framework/src/index.ts (3 refs)
- scripts/rate-limit.ts (2 refs)
- ...

NEXT: Read these files to understand current implementation
```

### 5.3 Batch File Operations

When making multiple edits:

```typescript
// ❌ WRONG: Multiple sequential calls
replace_string_in_file(file1, old, new);
replace_string_in_file(file2, old, new);
replace_string_in_file(file3, old, new);

// ✅ CORRECT: Single batch call
multi_replace_string_in_file({
  explanation: "...",
  replacements: [
    { filePath: file1, oldString: old, newString: new },
    { filePath: file2, oldString: old, newString: new },
    { filePath: file3, oldString: old, newString: new }
  ]
});
```

### 5.4 Mark Completed Immediately

As soon as each todo finishes:

```typescript
manage_todo_list({
  operation: "write",
  todoList: [
    { id: 1, status: "completed" },  // Just finished
    { id: 2, status: "in-progress" }, // Now working on this
    { id: 3, status: "not-started" }
  ]
});
```

**Don't batch completions** - mark immediately for visibility.

---

## 6. VALIDATION PHASE (Phase 6)

### 6.1 Compilation Check

```bash
pnpm typecheck
# If fails → STOP, fix errors, recheck
```

### 6.2 Linting & Formatting

```bash
pnpm lint
pnpm format
# If fails → Fix, recommit
```

### 6.3 Test Execution

```bash
pnpm test           # Unit tests
pnpm test:rules     # Firebase rules (if changed)
pnpm test:e2e       # E2E tests
# If ANY fail → STOP, debug, fix, retest
```

### 6.4 Pattern Validation

```bash
node scripts/validate-patterns.mjs
# If score < 90 → STOP, fix violations, revalidate
```

### 6.5 Manual Verification

Test the actual functionality:

```bash
# Start dev server
pnpm dev

# Test manually
curl -X POST http://localhost:3000/api/...
```

### 6.6 All-Green Check

Before committing, ALL must be green:

```
✅ TypeScript: 0 errors
✅ ESLint: 0 errors
✅ Prettier: No changes needed
✅ Pattern Score: ≥90
✅ Tests: All pass
✅ E2E: All pass
✅ Manual: Functionality works
```

If ANY red → Fix → Recheck.

---

## 7. DOCUMENTATION PHASE (Phase 7)

### 7.1 Code Comments

Add comments for:
- ✓ WHY (reasoning, not WHAT)
- ✓ Complex business logic
- ✓ Non-obvious decisions
- ✗ Obvious code (avoid over-commenting)

### 7.2 File Headers

Every source file needs header:

```typescript
// [P#][DOMAIN][CATEGORY] Description
// Tags: P#, DOMAIN, CATEGORY, additional-tags

// Where:
// P# = Priority (P0=critical, P1=important, P2=standard)
// DOMAIN = AUTH, API, UI, DB, TEST, etc.
// CATEGORY = CODE, SCHEMA, TEST, MIDDLEWARE, etc.
```

### 7.3 API Documentation

For public APIs:

```typescript
/**
 * Create a new organization endpoint.
 *
 * @param orgId - Organization ID
 * @param name - Organization name (1-100 chars)
 * @returns Created organization with ID
 * @throws BadRequestError if name invalid
 * @throws ConflictError if org already exists
 */
export async function createOrg(orgId: string, name: string) {
  // ...
}
```

### 7.4 CHANGELOG Entry

Update relevant changelog:

```markdown
## [Version] - YYYY-MM-DD

### Added
- New batch endpoint handler for bulk operations
- Request middleware chain support

### Fixed
- Rate limit calculation for org-scoped endpoints

### Changed
- SDK factory now validates org membership before auth
```

---

## 8. COMMIT & PUSH PHASE (Phase 8)

### 8.1 Commit Message Format

```
type(scope): short description (50 chars max)

Longer explanation if needed (wrap at 72 chars).

BREAKING CHANGE: if applicable
Closes: #issue-number
Related-To: #other-issue
```

**Types**: feat, fix, docs, refactor, test, chore  
**Scope**: feature area (api, sdk, ui, types, etc.)

### 8.2 Commit Atomicity

Each commit should:
- ✓ Represent ONE logical change
- ✓ Pass all validation (tests, lint, typecheck)
- ✓ Have clear message
- ✓ Be reversible independently

### 8.3 Multi-Branch Sync

If working with multiple branches:

```bash
git checkout main
git commit -m "feat: ..."
git push origin main

git checkout dev
git cherry-pick main
git push origin dev

git checkout docs-tests-logs
git cherry-pick main
git push origin docs-tests-logs
```

---

## 9. VERIFICATION PHASE (Phase 9)

### 9.1 Remote Validation

After push:

```bash
git log --oneline -5           # Verify commits pushed
git diff origin/main -- file   # Verify no differences
git show --stat                # Show what was changed
```

### 9.2 GitHub Actions

Check that:
- ✅ All workflows passed
- ✅ CodeQL scan completed
- ✅ Build succeeded
- ✅ Tests passed

### 9.3 Final Checklist

```
✅ Code compiles locally
✅ All tests pass
✅ Lint passes
✅ Pattern validator passes
✅ Commits pushed to all branches
✅ GitHub Actions green
✅ Changes documented
✅ CHANGELOG updated
✅ Ready for review/merge
```

---

## 10. ERROR PATTERN DETECTION (Phase 10)

### 10.1 Pattern Recognition

If same error occurs >3 times:

1. **First occurrence**: Fix it, document
2. **Second occurrence**: Note the pattern
3. **Third occurrence**: CREATE A SAFEGUARD

### 10.2 Safeguard Creation

Choose appropriate safeguard:

```
PATTERN: Forgetting org context in queries
SAFEGUARD: Add linting rule to catch "db.collection()" without orgId
IMPLEMENTATION: ESLint rule that flags this pattern
ENFORCEMENT: Pre-commit hook runs check
```

### 10.3 Safeguard Verification

Test that safeguard works:

```bash
# Introduce violation
git stash
# Make code with violation
# Try to commit
# Safeguard should block

# Undo
git stash pop
```

---

## 11. QUALITY GATES (Phase 11)

### 11.1 Pre-Commit Gates

Before committing, verify:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:rules
node scripts/validate-patterns.mjs
```

**All must pass**. If any fail, fix before committing.

### 11.2 Pre-Push Gates

Before pushing, verify:

```bash
git status --short              # No uncommitted changes
git log -1 --oneline            # Commit message clear
git push --dry-run              # Simulate push
```

### 11.3 Production Gates

In CI/CD, these auto-verify:
- Code scanning (CodeQL)
- Dependency audit (npm audit)
- Build verification
- Test execution
- Lint checking

---

## 12. TEAM PROTOCOLS

### 12.1 Communication

When working in team:

- **Status Updates**: Frequent, specific ("Working on task 2/5")
- **Blockers**: Immediate ("Blocked on response from X")
- **Questions**: Direct ("Does Y mean Z?")
- **Results**: Clear ("✅ Completed X with Y impact")

### 12.2 Code Review Preparation

Before requesting review:

```
I've implemented [feature] by:
1. Creating [file1, file2]
2. Modifying [file3, file4]
3. Adding tests in [file5]

Changes:
- [description of change 1]
- [description of change 2]

Testing:
- Local: ✅ All tests pass
- Coverage: [X]%
- Manual: [what was manually tested]

Validation:
- TypeScript: ✅
- Lint: ✅
- Tests: ✅
```

### 12.3 Review Response Protocol

When receiving feedback:

1. **Read carefully** - Understand the concern
2. **Respond** - Address each point
3. **Update** - Make changes or explain why not
4. **Request re-review** - Clearly signal ready
5. **Track** - Know what feedback was addressed

---

## 13. FAILURE RECOVERY

### 13.1 Rollback Protocol

If deployment fails:

```bash
git log --oneline -10
git revert [commit-hash]       # Create revert commit
git push origin main
# Monitors: Verify rollback deployed
```

### 13.2 Incident Response

If production issue:

1. **Immediate**: Rollback or disable feature
2. **Root cause**: Identify what failed
3. **Analysis**: Why didn't tests catch it?
4. **Fix**: Code fix + test fix
5. **Prevention**: Safeguard to prevent recurrence
6. **Postmortem**: Document lessons learned

### 13.3 Test Improvement

After any bug:

1. **Write test** that reproduces bug
2. **Verify test fails** without fix
3. **Apply fix**
4. **Verify test passes**
5. **Keep test** to prevent regression

---

## 14. BATCH PROTOCOL ENFORCEMENT

### 14.1 Self-Check

Before concluding any task, verify:

```
PLANNING:
  ✓ TODO list created
  ✓ Dependencies mapped
  ✓ Success criteria defined

DISCOVERY:
  ✓ Used tools to validate assumptions
  ✓ Found actual code examples
  ✓ Understood patterns

IMPLEMENTATION:
  ✓ Followed existing patterns
  ✓ Added appropriate comments
  ✓ Validated with tests

VALIDATION:
  ✓ TypeScript: ✅
  ✓ Lint: ✅
  ✓ Tests: ✅
  ✓ Manual: ✅

DOCUMENTATION:
  ✓ Code has proper headers
  ✓ API documentation complete
  ✓ CHANGELOG updated
  ✓ All commits clear

COMMIT:
  ✓ Commits atomic
  ✓ Messages clear
  ✓ Branches synced

VERIFICATION:
  ✓ Remote pushed successfully
  ✓ GitHub Actions green
  ✓ All checks passing
```

### 14.2 Protocol Violations

Never:
- ❌ Skip validation gates
- ❌ Commit without testing
- ❌ Push to multiple branches without verifying each
- ❌ Make changes based on assumptions (verify with tools)
- ❌ Leave incomplete work uncommitted
- ❌ Batch commit completions (mark immediately)
- ❌ Skip the planning phase on "simple" work
- ❌ Duplicate type definitions (use z.infer<>)

---

## 15. SCENARIO EXAMPLES

### Scenario 1: Simple One-File Edit

**Request**: "Fix typo in README.md"

**Process**:
1. Find file ✓
2. Locate typo ✓
3. Make edit ✓
4. Commit ✓
5. Push ✓

**Time**: 2 min  
**Batch Protocol**: Not required (simple task)

### Scenario 2: Add New API Endpoint

**Request**: "Create GET /api/schedules with auth, validation, rate limit"

**Process**:
1. TODO list (5 tasks)
2. Discovery: Read SDK, find patterns
3. Create schema in types/
4. Create route handler
5. Add tests
6. Validate all gates
7. Commit & push
8. Verify

**Time**: 30 min  
**Batch Protocol**: FULL enforcement required

### Scenario 3: Refactor Large Module

**Request**: "Refactor auth middleware for clarity + add new hook"

**Process**:
1. TODO list (8 tasks)
2. Research current pattern
3. Design new architecture
4. Refactor systematically
5. Add new hook
6. Update all usages
7. Add tests
8. Validate completely
9. Commit with clear messages
10. Verify

**Time**: 2 hours  
**Batch Protocol**: FULL + workers for parallel tasks

---

## 16. COMMAND REFERENCE

### Repository Management

```bash
git status                          # Check current state
git checkout -b feature/name        # Create feature branch
git add file1 file2                 # Stage changes
git commit -m "type(scope): msg"    # Commit
git push origin branch              # Push to remote
git cherry-pick commit-hash         # Apply commit to branch
```

### Validation

```bash
pnpm typecheck                      # TypeScript check
pnpm lint                           # ESLint check
pnpm format                         # Prettier format
pnpm test                           # Unit tests
pnpm test:rules                     # Firebase rules tests
node scripts/validate-patterns.mjs  # Pattern validation
```

### Development

```bash
pnpm install --frozen-lockfile      # Install deps
pnpm dev                            # Start dev server
pnpm build                          # Production build
pnpm clean                          # Clean build artifacts
```

---

## 17. SUMMARY

The Batch Protocol ensures:

✅ **Systematic Approach**: Every task planned, documented, validated  
✅ **Zero Guessing**: All assumptions verified with tools  
✅ **Quality Assurance**: All validation gates pass  
✅ **Clear Communication**: Status, blockers, results  
✅ **Production Ready**: Safe, tested, documented code  
✅ **Maintainability**: Future devs understand decisions  
✅ **Error Prevention**: Patterns caught, safeguards created  
✅ **Team Alignment**: Everyone follows same process  

**This is not a style guide. This is how we work.**

---

## 18. GOVERNANCE

**Authority**: Sr Dev Directive + Production Development Directive  
**Enforcement**: Pre-commit hooks + CI/CD pipelines  
**Violations**: Will block commits and merges  
**Reviews**: Updated based on observed patterns (error > 3x = safeguard)  
**Status**: ACTIVE as of December 7, 2025  

---

**This protocol is BINDING for all code changes in this repository.**

**Questions or clarifications? Update this document. No tribal knowledge.**

---

**Last Updated**: December 7, 2025  
**Maintainer**: AI Agent Infrastructure  
**Version**: 2.0.0 - Official Production Release
