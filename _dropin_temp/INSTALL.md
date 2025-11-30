# Drop-In Implementation Files for Fresh Schedules

These files drop directly into your existing project. No new workspace needed.

---

## 📁 What's Included

```
drop-in/
├── INSTALL.md                      ← You're reading it
├── EXAMPLE_ROUTE_MIGRATION.ts      ← Before/After migration example
│
├── packages/api-framework/         ← NEW PACKAGE: The Internal SDK
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                ← createEndpoint() and wrappers
│       └── testing.ts              ← Test utilities
│
├── functions/src/
│   ├── _ADD_TO_INDEX.ts            ← Exports to add to your index.ts
│   ├── joinOrganization.ts         ← Atomic join flow (Critical Fix C1)
│   └── triggers/
│       └── denormalization.ts      ← N+1 query fix (Critical Fix C6)
│
├── tests/integration/
│   ├── setup.ts                    ← Test setup with emulators
│   └── join-organization.test.ts   ← Integration tests
│
├── vitest.integration.config.ts    ← Test config (add to root)
├── firestore.rules                 ← Updated security rules
└── firestore.indexes.json          ← Required indexes
```

---

## 🚀 Installation Steps

### Step 1: Copy the api-framework package

```bash
# From your project root
cp -r [drop-in]/packages/api-framework packages/
```

### Step 2: Update pnpm-workspace.yaml

Make sure your workspace includes packages:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Step 3: Copy Cloud Functions

```bash
cp [drop-in]/functions/src/joinOrganization.ts functions/src/
mkdir -p functions/src/triggers
cp [drop-in]/functions/src/triggers/denormalization.ts functions/src/triggers/
```

### Step 4: Update functions/src/index.ts

Add these exports to your existing file:

```typescript
// Atomic join flow
export { joinOrganization } from "./joinOrganization";

// Denormalization triggers
export {
  onZoneWrite,
  onMembershipWrite,
  onUserProfileUpdate,
  onScheduleUpdate,
  reconcileOrgStats,
} from "./triggers/denormalization";
```

### Step 5: Copy integration tests

```bash
mkdir -p tests/integration
cp [drop-in]/tests/integration/* tests/integration/
cp [drop-in]/vitest.integration.config.ts .
```

### Step 6: Add test script to package.json

```json
{
  "scripts": {
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

### Step 7: Update Firestore configuration

**Merge** (don't replace) the rules and indexes:

```bash
# Review and merge manually:
cat [drop-in]/firestore.rules
cat [drop-in]/firestore.indexes.json
```

### Step 8: Install dependencies

```bash
pnpm install
```

---

## ✅ Verification

```bash
# 1. Start Firebase emulators
firebase emulators:start --only auth,firestore,functions

# 2. Run integration tests (in another terminal)
pnpm test:integration

# 3. Should see all tests pass
```

---

## 🔄 Migrating Your Routes

See `EXAMPLE_ROUTE_MIGRATION.ts` for the before/after pattern.

**Quick version:**

```typescript
// BEFORE: 100 lines of middleware composition
export const GET = withSecurity(requireOrgMembership(requireRole(['admin'])(...)))

// AFTER: 25 lines, declarative
import { createOrgEndpoint } from '@fresh-schedules/api-framework';

export const GET = createOrgEndpoint({
  roles: ['admin'],
  input: MySchema,
  handler: async ({ input, context }) => {
    // Just your business logic
  },
});
```

---

## 📋 Migration Priority

Migrate these routes first (highest risk):

1. `/api/onboarding/create-network-org/route.ts` - Transaction boundary
2. `/api/organizations/route.ts` - N+1 query fix
3. `/api/positions/route.ts` - Good starter example
4. `/api/venues/route.ts` - Uses denormalized zones
5. `/api/schedules/route.ts` - Complex permissions

---

## 🚢 Deployment

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy security rules
firebase deploy --only firestore:rules
```

---

## ❓ Troubleshooting

### "Module not found: @fresh-schedules/api-framework"

Make sure you:

1. Copied the package to `packages/api-framework/`
2. Updated `pnpm-workspace.yaml`
3. Ran `pnpm install`

### "Firebase Admin not initialized"

The SDK expects Firebase Admin to be initialized. Make sure your `lib/firebase-admin.ts` initializes the app before any route uses the SDK.

### Tests fail with "Connection refused"

Make sure Firebase emulators are running:

```bash
firebase emulators:start --only auth,firestore,functions
```

---

## 📊 What This Fixes

| Finding                       | File                  | Fix                                       |
| ----------------------------- | --------------------- | ----------------------------------------- |
| C1: No Transaction Boundaries | `joinOrganization.ts` | Atomic transaction + compensating actions |
| C6: N+1 Query                 | `denormalization.ts`  | Cached data via triggers                  |
| H1: Auth Coverage 41%         | `api-framework/`      | Auth required by default                  |
| H4: No Idempotency            | `joinOrganization.ts` | Token-based idempotency                   |
| C4: CSRF 21%                  | `api-framework/`      | CSRF option in config                     |

---

_Generated by Architectural Review Panel v2.0_
