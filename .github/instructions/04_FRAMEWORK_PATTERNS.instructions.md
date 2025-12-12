---
applyTo: "apps/**,packages/**"
description: "Framework-specific patterns for Next.js, Firebase, Tailwind, and monorepo structure."
priority: 4
---

# Framework Patterns

## Next.js 16 (App Router)

### Project Structure

```
apps/web/
├── app/                    # Routes, layouts, API endpoints
│   ├── api/               # API routes
│   ├── (auth)/            # Route groups (no URL impact)
│   └── dashboard/         # Feature routes
├── src/lib/               # Client utilities
├── lib/                   # Server utilities (legacy)
├── public/                # Static assets
└── components/            # Shared components
```

### Server vs Client Components

**Server Components (Default)**

- Data fetching
- Heavy computation
- Non-interactive UI
- Direct database access

**Client Components**

- Add `'use client'` at top
- Interactivity (onClick, useState)
- Browser APIs
- Hooks

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
'use client';
export default function Button() {
  const [clicked, setClicked] = useState(false);
  return <button onClick={() => setClicked(true)}>Click</button>;
}
```

### Never Use `next/dynamic` with `ssr: false` in Server Components

```typescript
// ❌ Bad - Will error
import dynamic from "next/dynamic";
const ClientComponent = dynamic(() => import("./Client"), { ssr: false });

// ✅ Good - Import directly, mark Client component with 'use client'
import ClientComponent from "./ClientComponent";
```

### API Routes (Route Handlers)

```typescript
// app/api/example/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { InputSchema } from "@fresh-schedules/types";

export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    return NextResponse.json({ orgId: context.org!.orgId });
  },
});

export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: InputSchema,
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  handler: async ({ input, context }) => {
    return NextResponse.json({ success: true }, { status: 201 });
  },
});
```

### Route Groups

```
app/
├── (marketing)/          # No /marketing in URL
│   ├── about/page.tsx   # /about
│   └── pricing/page.tsx # /pricing
├── (dashboard)/          # No /dashboard in URL
│   ├── settings/page.tsx # /settings
└── api/                  # API routes
```

---

## Firebase (Admin SDK)

### Initialization

```typescript
// lib/firebase-admin.ts
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

export const db = getFirestore();
export const auth = getAuth();
```

### Collection Paths

```
/users/{userId}                                    # User profiles
/orgs/{orgId}                                      # Organizations
/orgs/{orgId}/schedules/{scheduleId}              # Schedules
/orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId}  # Shifts
/orgs/{orgId}/positions/{positionId}              # Positions
/memberships/{userId}_{orgId}                      # Memberships
```

### Query Pattern (Always Org-Scoped)

```typescript
// ✅ Correct - scoped to organization
const snapshot = await db
  .collection(`orgs/${context.org!.orgId}/schedules`)
  .where("status", "==", "active")
  .orderBy("startDate", "desc")
  .limit(50)
  .get();

// ❌ Wrong - no org scoping
const snapshot = await db.collection("schedules").get();
```

### Firestore Rules Helper Functions

```javascript
// firestore.rules
function isSignedIn() {
  return request.auth != null;
}

function isOrgMember(orgId) {
  return exists(/databases/$(database)/documents/memberships/$(uid() + "_" + orgId));
}

function hasAnyRole(orgId, roles) {
  return isOrgMember(orgId)
    && get(/databases/$(database)/documents/memberships/$(uid() + "_" + orgId))
       .data.role in roles;
}
```

### Firebase Typing Strategy

```typescript
// ✅ Use FirebaseFirestore namespace for types
import { FirebaseFirestore } from "@google-cloud/firestore";

type DocumentReference = FirebaseFirestore.DocumentReference;
type QuerySnapshot = FirebaseFirestore.QuerySnapshot;

// ❌ Don't use firebase-admin/firestore types directly in type positions
```

---

## Tailwind CSS

### Class Organization

```tsx
// Order: Layout → Sizing → Spacing → Typography → Colors → Effects
<div className="
  flex flex-col          {/* Layout */}
  w-full max-w-md        {/* Sizing */}
  p-4 gap-2              {/* Spacing */}
  text-sm font-medium    {/* Typography */}
  bg-white text-gray-900 {/* Colors */}
  rounded-lg shadow-md   {/* Effects */}
">
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  text-sm              {/* Mobile */}
  md:text-base         {/* Tablet */}
  lg:text-lg           {/* Desktop */}
">
```

### Custom Components

```tsx
// Use cva for variant styling
import { cva } from "class-variance-authority";

const buttonVariants = cva("inline-flex items-center justify-center rounded-md font-medium", {
  variants: {
    variant: {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
```

---

## Monorepo Structure (pnpm + Turbo)

### Package Organization

```
packages/
├── api-framework/     # SDK factory for API routes
├── types/             # Zod schemas (single source of truth)
├── ui/                # Shared UI components
├── config/            # Shared configuration
├── env/               # Environment handling
└── rules-tests/       # Firestore rules test utilities
```

### Package Manager: pnpm ONLY

```bash
# ❌ Never use
npm install
yarn add

# ✅ Always use
pnpm install --frozen-lockfile
pnpm add <package> --filter @apps/web
```

### Turbo Tasks

```bash
pnpm dev          # Start dev servers
pnpm build        # Build all packages
pnpm test         # Run tests
pnpm typecheck    # TypeScript check
pnpm lint         # ESLint check
```

### Path Aliases

```typescript
// ✅ Use aliases
import { helper } from "@/src/lib/helpers";
import { Schema } from "@fresh-schedules/types";

// ❌ Don't use deep relative imports
import { helper } from "../../../src/lib/helpers";
```

---

## SDK Factory Pattern (Required)

### Factory Types

```typescript
// Public - no auth
createPublicEndpoint({ handler })

// Authenticated - auth required
createAuthenticatedEndpoint({ handler })

// Organization - auth + org membership
createOrgEndpoint({ handler, roles?, rateLimit?, input? })

// Admin - auth + admin role
createAdminEndpoint({ handler })

// Rate limited public
createRateLimitedEndpoint({ rateLimit, handler })
```

### Complete Example

```typescript
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

export const POST = createOrgEndpoint({
  roles: ["manager"],
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateScheduleSchema,
  handler: async ({ input, context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const schedule = {
      ...input,
      orgId: context.org!.orgId,
      createdBy: context.auth!.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(`orgs/${context.org!.orgId}/schedules`).add(schedule);

    return NextResponse.json({ id: docRef.id, ...schedule }, { status: 201 });
  },
});
```

---

## Zod-First Validation (Triad of Trust)

### Every Domain Entity Has Three Parts

1. **Zod Schema** in `packages/types/src/`
2. **API Route** in `apps/web/app/api/`
3. **Firestore Rules** in `firestore.rules`

### Schema Pattern

```typescript
// packages/types/src/entity.ts
import { z } from "zod";

export const EntitySchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string().min(1).max(100),
  status: z.enum(["active", "inactive"]).default("active"),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export type Entity = z.infer<typeof EntitySchema>;

export const CreateEntitySchema = EntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateEntitySchema = EntitySchema.partial().omit({
  id: true,
  orgId: true,
});
```

---

**Last Updated**: December 8, 2025
