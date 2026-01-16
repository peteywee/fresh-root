---
title: "Fast Track to Production"
description: "Accelerated guide for deploying the application to production"
keywords:
  - deployment
  - production
  - fast-track
  - launch
category: "guide"
status: "active"
audience:
  - operators
  - developers
related-docs:
  - DEPLOYMENT.md
  - ../reference/PRODUCTION_READINESS.md
---

# Fast Track to Production - Optimized Execution Plan
**Created**: 2025-12-23 **Current Progress**: 27/45 tasks (60%) - E2E test complete! **Target**:
Production deployment in 2.5 hours **Strategy**: Focus on blockers, skip non-critical work

---

## Executive Summary
**What's Actually Done:** ✅ All core features implemented (Phases 0-4) ✅ API routes using
Firestore ✅ Auth, data persistence, UX complete ✅ Security patterns validated (130/90 score!)

**What's Actually Blocking Production:**

1. ✅ E2E golden path test (4h) - **COMPLETE** ✨
2. 🔶 Performance audit (1h) - **NEXT**
3. 🔶 Accessibility audit (0.5h) - **NEXT**
4. 🔶 Staging deployment verification (1h) - **NEXT**

**What Can Be Skipped/Deferred:**

- ⏭️ E1-E4: `any` types - Only 25 occurrences, mostly in tests/mocks (SAFE)
- ⏭️ E5: Error logging - Already exists in all routes (DONE)
- ✅ E6: BatchOperationSchema - Already exists
- ✅ E7: BackupRequestSchema - Already exists
- ⏭️ E8: Firebase typed wrappers - Already using typed wrappers
- ⏭️ F3: File upload - Not MVP critical
- 🔶 F6: ARIA labels - Quick audit needed but non-blocking
- ⏭️ F7: Route prefetching - Already done

---

## Revised Task List (6.5 hours → 2.5 hours)
### ✅ Task 1: E2E Golden Path Test - **COMPLETE**
**Status**: Done (PR #xxx, commit 3014640)

**What Was Implemented**:

- Created [e2e/golden-path.spec.ts](../e2e/golden-path.spec.ts) with 6 passing tests
- Configured [playwright.config.ts](../playwright.config.ts) with baseURL and webServer
- Tests cover: homepage, login, onboarding, schedules builder, error handling
- All tests passing in Chromium (6/6 ✅)

**Test Coverage**:

1. Homepage loads and shows navigation ✅
2. Can navigate to login page ✅
3. Can navigate to onboarding ✅
4. Schedules builder page loads ✅
5. Handles missing routes gracefully ✅
6. API returns proper status codes ✅

**Time Spent**: 2h actual (vs 4h estimated)

---

### 🎯 Critical Path (Remaining)
#### Task 2: Performance Audit (1h) - **NEXT UP**
**Why Important**: Verifies app is production-ready for users

**Steps**:

1. Build production bundle: `pnpm build`
2. Run Lighthouse CI on key pages:
   - `/` (landing)
   - `/signin` (auth)
   - `/app/dashboard` (main app)
   - `/app/schedules` (core feature)
1. Target: ≥90 all categories (Performance, Accessibility, Best Practices, SEO)

**Acceptance**:

- \[ ] Performance ≥90
- \[ ] Accessibility ≥90
- \[ ] Best Practices ≥90
- \[ ] SEO ≥80 (acceptable for app)

---

#### Task 3: ARIA Quick Audit (0.5h)
**Why Important**: Ensures basic accessibility compliance

**Steps**:

1. Run axe DevTools on key pages
2. Fix critical/serious issues only
3. Document minor issues for backlog

**Acceptance**:

- \[ ] 0 critical violations
- \[ ] 0 serious violations
- \[ ] Minor violations documented

---

#### Task 4: Deploy to Staging (1h)
**Why Important**: Verifies deployment process works (Vercel OR Cloudflare)

##### Option A: Vercel Deployment (Recommended)
1. Test local production build first:

   ```bash
   pnpm --filter web build
   pnpm --filter web start
   ```

1. Push to GitHub - Vercel auto-deploys preview on PR

1. Configure environment variables in Vercel dashboard:
   - All `NEXT_PUBLIC_*` vars from `.env.local`
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64` secret

1. Verify deployment at preview URL

##### Option B: Cloudflare Pages (Alternative)
1. Build locally to verify:

   ```bash
   pnpm --filter web build
   ```

1. Deploy via Wrangler:

   ```bash
   pnpm wrangler pages deploy apps/web/.next/standalone --project-name fresh-schedules
   ```

1. Configure secrets in Cloudflare dashboard

1. Verify at `*.pages.dev` URL

**Common Build Issues & Fixes**:

| Issue                           | Platform   | Fix                                                                              |
| ------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| `Dynamic server usage: cookies` | Both       | Expected - pages use cookies (not static) ✅                                     |
| OpenTelemetry warnings          | Both       | Non-blocking warnings (safe to ignore) ✅                                        |
| `outputFileTracingRoot` warning | Vercel     | Add to `next.config.js`: `outputFileTracingRoot: path.join(__dirname, '../../')` |
| `process.exit` not supported    | Cloudflare | Comment out in `instrumentation.ts` for edge runtime                             |
| Firebase Admin SDK              | Cloudflare | Use REST API instead of Admin SDK                                                |
| Missing env vars                | Both       | Copy from `.env.local`, add to platform dashboard                                |

**Acceptance**:

- \[ ] Local production build succeeds
- \[ ] Staging URL accessible (Vercel OR Cloudflare)
- \[ ] Firebase connected
- \[ ] Homepage loads
- \[ ] Login page loads
- \[ ] No critical errors in browser console

---

### 🔧 Optional Improvements (If Time Permits)
#### Task 5: Clean Up `any` Types (1h) - **LOW PRIORITY**
**Current State**: 25 occurrences, mostly in:

- Test files (mocks, fixtures) - SAFE TO IGNORE
- Error handling `catch (err: any)` - COMMON PATTERN
- Middleware context types - 3 occurrences

**Action**: Only fix the 3 middleware context types if time permits

**Acceptance**:

- \[ ] Middleware context properly typed
- \[ ] Other `any` types documented as acceptable

---

## Execution Timeline (2.5 hours remaining)
```text
✅ Hour 0-2:   E2E Golden Path Test (Task 1) - COMPLETE
            └─ Created golden-path.spec.ts with 6 passing tests
            └─ Configured Playwright with auto dev server
            └─ All tests passing in Chromium

⏭️ Hour 2-3:   Performance Audit (Task 2) - NEXT
            └─ Build production
            └─ Run Lighthouse
            └─ Fix any critical perf issues

⏭️ Hour 3-3.5: ARIA Audit (Task 3)
            └─ Run axe DevTools
            └─ Fix critical violations

⏭️ Hour 3.5-4.5: Deploy Staging (Task 4)
            └─ Try Vercel first (auto-deploy from GitHub)
            └─ Fallback to Cloudflare if Vercel fails
            └─ Configure Firebase env vars
            └─ Verify homepage + login work

DONE: Ready for production! 🚀
```

---

## Deployment Troubleshooting Guide
### Pre-Deployment Checklist
✅ Local build succeeds: `pnpm --filter web build`\
✅ All tests pass: `pnpm test`\
✅ E2E tests pass: `pnpm playwright test`\
✅ TypeScript clean: `pnpm typecheck`\
✅ Linting clean: `pnpm lint`

### Vercel Deployment Issues
**Issue**: Build fails with "Dynamic server usage"\
**Solution**: This is expected! Pages using `cookies()` can't be static. ✅ Normal behavior.

**Issue**: "outputFileTracingRoot" warning\
**Solution**: Add to `apps/web/next.config.js`:

```javascript
outputFileTracingRoot: path.join(__dirname, "../../");
```

**Issue**: Missing environment variables\
**Solution**: Add all vars from `.env.local` to Vercel project settings → Environment Variables

**Issue**: Firebase Admin SDK not working\
**Solution**: Ensure `GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64` is set in Vercel secrets

### Cloudflare Pages Issues
**Issue**: `process.exit` not supported in edge runtime\
**Solution**: Wrap in check:

```typescript
if (typeof process !== "undefined" && process.exit) {
  process.exit(1);
}
```

**Issue**: Firebase Admin SDK doesn't work\
**Solution**: Use Firebase REST API instead (Cloudflare Edge doesn't support Node.js APIs)

**Issue**: Build output not compatible\
**Solution**: Ensure `output: 'standalone'` in `next.config.js`

### Firebase Configuration
Required environment variables for both platforms:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
FIREBASE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64=
```

### Quick Deployment Test
Test deployment works before committing:

```bash
# Test Vercel locally
pnpm i -g vercel
vercel --prod=false

# Test Cloudflare locally
pnpm wrangler pages dev apps/web/.next
```

---

## What We're NOT Doing (And Why It's OK)
### Deferred Type Safety Work
- **E1-E4: Remove `any` types**
  - Only 25 occurrences, 20+ are in test files
  - Middleware context types (3) are acceptable with proper JSDoc
  - **Impact**: None - doesn't affect production code quality

- **E5: Add structured error logging**
  - Already exists! All routes have try/catch with proper error returns
  - Verified by pattern validator (130/90 score)
  - **Impact**: None - already implemented

- **E6-E8: Schema consolidation**
  - BatchOperationSchema: ✅ EXISTS
  - BackupRequestSchema: ✅ EXISTS
  - Firebase wrappers: ✅ USING typed wrappers already
  - **Impact**: None - already done

### Deferred Features
- **F3: File upload**
  - Not critical for MVP
  - Can add post-launch
  - **Impact**: None - users can still create schedules

- **F6: ARIA labels**
  - Will do quick audit (0.5h)
  - Minor violations acceptable for v1
  - **Impact**: Low - basic accessibility already present

---

## Success Criteria (Gate 7 - Production Ready)
### Must Pass
- \[x] All API routes using Firestore ✅
- \[x] Auth flow works ✅
- \[x] Data persistence verified ✅
- \[x] Pattern validation ≥90 ✅ (130/90!)
- \[x] TypeScript compiles ✅
- \[x] ESLint passes ✅
- \[ ] E2E golden path passes ⏳
- \[ ] Lighthouse ≥90 (Performance, A11y, BP) ⏳
- \[ ] Staging deployment verified ⏳
- \[ ] No critical accessibility violations ⏳

### Nice to Have (Can Defer)
- \[ ] Zero `any` types (currently 25, mostly tests)
- \[ ] 100% test coverage (currently ~60%)
- \[ ] All ARIA labels perfect
- \[ ] File upload feature

---

## Risk Assessment
| Risk                     | Probability | Impact | Mitigation                                |
| ------------------------ | ----------- | ------ | ----------------------------------------- |
| E2E test flaky           | Medium      | High   | Use deterministic test data, proper waits |
| Performance issues       | Low         | Medium | Already optimized, using production build |
| Staging deploy fails     | Low         | High   | Use Vercel preview (reliable)             |
| Accessibility violations | Low         | Low    | Quick audit catches critical issues       |

---

## Decision Log
**Why skip E1-E5 (Type Safety)?**

- Audit shows work is already done or non-critical
- Pattern validator shows excellent code quality (130/90)
- Only 25 `any` types, mostly in test files
- Would take 9 hours for minimal production impact

**Why skip F3 (File upload)?**

- Not in critical path for scheduling MVP
- Users can add shifts manually
- Can ship post-launch

**Why focus on E2E + Performance + Staging?**

- These are the only blockers to production
- E2E verifies end-to-end functionality
- Performance ensures good UX
- Staging verifies deployment works

---

## Next Steps
1. **Start with E2E test** (Task 1) - 4 hours
   - This is the biggest blocker
   - Will catch any integration issues

1. **Run performance audit** (Task 2) - 1 hour
   - Quick validation of production readiness

1. **Quick ARIA check** (Task 3) - 0.5 hour
   - Catch any critical accessibility issues

1. **Deploy to staging** (Task 4) - 1 hour
   - Verify deployment process

1. **🚀 Ship to production!**

---

**Total Time to Production**: ~6.5 hours **Confidence Level**: 95% (high-quality work already done)
**Risk Level**: Low (focusing on verification, not new features)
