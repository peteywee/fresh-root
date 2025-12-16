---
description: "API framework typing strategies and Zod integration patterns"

applyTo: "**/api/**/route.ts,packages/api-framework/**/*.ts"
---

---
priority: 1
applyTo: "**/api/**/route.ts,packages/api-framework/**/*.ts"
---

# API Framework Memory

Critical patterns for maintaining type safety and developer experience in the Fresh Schedules API
framework.

## ZodType Compatibility Resolution

**Context**: Zod schema objects (`ZodObject<Schema, $strip>`) don't structurally match TypeScript's
generic `ZodType<TInput, any, any>` constraint due to internal property differences.

**Solution**: Use permissive `any` type for input schema parameter:

```typescript
// API Framework interface - CORRECT pattern
interface EndpointConfig<TInput = unknown, TOutput = unknown> {
  input?: any; // Allows any Zod schema type
  handler: (params: { input: TInput; context: RequestContext }) => Promise<TOutput>;
}
```

**Why this is safe**:

- Runtime validation via Zod `.parse()` remains intact
- Type safety moved from compile-time constraint to runtime validation
- No actual security vulnerability - schemas still enforce data structure

## Input Type Inference Workaround

**Current limitation**: Handler input parameter typed as `unknown` instead of schema-inferred type.

**Workaround pattern**:

```typescript
export const POST = createOrgEndpoint({
  input: CreateWidgetSchema,
  handler: async ({ input, context }) => {
    const typedInput = input as CreateWidget; // Safe type assertion
    return NextResponse.json({ name: typedInput.name });
  },
});
```

**Future enhancement**: Implement overloaded factory functions for proper type inference.

## Handler Parameter Naming Convention

**Pattern**: SDK factory passes `{ request, input, context, params, item, index }` depending on endpoint type.

**Common mistake**: Prefixing with underscores (`_request`, `_context`, `_params`) when parameter isn't used.

**Why this causes issues**: TypeScript compiler rejects unused parameters without underscore prefix, but SDK factory validation doesn't recognize underscore-prefixed names as valid parameter names.

**Correct pattern**:

```typescript
// ✅ CORRECT: Use actual parameter names or destructure only what's needed
export const GET = createPublicEndpoint({
  handler: async ({ request }) => {
    const url = new URL(request.url);
    return NextResponse.json({ path: url.pathname });
  },
});

// ✅ ALSO CORRECT: Use empty object if no parameters needed
export const GET = createPublicEndpoint({
  handler: async ({}) => {
    return NextResponse.json({ status: "ok" });
  },
});

// ❌ WRONG: Don't use underscore-prefixed names
export const GET = createPublicEndpoint({
  handler: async ({ _request }) => {
    // TypeScript error: Property '_request' doesn't exist
  },
});
```

**Migration**: Use `sed` for bulk fixes across routes:
```bash
# Remove all underscore-prefixed params in handlers
find app/api -name "route.ts" -exec sed -i 's/_request/request/g; s/_context/context/g; s/_params/params/g; s/_index/index/g; s/_input/input/g' {} \;
```

## Error Protocol Application

**Trigger**: Same error pattern occurring 3+ times across codebase **Action**: Create architectural
fix rather than per-file patches **Documentation**: Store safeguard rules in `.github/safeguards/`
with status tracking

**Success pattern**: ZodType compatibility error eliminated across 50+ API routes with single
architectural change.
