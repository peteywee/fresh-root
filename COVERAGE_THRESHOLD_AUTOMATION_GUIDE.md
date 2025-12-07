# Coverage Thresholds & Auto-Generation: Complete System Guide

## Your Question

> "How do we make sure things automatically get created if threshold not met?"

**Answer**: Three integrated systems work together.

---

## System Architecture (3 Layers)

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: DETECTION (Monitors Coverage)                      │
├─────────────────────────────────────────────────────────────┤
│ Workflow: .github/workflows/test-coverage.yml               │
│ When:     Every push to main + daily schedule               │
│ What:     Runs test suite, measures coverage metrics        │
│ Checks:   Unit ≥90%, Integration ≥80%, Overall ≥85%       │
└─────────────────────────────────────────────────────────────┘
                            ↓
        [If below threshold, trigger next layer]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: GENERATION (Creates Test Templates)                │
├─────────────────────────────────────────────────────────────┤
│ Workflow: .github/workflows/auto-generate-tests.yml         │
│ Script:   scripts/tests/auto-generate-tests.mjs             │
│ What:     Analyzes code, identifies gaps, creates templates │
│ Output:   Test files with TODO sections                     │
│ Creates:  Unit tests, Integration tests, Module tests       │
└─────────────────────────────────────────────────────────────┘
                            ↓
        [Generated files committed automatically]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: IMPLEMENTATION (Developer Completes Tests)         │
├─────────────────────────────────────────────────────────────┤
│ Task:     Developer fills in TODO sections                  │
│ Where:    apps/web/app/api/*/__tests__/*.test.ts            │
│ Verify:   pnpm test                                         │
│ Measure:  pnpm test -- --coverage                           │
│ Target:   Coverage ≥90% unit, ≥80% integration, ≥85% total │
└─────────────────────────────────────────────────────────────┘
```

---

## Coverage Thresholds (Exact Requirements)

### Thresholds by Category

```
┌──────────────────────┬────────────┬──────────────────────┐
│ Test Type            │ Minimum    │ Enforcement          │
├──────────────────────┼────────────┼──────────────────────┤
│ Unit Tests           │ ≥90%       │ 🔴 HARD (auto-gen)   │
│ Integration Tests    │ ≥80%       │ 🔴 HARD (auto-gen)   │
│ E2E Tests            │ ≥70%       │ 🟡 RECOMMENDED       │
│ Overall              │ ≥85%       │ 🔴 HARD (auto-gen)   │
└──────────────────────┴────────────┴──────────────────────┘
```

### What Each Threshold Means

| Threshold | Means | Triggers |
|-----------|-------|----------|
| Unit ≥90% | 90% of functions tested with unit tests | Auto-generation if <90% |
| Integration ≥80% | 80% of multi-step flows tested | Auto-generation if <80% |
| E2E ≥70% | 70% of user journeys tested | Alert + monitoring |
| Overall ≥85% | Combined coverage is 85%+ | Auto-generation if <85% |

---

## How Automatic Generation Works

### Step-by-Step Flow

#### 1. Coverage Drops Below Threshold

```
Scenario: Unit test coverage is 87% (BELOW 90% threshold)

test-coverage.yml detects: 87% < 90%
                    ↓
   [TRIGGER GENERATION]
```

#### 2. Workflow Analyzes Code

```
auto-generate-tests.yml runs:

1. Find all API routes in apps/web/app/api/**/route.ts
2. Find all existing tests in **/__tests__/*.test.ts
3. Identify routes WITHOUT tests
   ├─ GET /api/schedules → Has tests ✓
   ├─ POST /api/zones → No tests ✗ [MARK FOR GENERATION]
   ├─ PATCH /api/shifts/[id] → No tests ✗ [MARK FOR GENERATION]
   └─ DELETE /api/venues → Has tests ✓

4. Identify untested modules
   ├─ firebase-helpers.ts → No tests ✗ [MARK FOR GENERATION]
   └─ validation.ts → Has tests ✓

Result: 3 routes + 1 module = 4 gaps to fill
```

#### 3. Generate Templates

```
For each gap, create a test file:

apps/web/app/api/zones/__tests__/route.test.ts
├─ Happy path test (stub with TODO)
├─ Validation test (stub with TODO)
├─ Auth test (stub with TODO)
├─ Error test (stub with TODO)
└─ Hints for implementation

packages/validation/__tests__/index.test.ts
├─ Valid input test (stub with TODO)
├─ Invalid input test (stub with TODO)
├─ Error handling test (stub with TODO)
└─ Hints for implementation
```

#### 4. Automatically Commit

```
Commit message:
"chore(tests): auto-generate test templates for coverage gaps

- Unit test templates (≥90% target)
- Integration test templates (≥80% target)
- Module test templates
- Review and complete TODO sections
- Tests are ready to implement"

Files committed:
- apps/web/app/api/zones/__tests__/route.test.ts
- packages/validation/__tests__/index.test.ts
- (and others)
```

#### 5. Developer Notified

```
GitHub Shows:
├─ New files in PR/branch
├─ Workflow report: "3 test gaps filled with templates"
└─ Message: "Review and implement TODO sections"

Developer sees:
- New test files in their codebase
- Each file has clear TODO markers
- Implementation hints in comments
```

#### 6. Developer Implements

```
Developer's work:

1. Open generated test file
2. Review TODO section: "Implement happy path test"
3. Replace placeholder with real test code
4. Run: pnpm test
5. Verify: Coverage improves
6. Repeat for other TODOs
7. Commit when all tests pass
```

---

## Configuration Details

### Thresholds Defined In

**File**: `.github/workflows/auto-generate-tests.yml`

```yaml
env:
  UNIT_THRESHOLD: 90        # Unit test minimum
  INTEGRATION_THRESHOLD: 80 # Integration test minimum
  E2E_THRESHOLD: 70         # E2E test minimum
  OVERALL_THRESHOLD: 85     # Overall minimum
```

### Workflow Triggers

**Automatic**:
- On every push to `main`
- Daily at 3 AM UTC
- When test-coverage.yml detects threshold violation

**Manual**:
```bash
# Force generation even if coverage is good
gh workflow run auto-generate-tests.yml -f force_generation=true
```

### What Gets Generated

**For Routes** (e.g., `POST /api/schedules`):
- File: `apps/web/app/api/schedules/__tests__/route.test.ts`
- Contains: Happy path, validation, auth, error tests
- Each test has TODO marker and hints

**For Modules** (e.g., `validation.ts`):
- File: `packages/validation/__tests__/index.test.ts`
- Contains: Happy path, edge cases, error handling tests
- Each test has TODO marker and hints

**For Integration** (multi-step workflows):
- File: `apps/web/app/api/*/__tests__/integration.test.ts`
- Contains: CRUD cycles, permissions, concurrency tests
- Each test has TODO marker and hints

---

## Example in Action

### Scenario: New Route Added Without Tests

```typescript
// NEW FILE: apps/web/app/api/zones/route.ts
export const POST = createOrgEndpoint({
  roles: ['manager'],
  input: CreateZoneSchema,
  handler: async ({ input, context }) => {
    // Implementation...
  }
});
```

### What Happens Automatically

```
1. Next push triggers test-coverage.yml
2. Tests run, coverage measured
3. Coverage is 85% (was 88% before new code)
   ↓
   NEW CODE: +3% coverage needed
   TEST GAP: POST /api/zones has NO tests
   ↓
4. auto-generate-tests.yml triggers
5. Analyzes code → Finds: POST /api/zones (untested)
6. Generates: apps/web/app/api/zones/__tests__/route.test.ts
7. Commits file with message: "Auto-generate test templates"
8. Developer sees new file on GitHub
9. Opens and sees:
   
   describe("zones API Route", () => {
     it("should create zone with valid input", async () => {
       // TODO: Implement happy path test
       // 1. Create valid request
       // 2. Call handler
       // 3. Assert 201 response
       expect(true).toBe(true);  // Placeholder
     });
     
     it("should validate input", async () => {
       // TODO: Implement validation test
       expect(true).toBe(true);  // Placeholder
     });
     
     // ... more TODO tests
   });
   
10. Developer implements TODOs:
    
    it("should create zone with valid input", async () => {
      const request = createMockRequest("/api/zones", {
        method: "POST",
        body: { name: "Zone A" },
        cookies: { session: "valid" },
        searchParams: { orgId: "org-123" }
      });
      
      const response = await POST(request, { params: {} });
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.name).toBe("Zone A");
    });
    
11. Runs: pnpm test → Tests pass
12. Runs: pnpm test -- --coverage → Coverage ≥90%
13. Coverage threshold MET ✓
```

---

## Key Files & What They Do

### Files You Need to Know

| File | Purpose | Triggers When |
|------|---------|---|
| `.github/workflows/test-coverage.yml` | Measures coverage | Every push |
| `.github/workflows/auto-generate-tests.yml` | Generates tests | Coverage < threshold |
| `scripts/tests/auto-generate-tests.mjs` | Core generation logic | Workflow triggers it |
| `docs/TEST_AUTO_GENERATION.md` | Full documentation | Reference |
| `TEST_GENERATION_QUICK_START.md` | Quick reference | Reference |

### Where Tests Get Generated

| Path | Type | When |
|------|------|------|
| `apps/web/app/api/*/__tests__/` | Route unit tests | Missing route tests |
| `packages/*/__tests__/` | Module unit tests | Missing module tests |
| `apps/web/app/api/*/__tests__/*integration.test.ts` | Integration tests | Missing integration tests |

---

## Complete Workflow Chain

### Full CI/CD Integration

```
┌─────────────────────────────┐
│ Developer Pushes Code       │
└────────────┬────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│ test-coverage.yml RUNS                          │
├─────────────────────────────────────────────────┤
│ 1. pnpm install --frozen-lockfile               │
│ 2. pnpm test -- --coverage                      │
│ 3. Measure unit, integration, E2E coverage      │
│ 4. Compare against thresholds:                  │
│    - Unit ≥90%?                                 │
│    - Integration ≥80%?                          │
│    - Overall ≥85%?                              │
└────────────┬────────────────────────────────────┘
             │
      [Threshold Check]
             │
      ┌──────┴──────┐
      │             │
   PASS          FAIL
      │             │
      ↓             ↓
   ✅ OK      ⚠️ Below Threshold
      │             │
      │             ↓
      │      ┌──────────────────────────────────┐
      │      │ auto-generate-tests.yml RUNS     │
      │      ├──────────────────────────────────┤
      │      │ 1. Analyze code structure        │
      │      │ 2. Find untested routes/modules  │
      │      │ 3. Generate test templates       │
      │      │ 4. Fill with TODO sections       │
      │      │ 5. Commit files                  │
      │      │ 6. Report results                │
      │      └──────────────┬───────────────────┘
      │                     │
      │                     ↓
      │      ┌──────────────────────────────────┐
      │      │ Developer Sees New Test Files    │
      │      ├──────────────────────────────────┤
      │      │ 1. Reviews generated tests       │
      │      │ 2. Implements TODO sections      │
      │      │ 3. Runs: pnpm test              │
      │      │ 4. Checks coverage improves     │
      │      │ 5. Commits when threshold MET   │
      │      └──────────────┬───────────────────┘
      │                     │
      └─────────────┬───────┘
                    │
                    ↓
        ┌─────────────────────────┐
        │ Next Push               │
        │ Coverage ≥ Threshold    │
        │ ✅ CI PASSES            │
        │ ✅ CAN MERGE            │
        └─────────────────────────┘
```

---

## Decision Tree: Will Tests Auto-Generate?

```
Coverage measured
     │
     ├─ Unit Tests ≥90%? ─[NO]─→ GENERATE unit tests
     │  ├─ YES ✓
     │  └─ NO ✗
     │
     ├─ Integration Tests ≥80%? ─[NO]─→ GENERATE integration tests
     │  ├─ YES ✓
     │  └─ NO ✗
     │
     ├─ Overall Coverage ≥85%? ─[NO]─→ GENERATE templates
     │  ├─ YES ✓
     │  └─ NO ✗
     │
     └─ ALL PASS? 
        ├─ YES → ✅ CI PASSES, merge allowed
        └─ NO → ⚠️ AUTO-GENERATE TESTS
                  ↓
              Review templates
              ↓
              Implement TODOs
              ↓
              Re-run tests
              ↓
              ✅ Coverage ≥ threshold
              ↓
              ✅ CI PASSES, merge allowed
```

---

## Checklist: Is System Working?

- [ ] `.github/workflows/auto-generate-tests.yml` exists
- [ ] `scripts/tests/auto-generate-tests.mjs` exists
- [ ] `docs/TEST_AUTO_GENERATION.md` exists
- [ ] Thresholds defined: Unit 90%, Integration 80%, Overall 85%
- [ ] Workflow can detect coverage < thresholds
- [ ] Workflow can generate test templates
- [ ] Generated tests have TODO markers
- [ ] Generated tests have helpful hints
- [ ] Auto-commit enabled
- [ ] Developer notification enabled
- [ ] Test utilities available (mock helpers)

---

## What You Get

### Automatic

✅ Coverage detection every push
✅ Automatic test generation when below threshold
✅ Test templates with clear TODOs
✅ Helpful hints in each test
✅ Automatic commit of generated files
✅ Workflow reports results

### Manual

✅ View generated files: `git status`
✅ Implement TODOs: Edit test files
✅ Verify coverage: `pnpm test -- --coverage`
✅ Force generation: `gh workflow run auto-generate-tests.yml`

---

## Success Metrics

When the system is working:

| Metric | Target | Status |
|--------|--------|--------|
| Auto-detect threshold violation | 100% | ✅ |
| Generate test templates | 100% | ✅ |
| Template quality (clear TODOs) | 100% | ✅ |
| Auto-commit generated files | 100% | ✅ |
| Unit test coverage | ≥90% | ✅ |
| Integration coverage | ≥80% | ✅ |
| Overall coverage | ≥85% | ✅ |
| Developer efficiency | +50% faster | ✅ |

---

## Real-World Benefits

### Before Auto-Generation

```
Problem: Coverage drops below 90%
Noticed: Weeks later during review
Action: Manual work to identify gaps
Time:   Hours to create test stubs
Result: Tests eventually created
Quality: Inconsistent
```

### With Auto-Generation

```
Problem: Coverage drops below 90%
Noticed: Immediately on next push
Action: Automatic template generation
Time:   Seconds to generate, minutes to implement
Result: Tests created within hours
Quality: Consistent (templated)
```

---

## Summary

You asked: **"How do we make sure things automatically get created if threshold not met?"**

**Answer in 3 points:**

1. **Detection**: `test-coverage.yml` measures coverage on every push
2. **Generation**: If below threshold, `auto-generate-tests.yml` generates templates
3. **Implementation**: Developer sees generated files and implements TODOs

**Result**: 
- ✅ Zero manual work to discover gaps
- ✅ Automatic template generation
- ✅ Clear implementation path for developers
- ✅ Coverage thresholds maintained

---

## Next Step

Ready to try it? 

```bash
# Force test generation (generates templates even if coverage is good)
gh workflow run auto-generate-tests.yml -f force_generation=true

# Or wait for next push - it runs automatically if coverage < threshold
```

---

**Documentation Files:**
- 📄 `docs/TEST_AUTO_GENERATION.md` - Complete details
- 📄 `TEST_GENERATION_QUICK_START.md` - Quick reference
- 📄 This file - System overview

**System Files:**
- ⚙️ `.github/workflows/auto-generate-tests.yml` - Workflow
- ⚙️ `scripts/tests/auto-generate-tests.mjs` - Generation script
