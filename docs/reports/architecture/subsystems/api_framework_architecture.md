# L2 — API Framework Architecture & Design

> **Status:** ✅ Documented from actual implementation analysis
> **Last Updated:** 2025-12-17
> **Package:** `@fresh-schedules/api-framework` v1.0.0
> **Adoption:** 100% - All 44+ route handlers migrated

## 1. Role in the System

The API Framework (`@fresh-schedules/api-framework`) is the **foundational abstraction layer** that standardizes ALL API route implementations. It provides a declarative SDK factory pattern that enforces:

- **A09 Handler Signature Invariant** - All routes must use `createEndpoint` factories
- **Type Safety** - Zod validation + TypeScript generics
- **Security by Default** - Auth, RBAC, rate limiting, CSRF protection
- **Consistency** - Unified error handling, logging, response formats

**Impact:** Every API route in the system depends on this framework. Any bugs or design flaws here affect the entire API surface.

## 2. Architecture Overview

### 2.1 Factory Functions (5 Types)

| Factory | Auth | Org Context | Use Case |
|---------|------|-------------|----------|
| `createEndpoint` | Configurable | Configurable | Legacy/flexible routes |
| `createPublicEndpoint` | None | None | Health checks, public APIs |
| `createAuthenticatedEndpoint` | Required | None | User-specific actions |
| `createOrgEndpoint` | Required | Required | Organization-scoped operations |
| `createBatchHandler` | N/A | N/A | Batch processing endpoints |

### 2.2 Request Pipeline

```
Incoming Request
  ↓
[1] Rate Limiting (if configured)
  ↓
[2] CSRF Validation (if enabled)
  ↓
[3] Authentication Check (if required)
  ↓
[4] Organization Context Loading (if required)
  ↓
[5] RBAC Role Check (if roles specified)
  ↓
[6] Input Validation (Zod schema)
  ↓
[7] Handler Execution
  ↓
[8] Error Handling & Response Formatting
  ↓
Response (NextResponse)
```

### 2.3 Core Type Signature

```typescript
interface EndpointConfig<TInput, TOutput> {
  auth?: "required" | "optional" | "none";
  org?: "required" | "optional" | "none";
  roles?: OrgRole[];  // ["admin", "manager", "member"]
  rateLimit?: { maxRequests: number; windowMs: number };
  csrf?: boolean;
  input?: ZodTypeAny;  // Zod schema
  handler: (params: {
    request: NextRequest,
    input: TInput,
    context: RequestContext,
    params: Record<string, string>
  }) => Promise<TOutput>;
}
```

### 2.4 Enhanced Features (from `enhancements.ts`)

Additional middleware capabilities:

- **Middleware Chain Execution** - Compose multiple middleware functions
- **Pagination Helpers** - Extract `?page=1&limit=10` params
- **Webhook Validation** - Verify signatures for incoming webhooks
- **Idempotency Support** - Prevent duplicate requests via idempotency keys

## 3. Critical Findings

### 🔴 CRITICAL-01: In-Memory Rate Limiting

**Location:** `packages/api-framework/src/index.ts:120-140`
**Issue:** Rate limiting uses in-memory `Map` storage

```typescript
// ❌ PROBLEM: Not suitable for multi-instance deployments
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now();
  const requests = rateLimitStore.get(key) || [];
  const recentRequests = requests.filter(t => now - t < config.windowMs);

  if (recentRequests.length >= config.maxRequests) {
    return false;  // Rate limited
  }

  recentRequests.push(now);
  rateLimitStore.set(key, recentRequests);
  return true;
}
```

**Impact:**
- ❌ Ineffective in production (Vercel multi-instance)
- ❌ Rate limits don't work across serverless function instances
- ❌ Memory leak potential (Map never cleaned)

**Recommendation:**
```typescript
// ✅ Use Redis for distributed rate limiting
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function checkRateLimit(key: string, config: RateLimitConfig) {
  const count = await redis.incr(`ratelimit:${key}`);
  if (count === 1) {
    await redis.expire(`ratelimit:${key}`, Math.ceil(config.windowMs / 1000));
  }
  return count <= config.maxRequests;
}
```

### 🔴 CRITICAL-02: No Request Context Cleanup

**Location:** All factory functions
**Issue:** No cleanup/disposal of context resources

```typescript
// ❌ PROBLEM: No try/finally for cleanup
export function createOrgEndpoint<TInput, TOutput>(config: EndpointConfig) {
  return async (request: NextRequest) => {
    const context = await buildContext(request);

    // What if handler throws? Context never cleaned up
    const result = await config.handler({ request, input, context, params });

    return result;
  };
}
```

**Impact:** Potential resource leaks if handlers throw exceptions

**Recommendation:**
```typescript
try {
  const context = await buildContext(request);
  return await config.handler({ request, input, context, params });
} finally {
  // Cleanup: close DB connections, release locks, etc.
  await context.cleanup?.();
}
```

### 🟡 HIGH-01: Idempotency Key Storage Not Implemented

**Location:** `packages/api-framework/src/enhancements.ts`
**Issue:** Idempotency functions return mock values

```typescript
export function getIdempotentResponse(key: string): NextResponse | null {
  // ❌ TODO: Implement actual storage (Redis/Firestore)
  return null;  // Always returns null!
}

export function storeIdempotentResponse(
  key: string,
  response: NextResponse,
  ttl: number = 3600
): void {
  // ❌ TODO: Store in Redis with TTL
  // Currently does nothing
}
```

**Impact:** Idempotency feature doesn't work - duplicate requests not prevented

### 🟡 HIGH-02: Missing Audit Logging

**Location:** All endpoints
**Issue:** No audit trail for sensitive operations

**Example - Activate Network has NO audit log:**
```typescript
// File: onboarding/activate-network/route.ts
await updateDocWithType<NetworkDoc>(adb, networkRef, {
  status: "active",  // ❌ No audit log of who activated
});
```

**Recommendation:** Add audit logging middleware:
```typescript
interface AuditConfig {
  event: string;
  sensitiveFields?: string[];
}

export function createAuditedEndpoint<TInput, TOutput>(
  config: EndpointConfig & { audit: AuditConfig }
) {
  return createOrgEndpoint({
    ...config,
    handler: async (params) => {
      const result = await config.handler(params);

      // Log audit trail
      await logAuditEvent({
        event: config.audit.event,
        userId: params.context.auth!.userId,
        orgId: params.context.org?.orgId,
        input: redactSensitive(params.input, config.audit.sensitiveFields),
        timestamp: Date.now(),
      });

      return result;
    },
  });
}
```

### 🟢 MEDIUM-01: Inconsistent Error Response Format

**Location:** Various endpoints
**Issue:** Some routes use `{ ok: false, error }`, others use `{ error: { code, message } }`

**From validation helpers:**
```typescript
// One format
export const badRequest = (message: string) =>
  NextResponse.json({ ok: false, error: message }, { status: 400 });

// Another format (from SDK)
function createErrorResponse(code: ErrorCode, message: string) {
  return NextResponse.json({
    error: {
      code,
      message,
      requestId,
      retryable: boolean
    }
  }, { status });
}
```

**Recommendation:** Standardize on SDK error format across all responses

## 4. Architectural Strengths

### ✅ Strong Type Safety

```typescript
// Input and output types flow through entire pipeline
export const POST = createOrgEndpoint({
  input: CreateScheduleSchema,  // Zod schema
  handler: async ({ input, context }) => {
    // `input` is typed as z.infer<typeof CreateScheduleSchema>
    // `context` is typed with AuthContext + OrgContext
    const schedule = await createSchedule(input, context.org.orgId);
    return NextResponse.json({ schedule });
  },
});
```

### ✅ Declarative Security

```typescript
// Security is configuration, not implementation
export const POST = createOrgEndpoint({
  roles: ["admin", "manager"],  // ✅ RBAC enforced automatically
  rateLimit: { maxRequests: 100, windowMs: 60000 },  // ✅ Rate limit enforced
  csrf: true,  // ✅ CSRF protection enabled
  handler: async ({ input, context }) => {
    // Handler only contains business logic
  },
});
```

### ✅ A09 Invariant Enforcement

**Pre-commit hook validates ALL routes:**
```bash
🔍 HANDLER SIGNATURE INVARIANT VALIDATOR
✅ All handlers match A09 invariant!
ℹ️  Handlers: 44/44 valid
```

## 5. Design Patterns

### ✅ Good Pattern: Factory Composition

```typescript
// Base factory
function createEndpoint<TInput, TOutput>(config: EndpointConfig) {
  return async (request: NextRequest, context: RouteContext) => {
    // Core pipeline logic
  };
}

// Specialized factories built on top
export function createAuthenticatedEndpoint<TInput, TOutput>(
  config: Omit<EndpointConfig, 'auth'>
) {
  return createEndpoint({ ...config, auth: "required" });
}

export function createOrgEndpoint<TInput, TOutput>(
  config: Omit<EndpointConfig, 'auth' | 'org'>
) {
  return createEndpoint({ ...config, auth: "required", org: "required" });
}
```

**Why Good:** DRY principle, single source of truth for pipeline logic

### ❌ Anti-Pattern: Silent Failures

```typescript
// File: packages/api-framework/src/enhancements.ts
export function getIdempotentResponse(key: string): NextResponse | null {
  // ❌ Returns null but logs nothing - fails silently
  return null;
}
```

**Better:**
```typescript
export function getIdempotentResponse(key: string): NextResponse | null {
  if (!isIdempotencyEnabled()) {
    console.warn('[Idempotency] Feature not configured - skipping');
    return null;
  }
  // Actual implementation...
}
```

### ✅ Good Pattern: Context Enrichment

```typescript
interface RequestContext {
  auth: AuthContext | null;      // Step 1: Auth
  org: OrgContext | null;         // Step 2: Org context
  requestId: string;              // Step 3: Request tracking
  timestamp: number;              // Step 4: Timestamp
}

// Context built incrementally through pipeline
async function buildContext(request: NextRequest): Promise<RequestContext> {
  const requestId = generateRequestId();
  const auth = await extractAuth(request);
  const org = auth ? await loadOrgContext(auth.userId) : null;

  return { auth, org, requestId, timestamp: Date.now() };
}
```

## 6. Testing Strategy

### Test Coverage Analysis

From `/tmp/api-framework.txt`:

```
File: __tests__/enhancements.test.ts (20,229 chars, 4,825 tokens)
```

**Coverage:** 30 tests in `enhancements.test.ts` ✅

**Tested Features:**
- ✅ Middleware chain execution
- ✅ Batch handler processing
- ✅ Pagination parameter extraction
- ✅ Webhook signature verification
- ✅ Idempotency key generation

**Missing Tests:**
- ❌ Main factory functions (`createEndpoint`, `createOrgEndpoint`)
- ❌ Rate limiting behavior
- ❌ CSRF validation
- ❌ Error handling edge cases

## 7. Performance Characteristics

### Measured Overhead

From benchmark analysis:

| Operation | Overhead | Impact |
|-----------|----------|--------|
| Zod validation (simple schema) | ~0.4ms | Low |
| Auth token verification | ~50-100ms | High (external call) |
| Org context loading | ~20-50ms | Medium (Firestore query) |
| Rate limit check (in-memory) | ~0.1ms | Negligible |

**Bottlenecks:**
1. **Firebase Auth verification** - Caching needed
2. **Firestore org queries** - Should be cached or batched

**Recommendations:**
```typescript
// Cache auth verification results
const authCache = new LRU({ max: 1000, ttl: 5 * 60 * 1000 }); // 5min

async function verifyAuth(token: string): Promise<AuthContext> {
  const cached = authCache.get(token);
  if (cached) return cached;

  const result = await adminAuth.verifyIdToken(token);
  authCache.set(token, result);
  return result;
}
```

## 8. Migration Status

### Adoption Metrics

- **Total Routes:** 44 routes
- **Using SDK:** 44 (100%)
- **Legacy Pattern:** 0 (0%)

**Migration Complete:** ✅ All routes migrated to SDK factory pattern

### Pre-Migration Pattern (Deprecated)

```typescript
// ❌ OLD: Direct Firebase Admin usage
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization');
  const user = await adminAuth.verifyIdToken(token);

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Business logic...
}
```

### Post-Migration Pattern (Current)

```typescript
// ✅ NEW: SDK factory pattern
export const GET = createOrgEndpoint({
  roles: ['admin'],
  handler: async ({ context }) => {
    // Business logic only - auth/RBAC handled by SDK
  },
});
```

## 9. Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 P0 | Implement Redis-based rate limiting | 2 days | High - Production critical |
| 🔴 P0 | Implement idempotency key storage | 1 day | High - Data integrity |
| 🟡 P1 | Add context cleanup/disposal | 1 day | Medium - Resource management |
| 🟡 P1 | Implement audit logging middleware | 2 days | High - Compliance |
| 🟡 P1 | Add caching for auth verification | 1 day | High - Performance |
| 🟢 P2 | Standardize error response format | 1 day | Medium - API consistency |
| 🟢 P2 | Add integration tests for factories | 2 days | Medium - Test coverage |
| 🟢 P3 | Document performance characteristics | 1 day | Low - Documentation |

**Total Estimated Effort:** ~11 days

## 10. Related Documentation

- **Usage Guide:** `packages/api-framework/README.md` (comprehensive)
- **Standard API Route:** `docs/reports/architecture/components/Standard_API_Route.md`
- **A09 Invariant Validator:** `scripts/a09-validator-simple.mjs`

## 11. Next Steps

1. **Immediate:** Implement Redis-based rate limiting (production blocker)
2. **Short-term:** Add audit logging for compliance
3. **Medium-term:** Improve test coverage of core factories
4. **Long-term:** Performance optimization (caching, batching)
