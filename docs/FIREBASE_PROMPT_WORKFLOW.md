---

title: Firebase Modernization Prompt Workflow
description: Coordinated use of GitHub Copilot prompts to modernize Firebase typing in fresh-root
date: 2025-12-02
## status: Active

# Firebase Modernization Prompt Workflow
## Context
Fresh-root is a production TypeScript/Next.js monorepo (9 packages) with enterprise scheduling application.
Current lint status: 379 errors in apps/web due to Firebase SDK v12 `any` typing limitations.

**Background process:** `pnpm lint --fix` running in background to handle no-unused-vars auto-fixes

---

## Prompt Usage Sequence
### 1️⃣ GitHub Copilot Starter (Setup & Standards)
**Purpose:** Establish baseline Copilot configuration for monorepo pattern

**What It Does:**

- Analyzes tech stack (TypeScript, Next.js, Firebase, monorepo)
- Creates/updates `.github/copilot-instructions.md`
- Suggests instruction files for language-specific patterns
- Recommends prompt templates for team workflows

**When to Run:** NOW (foundational)

**Input to Provide:**

```
Tech Stack: TypeScript, Next.js 16, Firebase 12/13, pnpm monorepo
Project Type: Enterprise PWA - Staff Scheduling
Team Size: Small team with multiple packages
Development Style: Strict standards (ESLint, TypeScript strict mode)
```

**Expected Outcome:** Copilot setup guidance tailored to monorepo

---

### 2️⃣ Create Implementation Plan (Strategy Definition)
**Purpose:** Define detailed Firebase typing modernization implementation plan

**What It Does:**

- Breaks down Firebase typing issues into actionable tasks
- Creates step-by-step implementation roadmap
- Identifies dependencies and risk areas
- Generates acceptance criteria for each phase

**When to Run:** AFTER Step 1 (use established Copilot context)

**Input to Provide:**

```
Feature: Firebase SDK v12 Typing Modernization

Current State:
- 379 lint errors in apps/web (195 Firebase-related unsafe-* errors)
- 40+ files using getFirestore(), snap.data(), getAuth() untyped APIs
- ESLint rules: no-unsafe-assignment, no-unsafe-member-access, no-unsafe-call

Desired Outcome:
- Reduce errors from 379 to <200 (>50% reduction)
- Pragmatic type safety for Firebase APIs
- Maintain production stability

Constraints:
- Firebase SDK lacks comprehensive TypeScript definitions
- Cannot modify Firebase SDK itself
- Team bandwidth: low (background automation preferred)
```

**Expected Outcome:** Phased implementation plan with milestones

---

### 3️⃣ Review and Refactor (Code Modernization)
**Purpose:** Systematically refactor Firebase code to reduce unsafe-\* errors

**What It Does:**

- Analyzes patterns in Firebase API usage
- Suggests refactoring approaches
- Identifies opportunities for wrapper functions
- Proposes type-safe abstractions

**When to Run:** AFTER Step 2 (with implementation plan from Step 1)

**Input to Provide:**

```
Files to Review:
- apps/web/src/lib/userProfile.ts (snap.data() usage)
- apps/web/src/lib/userOnboarding.ts (Firebase auth patterns)
- apps/web/app/api/**/*.ts (40+ route handlers with Firebase APIs)

Refactoring Goals:
1. Create typed wrappers for common Firebase operations
2. Use proper TypeScript generics for snapshot data
3. Reduce `any` type propagation to downstream code

Code Quality Standards:
- Type-safe where possible
- Performance-neutral changes only
- No breaking changes to public APIs
```

**Expected Outcome:** Refactored code with better type safety

---

### 4️⃣ Documentation Writer (Standards & Patterns)
**Purpose:** Document Firebase patterns and typing best practices for team

**What It Does:**

- Creates how-to guides for Firebase usage patterns
- Documents type-safe wrappers
- Provides reference implementation examples
- Creates team standards document

**When to Run:** AFTER Step 3 (after refactoring is complete)

**Input to Provide:**

```
Topic: Firebase SDK v12 Type-Safe Usage Patterns

Audience: TypeScript developers in monorepo

Key Patterns to Document:
1. Type-safe document snapshot handling
2. Auth state management without `any`
3. Error handling for Firebase operations
4. Testing Firebase code with proper types

Framework: Diátaxis (tutorials, how-tos, references, explanations)

Output:
- How to: Safely access document data
- Reference: Firebase wrapper functions
- Explanation: Why `any` types are limiting
- Tutorial: Creating type-safe Firebase modules
```

**Expected Outcome:** Team-ready documentation with patterns and examples

---

### 5️⃣ Memory Keeper (Team Learnings)
**Purpose:** Store Firebase modernization learnings for team reuse

**What It Does:**

- Captures key learnings from modernization effort
- Documents Firebase SDK limitations and workarounds
- Records monorepo-specific patterns
- Creates searchable knowledge base

**When to Run:** AFTER Step 4 (final phase)

**Input to Provide:**

```
Learnings to Store:

1. Firebase SDK v12 `any` typing limitations
   - Impact: 195 unsafe-* ESLint errors
   - Workaround: Type-safe wrapper functions
   - Future: Monitor firebase/firebase-js-sdk#7598

1. Monorepo Firebase patterns
   - Shared Firebase utilities in packages/
   - API route Firebase access patterns
   - Type definitions for custom Firebase types

1. ESLint configuration for Firebase
   - Selective suppression of unsafe-* rules
   - Files: app/api/**, src/lib/**, lib/**

1. Type-safe refactoring techniques
   - Wrapper functions approach
   - Generic type parameters
   - Error boundary patterns
```

**Expected Outcome:** Documented team knowledge for future reference

---

## Execution Checklist
### Pre-Execution
- \[x] Background process running (pnpm lint --fix)
- \[x] Firebase typing strategy documented
- \[x] Prompts downloaded to `.github/prompts/`
- \[x] Repository context analyzed

### Step 1: GitHub Copilot Starter
- \[ ] Open prompt: `/github-copilot-starter`
- \[ ] Provide tech stack information
- \[ ] Review suggested copilot-instructions.md
- \[ ] Apply recommendations to repository

### Step 2: Create Implementation Plan
- \[ ] Open prompt: `/create-implementation-plan`
- \[ ] Provide Firebase modernization context
- \[ ] Review generated implementation plan
- \[ ] Extract actionable milestones

### Step 3: Review and Refactor
- \[ ] Open prompt: `/review-and-refactor`
- \[ ] Select Firebase files from app/api/ and src/lib/
- \[ ] Review proposed refactorings
- \[ ] Apply type-safe improvements

### Step 4: Documentation Writer
- \[ ] Open prompt: `/documentation-writer`
- \[ ] Specify Firebase patterns topic
- \[ ] Generate team-ready documentation
- \[ ] Add to docs/ folder

### Step 5: Memory Keeper
- \[ ] Open prompt: `/remember`
- \[ ] Provide learnings from modernization
- \[ ] Store in memory instructions
- \[ ] Reference in team communications

### Post-Execution
- \[ ] Monitor background lint process completion
- \[ ] Verify error count reduction (379 → <200)
- \[ ] Confirm 5/6 packages passing
- \[ ] Update project documentation

---

## Success Metrics
**Lint Errors:**

- ✅ Before: 379 errors
- 🎯 Target: <200 errors (>50% reduction)
- 📊 Phases: Phase 1 (195 suppressed) + Phase 2 (40 auto-fixed) + Phase 3 (30+ manual)

**Code Quality:**

- ✅ 5/6 packages passing eslint
- ✅ No new type errors introduced
- ✅ Firebase APIs used safely

**Team Enablement:**

- ✅ Copilot instructions established
- ✅ Implementation plan documented
- ✅ Type-safe patterns documented
- ✅ Team learnings captured

---

## Timeline
- **Now:** Background lint process running
- **+0-5 min:** Confirm background process progress
- **+5-15 min:** Run Step 1 (GitHub Copilot Starter)
- **+15-30 min:** Run Step 2 (Create Implementation Plan)
- **+30-60 min:** Run Step 3 (Review and Refactor)
- **+60-90 min:** Run Step 4 (Documentation Writer)
- **+90-120 min:** Run Step 5 (Memory Keeper)
- **+120+ min:** Verify final lint status

---

## Resources
- **Prompts Location:** `.github/prompts/`
- **Strategy Doc:** `docs/FIREBASE_TYPING_STRATEGY.md`
- **Background Log:** `/tmp/firebase-modernization.log`
- **ESLint Config:** `apps/web/eslint.config.mjs`
- **Firebase Files:** `apps/web/src/lib/`, `apps/web/app/api/`
