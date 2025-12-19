# Wave Execution Plan - Hybrid Optimal Strategy

**Created**: 2025-12-18
**Strategy**: Plan 10 - Hybrid Optimal (Score: 37/40)
**Remaining Tasks**: 32/45
**Estimated Time Savings**: 60% vs sequential

---

## Team Structure & Assignments

### 🔷 Team Alpha-1 (Backend Senior)
**Role**: Core API Firestore migrations
**Skills**: Firestore Admin SDK, API design, data modeling
**Wave 1 Responsibility**: D1, D2, D5, D6 (4 tasks)

#### D1: Migrate attendance API to Firestore
- **File**: `apps/web/app/api/orgs/[orgId]/attendance/route.ts`
- **Action**: Replace mock data with Firestore reads/writes
- **Collection**: `attendance_records/{orgId}/records/{recordId}`
- **Accept**: GET/POST/PUT/DELETE all work with Firestore

#### D2: Migrate positions API to Firestore
- **File**: `apps/web/app/api/orgs/[orgId]/positions/route.ts`
- **Action**: Replace mock data with Firestore reads/writes
- **Collection**: `positions/{orgId}/positions/{positionId}`
- **Accept**: CRUD operations persist to Firestore

#### D5: Migrate venues API to Firestore
- **File**: `apps/web/app/api/orgs/[orgId]/venues/route.ts`
- **Action**: Replace mock data with Firestore reads/writes
- **Collection**: `venues/{orgId}/venues/{venueId}`
- **Accept**: CRUD operations persist to Firestore

#### D6: Migrate zones API to Firestore
- **File**: `apps/web/app/api/orgs/[orgId]/zones/route.ts`
- **Action**: Replace mock data with Firestore reads/writes
- **Collection**: `zones/{orgId}/zones/{zoneId}`
- **Accept**: CRUD operations persist to Firestore

---

### 🔶 Team Alpha-2 (Backend Mid)
**Role**: Secondary API Firestore migrations
**Skills**: Firestore Admin SDK, nested collections
**Wave 1 Responsibility**: D3, D4, D7, D8 (4 tasks)

#### D3: Migrate schedules API to Firestore
- **File**: `apps/web/app/api/orgs/[orgId]/schedules/route.ts`
- **Action**: Replace mock data with Firestore reads/writes
- **Collection**: `schedules/{orgId}/schedules/{scheduleId}`
- **Accept**: CRUD operations persist to Firestore

#### D4: Migrate shifts API to Firestore
- **File**: `apps/web/app/api/orgs/[orgId]/schedules/[scheduleId]/shifts/route.ts`
- **Action**: Replace mock data with Firestore reads/writes
- **Collection**: `shifts/{orgId}/shifts/{shiftId}` (denormalized)
- **Accept**: CRUD operations persist to Firestore

#### D7: Migrate widgets API to Firestore
- **File**: `apps/web/app/api/widgets/route.ts`
- **Action**: Replace mock data with Firestore reads/writes
- **Collection**: `widgets/{widgetId}`
- **Accept**: CRUD operations persist to Firestore

#### D8: Migrate user profile API to Firestore
- **File**: `apps/web/app/api/users/[uid]/route.ts`
- **Action**: Replace mock data with Firestore reads/writes
- **Collection**: `users/{uid}`
- **Accept**: Profile data persists to Firestore

---

### 🔵 Team Bravo (Frontend)
**Role**: UX shell and navigation
**Skills**: React, Next.js, client components
**Wave 1 Responsibility**: C1, C2, C4, C5 (4 tasks)

#### C1: Create Header component with logout
- **File**: `apps/web/src/components/Header.tsx` (CREATE NEW)
- **Action**: Build header with user menu + logout button
- **Accept**: Clicking logout calls `signOut()` and redirects to `/login`

#### C2: Create Sidebar navigation
- **File**: `apps/web/src/components/Sidebar.tsx` (CREATE NEW)
- **Action**: Build sidebar with links to all `/app/*` routes
- **Accept**: All routes clickable, active state highlights current route

#### C4: Wire OrgContext to cookie
- **File**: `apps/web/src/lib/org-context.tsx`
- **Action**: Read `orgId` from cookie in `OrgProvider`
- **Accept**: `useOrg()` returns orgId from cookie in `/app/*` routes

#### C5: Fix Content Security Policy
- **File**: `next.config.js`
- **Action**: Add CSP headers to allow Firebase SDK
- **Accept**: Zero CSP errors in browser console

---

### 🟣 Team Charlie (Quality)
**Role**: Type safety and cleanup
**Skills**: TypeScript, static analysis
**Wave 1 Responsibility**: E1-E4 (4 tasks grouped)

#### E1-E4: Remove any types from identified files
- **Action**: Find all `any` types in codebase, replace with proper types
- **Files**: TBD (search for `any` type usage)
- **Accept**: No `any` types in identified files

---

## Wave 1 Execution Flow

### Pre-Wave Setup
```bash
# Create wave-1 feature branch
git checkout -b feature/wave-1-hybrid

# Pre-read all target files to reduce context switching
# (This will be done automatically by parallel agents)
```

### Parallel Execution
```bash
# Launch 4 parallel task groups (agents work simultaneously)
# Each agent will:
# 1. Read target files
# 2. Implement changes
# 3. Self-validate locally
# 4. Report completion

Alpha-1: D1, D2, D5, D6 (parallel)
Alpha-2: D3, D4, D7, D8 (parallel)
Bravo:   C1, C2, C4, C5 (parallel)
Charlie: E1-E4 (sequential within group)
```

### Post-Wave Validation
```bash
# Single validation run after ALL tasks complete
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

### Checkpoint Commit
```bash
# Single atomic commit for entire wave
git add -A
git commit -m "feat(wave-1): Complete API migrations + UX shell + type cleanup

- D1-D8: All API routes migrated to Firestore
- C1, C2, C4, C5: UX shell components complete
- E1-E4: Type safety cleanup

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Merge to dev and push
git checkout dev
git merge feature/wave-1-hybrid --no-edit
git push origin dev feature/wave-1-hybrid
```

---

## Wave 2 Execution (Depends on Wave 1)

### Tasks
- **C3**: Profile page (needs D8 user API)
- **E5-E8**: Schema creation (needs all D* APIs)
- **F1**: Publish schedule (needs D3 schedules API)
- **F2**: Schedule builder (needs C2 sidebar, D3 schedules)

### Dependency Graph
```
Wave 1 Complete
├─→ C3 (requires D8)
├─→ E5-E8 (requires D1-D8)
├─→ F1 (requires D3)
└─→ F2 (requires C2, D3)
```

---

## Wave 3 Execution (Polish)

### Tasks
- F3: File upload
- F4: Loading states
- F5: Error boundaries
- F6: ARIA labels
- F7: Route prefetching
- F8: E2E golden path test
- QA1: Deploy staging
- QA2: Run E2E against staging

---

## Wave 4 Execution (Final)

### Tasks
- QA3: Security audit
- QA4: Performance validation
- QA5: Accessibility validation
- DEPLOY: Production deployment

---

## Success Metrics

| Metric | Target | Method |
|--------|--------|--------|
| Typecheck | 0 errors | `pnpm typecheck` |
| Lint | 0 errors | `pnpm lint` |
| Tests | 100% pass | `pnpm test && pnpm test:rules` |
| Build | Success | `pnpm build` |
| Time Saved | 60% | Compare to sequential baseline |

---

## Ambiguity Resolution

### Q: What if tasks have hidden dependencies?
**A**: Wave design accounts for known dependencies. If hidden dependency discovered, task moves to next wave.

### Q: What if validation fails?
**A**: Fix in same branch, re-validate, amend commit before merge.

### Q: What if teams finish at different speeds?
**A**: Fast teams help slower teams or start next wave tasks early.

### Q: How to handle merge conflicts?
**A**: All work on same feature branch = no conflicts. Single merge to dev at checkpoint.

### Q: What about parallel task coordination?
**A**: Tasks in same wave are independent by design. No coordination needed.

---

## Checkpoint Criteria

### Gate: Wave 1 Complete ✅
- [ ] All 16 tasks complete (D1-D8, C1-C5, E1-E4)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] All changes committed
- [ ] Merged to dev
- [ ] Pushed to remote

**Estimated Duration**: 3-4 hours (vs 12+ hours sequential)
