# API Framework Quick Setup Guide

## ✅ Status Check

**SDK Installation**: ✅ Installed (`workspace:*` dependency)  
**Build Status**: ✅ Working (303ms ESM, 5045ms DTS)  
**Current Adoption**: ✅ 100% - All API routes using SDK factory pattern

## 🚀 Quick Start (5 minutes)

### 1. Verify Installation

```bash
# Check if SDK is installed
pnpm list @fresh-schedules/api-framework

# If missing, install it
pnpm add @fresh-schedules/api-framework --filter @apps/web

# Build the SDK
pnpm --filter @fresh-schedules/api-framework build
```

### 2. Integrate ESLint Rules (Optional)

```bash
# Run integration script
node scripts/integrate-sdk-eslint.js

# Or manually add to apps/web/eslint.config.mjs:
# ...require("@fresh-schedules/api-framework/eslint.config.js"),
```

### 3. Create Your First Endpoint

```typescript
// apps/web/app/api/example/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    return NextResponse.json({
      orgId: context.org!.orgId,
      message: "Hello from SDK!",
    });
  },
});
```

### 4. Test Your Endpoint

```bash
# Start dev server
pnpm dev

# Test endpoint (requires valid session + orgId)
curl "http://localhost:3000/api/example?orgId=your-org-id" \
  -H "Cookie: session=your-session-cookie"
```

## 📚 Complete Documentation

- **Full Usage Guide**: [`packages/api-framework/README.md`](./README.md)
- **Code Quality Integration**: Built-in ESLint rules for common patterns
- **Testing**: Mock utilities in `@fresh-schedules/api-framework/testing`
- **Migration**: Pattern to migrate from legacy `withSecurity` to SDK factory

## 🔧 Available Endpoint Types

```typescript
// 1. Public (no auth)
export const GET = createPublicEndpoint({...});

// 2. Authenticated (auth required)
export const GET = createAuthenticatedEndpoint({...});

// 3. Organization member (auth + org membership)
export const GET = createOrgEndpoint({...});

// 4. Admin only (auth + admin/org_owner role)
export const POST = createAdminEndpoint({...});

// 5. Rate limited public
export const POST = createRateLimitedEndpoint({...});
```

## ⚡ Common Patterns

### Input Validation

```typescript
import { CreateScheduleSchema } from "@fresh-schedules/types";

export const POST = createOrgEndpoint({
  input: CreateScheduleSchema, // Auto-validates
  handler: async ({ input, context }) => {
    // input is typed & validated
  },
});
```

### Role-Based Access

```typescript
export const POST = createOrgEndpoint({
  roles: ["manager"], // manager, admin, org_owner can access
  handler: async ({ context }) => {
    // context.org.role is guaranteed to be manager+
  },
});
```

### Rate Limiting

```typescript
export const POST = createOrgEndpoint({
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  handler: async () => {
    /* ... */
  },
});
```

## 🛟 Need Help

1. **Check Examples**: Look at existing routes in `apps/web/app/api/`
2. **Read Full Guide**: Complete documentation in the README
3. **Check ESLint**: SDK includes safeguard rules for common patterns
4. **Run Validation**: `node scripts/validate-patterns.mjs`

## 📊 Benefits of SDK Factory

- **90% less boilerplate** vs legacy `withSecurity` pattern
- **Type-safe contexts** with IntelliSense support
- **Automatic validation** with clear error messages
- **Built-in security** (CSRF, auth, RBAC, rate limiting)
- **Consistent logging** and audit trails
- **Easy testing** with comprehensive mock utilities

## 🎯 What You Get

Every endpoint automatically includes:

1. **Rate Limiting** (Redis-backed)
2. **Authentication** (Firebase session cookies)
3. **CSRF Protection** (POST/PUT/PATCH/DELETE)
4. **Organization Context** (membership + role)
5. **Role Authorization** (hierarchical permissions)
6. **Input Validation** (Zod schemas)
7. **Error Handling** (standardized responses)
8. **Audit Logging** (success/failure tracking)

Ready to build secure, consistent APIs! 🚀
