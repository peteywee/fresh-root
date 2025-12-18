# Edge Case Testing Framework

> **Location**: `tests/unit/edge-cases/`  
> **Created**: 2025-12-17  
> **Purpose**: Future-proof adversarial input testing for 10+ year maintainability

---

## Quick Start

```bash
# Run all edge case tests
pnpm vitest run tests/unit/edge-cases/

# Run with coverage
pnpm vitest run tests/unit/edge-cases/ --coverage

# Watch mode for development
pnpm vitest watch tests/unit/edge-cases/
```

---

## Architecture Overview

```
tests/unit/edge-cases/
├── index.ts          # Main export (re-exports all modules)
├── generators.ts     # Pure functions that generate test values
├── validators.ts     # Schema validation utilities
├── matchers.ts       # Custom Vitest matchers
├── schemas.ts        # Pre-hardened Zod schemas
├── edge-cases.test.ts # Main test suite
└── README.md         # This file
```

---

## Design Principles (10-Year Maintainability)

### 1. Pure Functions Only
All generators are pure functions with no side effects. They take input and return output deterministically.

```typescript
// ✅ Good - Pure function
function numericEdgeCases(): LabeledValue<number>[] {
  return [/* ... */];
}

// ❌ Bad - Side effects
function numericEdgeCases(): void {
  globalTestCases.push(/* ... */); // Side effect!
}
```

### 2. Labeled Values
Every test value has metadata for debugging and filtering:

```typescript
interface LabeledValue<T> {
  label: string;        // Human-readable description
  value: T;             // The actual test value
  shouldReject: boolean; // Expected behavior
  category: string;      // For filtering
  severity: string;      // Security priority
}
```

### 3. Category-Based Organization
Edge cases are organized by category for easy filtering:

| Category | Description | Example |
|----------|-------------|---------|
| `overflow` | Values too large | `Number.MAX_SAFE_INTEGER + 1` |
| `underflow` | Values too small | `Number.MIN_SAFE_INTEGER - 1` |
| `unicode` | Non-ASCII characters | `"💀🔥"`, `"مرحبا"` |
| `injection` | Security attacks | `"'; DROP TABLE--"` |
| `null` | Null/undefined values | `null`, `undefined` |
| `empty` | Empty values | `""`, `[]`, `{}` |
| `boundary` | Edge of valid range | `255` chars, `0`, `-1` |
| `type-coercion` | Type confusion | `"123"`, `[1]` |
| `nested` | Deep/wide objects | 100 levels deep |
| `array` | Array size extremes | 10000 items |

### 4. Severity-Based Prioritization
Security cases are prioritized by severity:

| Severity | Description | Action |
|----------|-------------|--------|
| `critical` | Security vulnerability | Must reject |
| `high` | Potential attack vector | Should reject |
| `medium` | Suspicious input | Consider rejecting |
| `low` | Edge case | Document behavior |

---

## Usage Patterns

### Basic: Test a Schema Against Edge Cases

```typescript
import { validateEdgeCases, stringEdgeCases } from "./edge-cases";

const summary = validateEdgeCases(MySchema, stringEdgeCases());
console.log(`Pass rate: ${summary.passRate}%`);
console.log(`Failures:`, summary.failures);
```

### Intermediate: Filter by Category or Severity

```typescript
import { getEdgeCasesBySeverity, getEdgeCasesByCategory } from "./edge-cases";

// Only test critical security cases
const criticalCases = getEdgeCasesBySeverity("critical");

// Only test injection attempts
const injectionCases = getEdgeCasesByCategory("injection");
```

### Advanced: Create Custom Test Suite

```typescript
import { createEdgeCaseTestSuite, stringEdgeCases } from "./edge-cases";

const testSuite = createEdgeCaseTestSuite(
  "MySchema",
  MySchema,
  stringEdgeCases(),
  {
    minSeverity: "high",
    categories: ["injection", "overflow"],
  }
);

// Use in Vitest
testSuite(describe, it, expect);
```

### Advanced: Use Custom Matchers

```typescript
// In vitest.setup.ts
import { installEdgeCaseMatchers } from "./tests/unit/edge-cases/matchers";
installEdgeCaseMatchers();

// In your tests
expect(MySchema).toHandleEdgeCases(stringEdgeCases());
expect(MySchema).toHandleSecurityCases(injectionEdgeCases());
expect("'; DROP TABLE--").toBeRejectedBySchema(SafeStringSchema);
```

---

## Extending the Framework

### Adding New Edge Cases

1. Open the appropriate generator file (`generators.ts`)
2. Add to the existing function or create a new one:

```typescript
// Add to existing function
export function stringEdgeCases(): LabeledValue<string>[] {
  return [
    // ... existing cases ...
    
    // NEW: Add your case
    {
      label: "Zero-width space attack",
      value: "normal\u200Btext", // Zero-width space
      shouldReject: false, // Document expected behavior
      category: "unicode",
      severity: "medium",
    },
  ];
}
```

### Adding New Categories

1. Add to `EdgeCaseCategory` type:

```typescript
export type EdgeCaseCategory =
  | "overflow"
  | "underflow"
  // ... existing ...
  | "your-new-category"; // NEW
```

2. Create generator function:

```typescript
export function yourNewCategoryEdgeCases(): LabeledValue<unknown>[] {
  return [/* ... */];
}
```

3. Update `getEdgeCasesByCategory` if needed.

### Adding New Safe Schemas

1. Open `schemas.ts`
2. Create your hardened schema:

```typescript
export const SafePhoneNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .refine(
    (val) => !/<script/i.test(val),
    "Invalid characters"
  );
```

---

## Testing Schedule

### Continuous (Every PR)
- Run full edge case suite
- Block merge on security failures

### Weekly
- Review new CVEs for new attack patterns
- Update injection cases if needed

### Quarterly
- Review edge case coverage
- Add any new categories discovered

### Annually
- Full audit of edge case generators
- Update for new JavaScript/TypeScript features
- Review severity classifications

---

## Versioning Strategy

This framework follows semantic versioning for the API:

| Version | Changes |
|---------|---------|
| 1.0.0 | Initial release (2025-12-17) |
| 1.x.x | New edge cases, new generators (backward compatible) |
| 2.0.0 | Breaking changes to interfaces (would require migration guide) |

---

## Common Issues

### Tests Failing After Schema Change

If tests fail after you modify a schema, check:

1. **Intentional behavior change?** Update `shouldReject` in affected cases
2. **Regression?** Schema may have become too permissive/restrictive
3. **New edge case?** Add new case if discovered during development

### Too Many Failures

If you're seeing many failures, try:

```typescript
// Filter to just critical cases first
const criticalOnly = getEdgeCasesBySeverity("critical");
const summary = validateEdgeCases(schema, criticalOnly);
```

### Performance Issues

Large edge case sets (10000+ items) may be slow. Use pagination:

```typescript
const allCases = arrayEdgeCases(() => "item");
const firstBatch = allCases.slice(0, 100);
```

---

## Dependencies

| Dependency | Version | Purpose | Upgrade Notes |
|------------|---------|---------|---------------|
| `zod` | ^3.x | Schema validation | Major version changes may need adapter |
| `vitest` | ^1.x | Test runner | Matcher API may change |

---

## Contact / Ownership

- **Created by**: AI Agent Analysis
- **Maintained by**: Fresh Schedules Engineering Team
- **Last Updated**: 2025-12-17

---

## Change Log

### 2025-12-17 - Initial Release
- Created edge case generators for:
  - Numeric (overflow, underflow, special values)
  - String (unicode, injection, length)
  - Timestamp (boundaries, invalid dates)
  - Array (size limits, deeply nested)
  - Null/undefined handling
  - Type coercion attacks
- Created validation utilities
- Created custom Vitest matchers
- Created pre-hardened schemas
- Created comprehensive test suite
- Added 10-year maintainability documentation

---

**This framework is designed to evolve. When in doubt, add more edge cases rather than removing them.**
