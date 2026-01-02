# Safeguard Rule: ZodType Compatibility
**Created**: December 10, 2025 **Trigger**: 3+ occurrences of ZodType compatibility errors
**Pattern**: `ZodObject<...> is missing properties from ZodType<TInput, any, any>`

## Error Pattern Detection
**Files Affected**:

- `app/api/internal/backup/route.ts`
- `app/api/publish/route.ts`
- `app/api/session/bootstrap/route.ts`
- `app/api/widgets/route.ts`

**Error Message Template**:

```
Type 'ZodObject<{...}, $strip>' is missing the following properties from type 'ZodType<unknown, any, any>': _type, _parse, _getType, _getOrReturnCtx, and 7 more.
```

## Root Cause Analysis
1. **API Framework Type Constraint**: `input?: ZodType<TInput, any, any>`
2. **Actual Zod Schema Type**: `ZodObject<Schema, $strip, $output>`
3. **Mismatch**: ZodObject doesn't extend ZodType in the expected way

## Prevention Rules
### ESLint Rule (packages/config/eslint-rules/zodtype-compatibility.js)
```javascript
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent ZodType compatibility issues in API framework",
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key.name === "input" &&
          node.parent.parent.callee?.name?.includes("createOrgEndpoint")
        ) {
          // Check if value is a direct Zod schema import
          const sourceCode = context.getSourceCode();
          const valueText = sourceCode.getText(node.value);
          if (valueText.endsWith("Schema") && !valueText.includes("as ZodType")) {
            context.report({
              node,
              message:
                "Use 'as ZodType<InputType>' type assertion for Zod schemas in API framework",
              fix(fixer) {
                return fixer.replaceText(node.value, `${valueText} as ZodType<any>`);
              },
            });
          }
        }
      },
    };
  },
};
```

### TypeScript Template Fix
```typescript
// CORRECT pattern:
export const POST = createOrgEndpoint({
  input: CreateWidgetSchema as ZodType<any>, // Type assertion required
  handler: async ({ input, context }) => { ... }
});

// INCORRECT pattern (triggers safeguard):
export const POST = createOrgEndpoint({
  input: CreateWidgetSchema, // Raw Zod schema - incompatible
  handler: async ({ input, context }) => { ... }
});
```

## Architectural Solution
**File**: `packages/api-framework/src/index.ts` **Change**: Update EndpointConfig interface to
accept broader Zod types

```typescript
// Current (too restrictive):
input?: ZodType<TInput, any, any>;

// Fixed (accepts all Zod schema types):
input?: z.ZodTypeAny;
```

## Monitoring
- **CI Check**: Fail builds if this pattern occurs 3+ times without safeguard application
- **Pre-commit Hook**: Auto-apply type assertions to new API routes
- **Documentation**: Update API framework README with required pattern

## Status
- \[x] Pattern detected (4+ occurrences)
- \[x] Safeguard rule created
- \[x] Architectural fix applied (`any` type resolves ZodType compatibility)
- \[x] ZodType compatibility error RESOLVED ✅
- \[ ] Input type inference enhancement (requires overloaded factory functions)
- \[ ] ESLint rule implemented
- \[ ] CI monitoring enabled

## Current Status: RESOLVED ✅
**ZodType compatibility error eliminated**. Remaining issue is input type inference
(`input: unknown` instead of inferred types).

### Workaround for Input Typing
```typescript
export const POST = createOrgEndpoint({
  input: CreateWidgetSchema,
  handler: async ({ input, context }) => {
    const typedInput = input as CreateWidget; // Type assertion workaround
    return NextResponse.json({ name: typedInput.name });
  },
});
```
