# Next.js 16 TypeScript Migration: Route Params Type Changes

## Problem Statement

Upgrading to Next.js 16 introduced breaking TypeScript changes in route handler signatures. The
framework changed how dynamic route parameters are provided to route handlers.

## Root Cause

**Next.js 14 vs Next.js 16 incompatibility:**

### Next.js 14 (Old)

Route handlers receive params as a synchronous `Record<string, string>`:

```typescript
export const GET = (request: NextRequest, context: { params: Record<string, string> }) =>
  Promise<NextResponse>;
```

### Next.js 16 (New)

Route handlers receive params as an asynchronous `Promise<Record<string, string>>`:

```typescript
export const GET = (request: NextRequest, context: { params: Promise<Record<string, string>> }) =>
  Promise<NextResponse>;
```

## Failed Attempts

### Attempt 1: Union Type

**Problem:** Used `Record<string, string> | Promise<Record<string, string>>` to be backward
compatible.

**Result:** TypeScript constraint errors in `.next/types/validator.ts`:

```
error TS2344: Type '{ __tag__: "GET"; __param_type__: { params: Record<string, string> | Promise<Record<string, string>>; } | undefined; }'
does not satisfy the constraint 'ParamCheck<RouteContext>'
```

**Why it failed:** Next.js's generated type definitions have strict `ParamCheck` constraints that
don't accept unions or undefined params. The constraint explicitly expects the exact signature
Next.js generates.

### Attempt 2: Optional Context Parameter

**Problem:** Tried `context?: { params: Promise<Record<string, string>> }` with optional chaining.

**Result:** TS2322 type assignability errors. When returning from factory functions, you can't
return a function with optional parameters when the type expects required parameters.

**Why it failed:** TypeScript's parameter variance rules: an optional parameter in a return type is
not assignable to a required parameter in the expected type.

## Solution That Worked

### 1. **ExcelJS Type Annotations** (`apps/web/src/lib/imports/_template.import.ts`)

Added type imports from ExcelJS and explicit type annotations to callback parameters:

```typescript
import type { Row, Cell } from "exceljs";

worksheet.eachRow((row: Row, rowNumber: number) => {
  row.eachCell((cell: Cell, colNumber: number) => {
    // ...
  });
});
```

**Why it works:** Callbacks need explicit types when TypeScript strict mode is enabled.

### 2. **API Framework Update** (`packages/api-framework/src/index.ts`)

Updated all endpoint factory return type signatures to use `Promise<Record<string, string>>`
exclusively:

```typescript
export function createEndpoint<TInput = unknown, TOutput = unknown>(
  config: EndpointConfig<TInput, TOutput>,
): (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    routeContext: { params: Promise<Record<string, string>> },
  ) => {
    const params = await routeContext.params;
    // ... rest of handler
  };
}
```

**Critical insight:** The return type MUST exactly match what `createEndpoint` returns. All wrapper
factories (`createRateLimitedEndpoint`, `createPublicEndpoint`, etc.) must have return types that
match the base function's signature.

### 3. **Route Handler Updates** (`apps/web/app/api/schedules/route.ts`)

Changed internal function signatures to accept base `Request` type instead of `NextRequest`:

```typescript
const listSchedules = async (request: Request, context: RequestContext) => {
  const { searchParams } = new URL(request.url);
  // ...
};
```

**Why it works:** The base `Request` type is compatible with both Next.js 14 and 16 styles when
you're not using version-specific properties like `cookies`, `nextUrl`, etc.

## Key Learnings

1. **Next.js 16 is strict about types:** The generated `.next/types/validator.ts` has explicit
   constraints that don't accept deviations. You can't use unions or optional parameters.

2. **Return types matter:** When factory functions return other functions, the return type must
   match exactly. There's no flexibility for "close enough" types.

3. **Await params immediately:** In Next.js 16, you must `await` the params Promise in the handler.
   Don't pass it downstream without awaiting.

4. **Type compatibility hierarchy:**
   - `Request` < `NextRequest` (Request is broader, safer for compatibility)
   - `Promise<T>` cannot be used interchangeably with `T | Promise<T>` in function signatures
   - Optional parameters in return types are not assignable to required parameters

## Testing

All TypeScript checks pass:

```bash
pnpm typecheck
# Tasks: 4 successful, 4 total
# Successfully compiled all packages
```

## Files Modified

- `apps/web/src/lib/imports/_template.import.ts` - ExcelJS type annotations
- `apps/web/app/api/schedules/route.ts` - Request type change
- `packages/api-framework/src/index.ts` - Promise-based params throughout

## Migration Checklist for Similar Issues

- [ ] Check Next.js version in package.json
- [ ] Review `.next/types/validator.ts` errors for exact constraint requirements
- [ ] Update api-framework and factory functions together (don't update partially)
- [ ] Use `Promise<T>` not `T | Promise<T>` in function signatures
- [ ] Await params in handler, don't pass Promise downstream
- [ ] Test with `pnpm typecheck` before committing
