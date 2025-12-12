---
description: "API framework typing strategies and Zod integration patterns"

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

## Error Protocol Application

**Trigger**: Same error pattern occurring 3+ times across codebase **Action**: Create architectural
fix rather than per-file patches **Documentation**: Store safeguard rules in `.github/safeguards/`
with status tracking

**Success pattern**: ZodType compatibility error eliminated across 50+ API routes with single
architectural change.
