# Test Auto-Generation Quick Reference

## Problem

You want tests **automatically created** when coverage falls below thresholds:

| Metric | Threshold | Action if Below |
|--------|-----------|-----------------|
| Unit Tests | ≥90% | ✅ Auto-generate templates |
| Integration Tests | ≥80% | ✅ Auto-generate templates |
| E2E Tests | ≥70% | ℹ️ Alert & monitor |
| Overall | ≥85% | ✅ Auto-generate templates |

---

## Solution Overview

**3-Part System**:

### 1️⃣ Detection (`.github/workflows/auto-generate-tests.yml`)
- Runs test suite
- Measures coverage
- Detects gaps vs thresholds
- Triggers generation if below threshold

### 2️⃣ Generation (`scripts/tests/auto-generate-tests.mjs`)
- Analyzes code structure
- Identifies untested routes/modules
- Creates test file templates
- Fills templates with TODO sections

### 3️⃣ Automation (`CI/CD`)
- Automatically commits generated files
- Notifies developers
- Ready for developers to implement

---

## Flow Diagram

```
You push code
    ↓
Test Coverage Workflow runs
    ├─ Measures coverage
    └─ If BELOW threshold:
        ↓
    Auto-Generation Workflow runs
        ├─ Analyzes missing tests
        ├─ Generates templates
        ├─ Commits files
        └─ Reports to developers
            ↓
        Developers see new test files
        ├─ Implement TODO sections
        ├─ Run: pnpm test
        └─ Verify coverage improves
            ↓
        Tests pass & coverage ≥ threshold
```

---

## Quick Commands

### Check Current Coverage

```bash
# Full coverage report
pnpm test -- --coverage

# Just unit tests
pnpm test

# Just integration tests
pnpm test:integration
```

### Force Test Generation

```bash
# Generate test templates (even if coverage is good)
gh workflow run auto-generate-tests.yml -f force_generation=true

# Or directly
node scripts/tests/auto-generate-tests.mjs
```

### Implement Auto-Generated Tests

```bash
# See what was generated
git status

# Review a generated test
cat apps/web/app/api/schedules/__tests__/route.test.ts

# Implement the TODOs
# - Replace placeholder assertions with real tests
# - Follow the test hints in comments
# - Run frequently to verify

# Test as you implement
pnpm test -- --watch

# Check coverage after implementation
pnpm test -- --coverage
```

---

## What Gets Generated?

### For Each Missing Route Test

```typescript
describe("schedules API Route", () => {
  describe("GET Request", () => {
    it("should return successful response", async () => {
      // TODO: Implement happy path
      expect(true).toBe(true);  // Placeholder
    });

    it("should validate input", async () => {
      // TODO: Test validation
      expect(true).toBe(true);  // Placeholder
    });

    it("should require authentication", async () => {
      // TODO: Test auth
      expect(true).toBe(true);  // Placeholder
    });

    it("should handle errors gracefully", async () => {
      // TODO: Test errors
      expect(true).toBe(true);  // Placeholder
    });
  });
});
```

### For Each Missing Module Test

```typescript
describe("myModule", () => {
  it("should work with valid input", () => {
    // TODO: Implement
    expect(true).toBe(true);
  });

  it("should reject invalid input", () => {
    // TODO: Implement
    expect(true).toBe(true);
  });

  it("should handle errors gracefully", () => {
    // TODO: Implement
    expect(true).toBe(true);
  });
});
```

---

## Example: Complete the TODO

### Before (Auto-Generated)

```typescript
it("should return successful response", async () => {
  // TODO: Implement happy path test
  // 1. Create valid request
  // 2. Call handler
  // 3. Assert response status (200)
  // 4. Assert response data structure
  expect(true).toBe(true); // Placeholder
});
```

### After (Developer Implements)

```typescript
it("should return successful response", async () => {
  const request = createMockRequest("/api/schedules", {
    cookies: { session: "valid-session" },
    searchParams: { orgId: "org-123" }
  });

  const response = await GET(request, { params: {} });
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.data).toBeInstanceOf(Array);
  expect(data.pagination).toBeDefined();
});
```

---

## Test Hints in Generated Files

Each generated file includes hints:

```typescript
/**
 * 💡 Test Generation Hints:
 *
 * 1. HAPPY PATH (Success Case)
 *    - Valid input → 200/201 response
 *    - Assert response data matches schema
 *    - Assert any side effects (DB write, logging)
 *
 * 2. VALIDATION (Input Validation)
 *    - Invalid/missing fields → 400 Bad Request
 *    - Out-of-range values → 400 Bad Request
 *    - Invalid types → 400 Bad Request
 *
 * 3. AUTHENTICATION (Auth Required)
 *    - No session cookie → 401 Unauthorized
 *    - Expired token → 401 Unauthorized
 *    - Invalid token → 401 Unauthorized
 *
 * 4. AUTHORIZATION (Permission Check)
 *    - Insufficient role → 403 Forbidden
 *    - Wrong organization → 403 Forbidden
 *    - Resource owned by other org → 403 Forbidden
 *
 * 5. ERROR HANDLING (Edge Cases)
 *    - Database error → 500 Internal Server Error + logged
 *    - Timeout → 504 Gateway Timeout
 *    - Rate limit → 429 Too Many Requests
 */
```

---

## Test Utilities Available

### Mock Request Builder

```typescript
import { createMockRequest } from "@fresh-schedules/api-framework/testing";

const request = createMockRequest("/api/schedules", {
  method: "POST",
  body: { name: "Q4 Schedule" },
  cookies: { session: "valid-session" },
  searchParams: { orgId: "org-123" }
});
```

### Mock Context Builders

```typescript
import { 
  createMockAuthContext,
  createMockOrgContext 
} from "@fresh-schedules/api-framework/testing";

const auth = createMockAuthContext({
  userId: "user-123",
  email: "test@example.com"
});

const org = createMockOrgContext({
  orgId: "org-123",
  role: "manager"
});
```

---

## Workflow Automation

### When Does It Run?

1. **On Push to Main**
   - After test-coverage.yml measures coverage
   - If coverage < threshold → auto-generates

2. **On Schedule (Daily)**
   - 3 AM UTC every day
   - Checks if tests need generation

3. **On Demand**
   - `gh workflow run auto-generate-tests.yml`
   - Force generation with `-f force_generation=true`

### What Happens?

```
1. ✅ Run coverage analysis
2. ✅ Identify gaps vs thresholds
3. ✅ Analyze untested routes/modules
4. ✅ Generate test templates
5. ✅ Fill with TODO sections
6. ✅ Commit generated files
7. ✅ Report results
8. ✅ Notify developers
```

---

## Success Criteria

### Generated Files

- ✅ All missing routes have test templates
- ✅ All critical modules have test templates
- ✅ Tests are well-organized in `__tests__/` directories
- ✅ Each test has clear TODOs with hints

### Implementation

- ✅ Developer implements all TODO sections
- ✅ Tests follow SDK Factory patterns
- ✅ Tests use mock utilities
- ✅ Tests cover happy path + error cases

### Coverage Improvement

- ✅ Unit test coverage ≥90%
- ✅ Integration test coverage ≥80%
- ✅ Overall coverage ≥85%
- ✅ All generated tests implemented

---

## Integration Points

### With test-coverage.yml

```yaml
# test-coverage.yml triggers auto-generation
- name: Run unit tests
  run: pnpm test -- --coverage --reporter=verbose

# If coverage < 90%, runs:
- name: Auto-generate test templates
  if: coverage < thresholds
  run: node scripts/tests/auto-generate-tests.mjs
```

### With CI/CD Workflow

```
Push
  ↓
test-coverage.yml (measures coverage)
  ├─ Coverage ≥ threshold? → Merge OK
  └─ Coverage < threshold? → auto-generate-tests.yml
      ├─ Generate templates
      ├─ Commit files
      └─ Notify developer
```

---

## Real-World Example

### Scenario

You add a new API route but forget to add tests:

```typescript
// apps/web/app/api/schedules/route.ts
export const POST = createOrgEndpoint({
  roles: ['manager'],
  input: CreateScheduleSchema,
  handler: async ({ input, context }) => {
    // Implementation...
  }
});
```

### Automatic Response

1. **Coverage drops below 90%** ⚠️

2. **Workflow detects** and triggers auto-generation ✅

3. **Generator creates**:
   ```
   apps/web/app/api/schedules/__tests__/route.test.ts
   ```

4. **Developer sees** a new test file with TODOs ✅

5. **Developer implements** the TODOs ✅

6. **Tests pass** and coverage improves ✅

---

## Troubleshooting

### Tests Generated But Not Running?

```bash
# Check file locations
find . -name "*.test.ts" | grep schedules

# Verify test discovery
pnpm test -- --listTests

# Run specific test
pnpm test apps/web/app/api/schedules/__tests__/route.test.ts
```

### Coverage Not Improving?

```bash
# Check what's actually being tested
pnpm test -- --coverage

# Review generated test TODOs
cat apps/web/app/api/schedules/__tests__/route.test.ts

# Implement and run
pnpm test -- --watch
```

### Placeholder Tests Still Failing?

```typescript
// ❌ Don't leave placeholders in production
it("should validate input", () => {
  expect(true).toBe(true);  // PLACEHOLDER - replace this!
});

// ✅ Replace with real test
it("should validate input", () => {
  const invalidInput = { name: "" };
  expect(() => {
    myFunction(invalidInput);
  }).toThrow("Name is required");
});
```

---

## Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/auto-generate-tests.yml` | CI/CD workflow that triggers generation |
| `scripts/tests/auto-generate-tests.mjs` | Core generation script |
| `docs/TEST_AUTO_GENERATION.md` | Full documentation |
| `apps/web/app/api/*/__tests__/*.test.ts` | Generated route tests |
| `packages/*/__tests__/*.test.ts` | Generated module tests |

---

## Summary Table

| Threshold | Target | Below? | Action |
|-----------|--------|--------|--------|
| Unit | ≥90% | Yes | 🤖 Auto-generate |
| Integration | ≥80% | Yes | 🤖 Auto-generate |
| E2E | ≥70% | No | ℹ️ Monitor |
| Overall | ≥85% | Yes | 🤖 Auto-generate |

---

## Next Steps

1. **Force generation** (optional): `gh workflow run auto-generate-tests.yml -f force_generation=true`
2. **Review generated files**: `git status`
3. **Implement TODOs**: Replace placeholder assertions with real tests
4. **Run tests**: `pnpm test`
5. **Verify coverage**: `pnpm test -- --coverage`
6. **Commit when ready**: Coverage ≥ thresholds

---

**More Info**: See `docs/TEST_AUTO_GENERATION.md` for complete documentation.
