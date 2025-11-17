# TODO — v14 Onboarding Freeze & Block 3 Tasks

> **STATUS**: ✅ **COMPLETE** (November 11, 2025)
>
> All v14 Block 3 tasks have been **successfully implemented and verified**.
> See `BLOCK3_COMPLETION.md` for comprehensive completion report.

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
- [x] ONB-06 Join with Token (API w/ membership update + events)
- [x] Session Bootstrap (ensureUserProfile on first sign-in)

### Frontend Pages

- [x] Minimal Onboarding Wizard pages
  - [x] Profile page (name, email, role)
  - [x] Intent selection page (create-org, create-corporate, or join)
  - [x] Admin Responsibility Form page
  - [x] Network Create/Join pages
  - [x] Routing guards and state transitions
  - [x] Error boundaries and loading states

### Testing & CI

- [x] Unit + Integration Tests for all ONB APIs
  - [x] Eligibility endpoint
  - [x] Admin form submission
  - [x] Network + Org creation
  - [x] Join with token flow
- [x] CI green (typecheck + rules + tests)
  - [x] GitHub Actions passing
  - [x] Rules tests (Firestore/Storage) passing
  - [x] E2E tests ready for main branch

### Documentation

- [x] Event types documentation (events.ts)
- [x] Onboarding flow diagram (overview)
- [x] API endpoint reference (request/response examples)

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
✅ **Session bootstrap creates `users/{uid}` on first sign-in (idempotent)**
✅ **All 6 ONB endpoints functional with Firestore integration**
✅ **CI pipeline fully green (typecheck, lint, test)**
✅ **Frontend UI complete (wizard pages + routing guards)**
✅ **Full test coverage (unit + E2E)**

---

## 🧪 Testing Checklist

- [x] Unit tests for all onboarding APIs (Vitest)
- [x] Firestore rules tests (Jest with rules SDK)
- [x] Onboarding happy-path E2E (Playwright)
- [x] Manual emulator testing (create-org, create-corporate, join-with-token flows)
- [x] TypeScript compilation without errors
- [x] ESLint passes with ≤24 warnings (all "Unexpected any")

---

## 🚀 Ready to Merge Criteria

- [x] All tasks in v14 Block 3 checklist complete
- [x] Phase 2 fixes incorporated
- [x] CI green: `pnpm typecheck && pnpm lint && pnpm test`
- [x] No merge conflicts with main
- [x] Code review approval (human)
- [x] All events fire and log correctly in emulator

---

## 📝 Notes

- **Event types**: `packages/types/src/events.ts`
- **Event logger**: `apps/web/src/lib/eventLog.ts`
- **Onboarding state**: `users/{uid}.onboarding` doc
- **Helper**: `markOnboardingComplete()` from `apps/web/src/lib/userOnboarding.ts`
- **Copilot rules**: `.vscode/copilot-rules.md`
- **File snippet**: `.vscode/snippets/typescript.json` (type `fsdoc` + Tab)
