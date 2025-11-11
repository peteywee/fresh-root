# TODO — v14 Onboarding Freeze & Block 3 Tasks

## 📋 Overview

This document tracks implementation tasks for **v14 onboarding freeze** (Block 3) and ongoing fixes to close out PR #63 review items.

---

## ✅ v14 Block 3 — Remaining Tasks & Freeze Checklist

### API Endpoints

- [x] ONB-01 Verify Eligibility (API uses shared role list + rate-limit)
- [x] ONB-02 Admin Responsibility Form (API + Tax ID stub)
- [x] ONB-03 Create Network + Org (API w/ events + markOnboardingComplete)
- [x] ONB-04 Create Network + Corporate (API w/ events + markOnboardingComplete)
- [x] ONB-05 Activate Network (API admin-only flip pending → active)
- [ ] ONB-06 Join with Token (API w/ membership update + events)

### Frontend Pages

- [ ] Minimal Onboarding Wizard pages
  - [ ] Profile → Intent → Admin Form → Network Create/Join
  - [ ] Routing guards and state transitions
  - [ ] Error boundaries and loading states

### Testing & CI

- [ ] Unit + Integration Tests for all ONB APIs
  - [ ] Eligibility endpoint
  - [ ] Admin form submission
  - [ ] Network + Org creation
  - [ ] Join with token flow
- [ ] CI green (typecheck + rules + tests)
  - [ ] GitHub Actions passing
  - [ ] Rules tests (Firestore/Storage) passing
  - [ ] E2E tests ready for main branch

### Documentation

- [ ] Event types documentation (events.ts)
- [ ] Onboarding flow diagram (overview)
- [ ] API endpoint reference (request/response examples)

---

## 🔧 Phase 2 Fixes (PR #63 Review)

These items address feedback from automated code reviewers on PR #63.

### Type Safety & Schema Consistency

- [ ] Restore Zod-first pattern consistency
  - [ ] Ensure all request/response types are Zod schemas
  - [ ] Export Zod inferred types alongside schemas
  - [ ] Type API route request params from URL

- [ ] Type API request parameters properly
  - [ ] `apps/web/app/api/onboarding/[routes]/route.ts`
  - [ ] Use context.params types
  - [ ] Validate path params with Zod

- [ ] Remove unnecessary `any` casts
  - Review onboarding pages and helpers
  - Replace with proper type inference where possible
  - Keep explicit `/* eslint-disable */` only where necessary

### Rate-Limiting & Security

- [ ] Refactor rate-limiting logic
  - [ ] Move inline checks to shared middleware
  - [ ] Apply consistent rate limit across all ONB endpoints
  - [ ] Document rate limits in API specs

### Code Quality

- [ ] Code cleanup
  - [ ] Remove debug logging (keep only `reqLogger` calls)
  - [ ] Consolidate error handling patterns
  - [ ] Ensure all routes have JSDoc headers

---

## 📊 Definition of Done for Block 3

✅ **All onboarding routes emit events via `logEvent`**  
✅ **All Firestore docs validate against v14 schemas**  
✅ **`users/{uid}.onboarding` is sole source of truth**  
✅ **Event log operational and visible in emulator**  
**[] CI pipeline fully green**

---

## 🧪 Testing Checklist

- [ ] Unit tests for all onboarding APIs (Vitest)
- [ ] Firestore rules tests (Jest with rules SDK)
- [ ] Onboarding happy-path E2E (Playwright)
- [ ] Manual emulator testing (create-org, create-corporate, join-with-token flows)
- [ ] TypeScript compilation without errors
- [ ] ESLint passes with ≤24 warnings (all "Unexpected any")

---

## 🚀 Ready to Merge Criteria

- [ ] All tasks in v14 Block 3 checklist complete
- [ ] Phase 2 fixes incorporated
- [ ] CI green: `pnpm typecheck && pnpm lint && pnpm test`
- [ ] No merge conflicts with main
- [ ] Code review approval (human)
- [ ] All events fire and log correctly in emulator

---

## 📝 Notes

- **Event types**: `packages/types/src/events.ts`
- **Event logger**: `apps/web/src/lib/eventLog.ts`
- **Onboarding state**: `users/{uid}.onboarding` doc
- **Helper**: `markOnboardingComplete()` from `apps/web/src/lib/userOnboarding.ts`
- **Copilot rules**: `.vscode/copilot-rules.md`
- **File snippet**: `.vscode/snippets/typescript.json` (type `fsdoc` + Tab)

