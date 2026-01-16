# PostgreSQL Migration Strategy: Firebase Exit Plan
**Version**: 1.0\
**Created**: December 22, 2025\
**Purpose**: Comprehensive escape hatch when Firebase costs exceed budget or features don't meet
needs

---

## Executive Summary
This document provides a **complete migration path from Firebase to PostgreSQL** for the Fresh
Schedules application. It's designed as an **escape hatch** to be executed when:

1. Firebase costs exceed acceptable thresholds
2. Firebase feature limitations block product requirements
3. You need SQL capabilities (complex queries, joins, aggregations)
4. You want to own your infrastructure completely

**Philosophy**: Build fast on Firebase now, migrate strategically later.

---

## Part 1: Decision Triggers
### When to Migrate
| Trigger              | Threshold                 | Action                     |
| -------------------- | ------------------------- | -------------------------- |
| **Monthly Cost**     | > $500/month sustained    | Begin Phase 1 planning     |
| **Read Operations**  | > 10M reads/month         | Evaluate read patterns     |
| **Write Operations** | > 1M writes/month         | Consider write batching    |
| **Storage**          | > 50GB                    | Evaluate data archival     |
| **Feature Gap**      | Blocking for 2+ sprints   | Migrate affected subsystem |
| **Performance**      | Query latency > 500ms p95 | Optimize or migrate        |

### Cost Projection Model
```
Firebase Blaze Plan Estimates (as of 2025):
- Firestore reads: $0.036 per 100K reads
- Firestore writes: $0.108 per 100K writes
- Firestore storage: $0.108 per GB/month
- Auth: Free up to 50K MAU, then $0.0055/MAU
- Functions: $0.40 per million invocations + compute time
- Storage: $0.026 per GB/month

Break-even Point (vs self-hosted PostgreSQL):
- ~5M reads/month + ~500K writes/month ≈ $30/month Firebase
- Self-hosted PostgreSQL (Railway/Render): $7-20/month
- Migration engineering cost: ~40-80 hours

Decision: Migrate when Firebase > $100/month OR feature-blocked
```

---

## Part 2: Target Architecture
### Current Stack (Firebase)
```
┌─────────────────────────────────────────────────────────┐
│                    Fresh Schedules                       │
├─────────────────────────────────────────────────────────┤
│  Frontend: Next.js 16 (App Router)                       │
│  Auth: Firebase Authentication                           │
│  Database: Firestore (NoSQL)                             │
│  Storage: Firebase Cloud Storage                         │
│  Functions: Firebase Cloud Functions (Node.js)           │
│  Hosting: Vercel                                         │
└─────────────────────────────────────────────────────────┘
```

### Target Stack (PostgreSQL)
```
┌─────────────────────────────────────────────────────────┐
│                    Fresh Schedules                       │
├─────────────────────────────────────────────────────────┤
│  Frontend: Next.js 16 (App Router) [unchanged]           │
│  Auth: Supabase Auth OR Auth.js (NextAuth)               │
│  Database: PostgreSQL (Supabase/Neon/Railway)            │
│  ORM: Prisma OR Drizzle ORM                              │
│  Storage: Supabase Storage OR S3/R2                      │
│  Functions: Vercel Functions OR Supabase Edge Functions  │
│  Hosting: Vercel [unchanged]                             │
└─────────────────────────────────────────────────────────┘
```

### Recommended Provider: **Supabase**
| Feature   | Firebase            | Supabase                          |
| --------- | ------------------- | --------------------------------- |
| Auth      | Firebase Auth       | Supabase Auth (same API patterns) |
| Database  | Firestore (NoSQL)   | PostgreSQL (SQL)                  |
| Real-time | Firestore listeners | PostgreSQL subscriptions          |
| Storage   | Cloud Storage       | Supabase Storage (S3-compatible)  |
| Functions | Cloud Functions     | Edge Functions (Deno)             |
| Pricing   | Pay-per-use         | $25/month Pro tier                |
| Self-host | No                  | Yes (Docker)                      |

---

## Part 3: Data Model Translation
### Firestore → PostgreSQL Schema Mapping
#### Organizations
**Firestore Path**: `/organizations/{orgId}`

```sql
-- PostgreSQL equivalent
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('corporate', 'organization', 'network')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);
```

#### Memberships
**Firestore Path**: `/memberships/{membership_id}` (composite: `{userId}_{orgId}`)

```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('staff', 'corporate', 'scheduler', 'manager', 'admin', 'org_owner')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_org ON memberships(org_id);
CREATE INDEX idx_memberships_role ON memberships(role);
```

#### Schedules
**Firestore Path**: `/orgs/{orgId}/schedules/{scheduleId}`

```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  venue_id UUID REFERENCES venues(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_org ON schedules(org_id);
CREATE INDEX idx_schedules_week ON schedules(week_start, week_end);
CREATE INDEX idx_schedules_status ON schedules(status);
```

#### Shifts
**Firestore Path**: `/orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId}`

```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id),
  position_id UUID REFERENCES positions(id),
  user_id UUID REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_shifts_schedule ON shifts(schedule_id);
CREATE INDEX idx_shifts_org ON shifts(org_id);
CREATE INDEX idx_shifts_user ON shifts(user_id);
CREATE INDEX idx_shifts_time ON shifts(start_time, end_time);
```

#### Positions
**Firestore Path**: `/orgs/{orgId}/positions/{positionId}`

```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  hourly_rate DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_positions_org ON positions(org_id);
CREATE INDEX idx_positions_active ON positions(is_active);
```

#### Users (Auth)
**Firebase Auth** → **Supabase Auth** (automatic) OR custom users table

```sql
-- If using custom auth (Auth.js)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  photo_url TEXT,
  phone TEXT,
  provider TEXT, -- 'email', 'google', 'microsoft'
  provider_id TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### Metrics (New - for Ops Hub)
```sql
CREATE TABLE build_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  repository TEXT NOT NULL,
  ref TEXT NOT NULL,
  sha TEXT NOT NULL,
  run_id TEXT NOT NULL,
  run_attempt TEXT,
  install_seconds INTEGER NOT NULL,
  build_seconds INTEGER NOT NULL,
  sdk_seconds INTEGER NOT NULL,
  total_seconds INTEGER NOT NULL,
  cache_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_build_metrics_timestamp ON build_metrics(timestamp DESC);
CREATE INDEX idx_build_metrics_sha ON build_metrics(sha);
```

---

## Part 4: Migration Phases
### Phase 0: Preparation (1-2 days)
1. **Set up PostgreSQL instance**
   - Supabase: Create project at supabase.com
   - Neon: Create database at neon.tech
   - Railway: Create PostgreSQL service

1. **Install ORM**

   ```bash
   pnpm add prisma @prisma/client --filter @apps/web
   pnpm add -D prisma --filter @apps/web
   npx prisma init
   ```

1. **Create schema.prisma**
   - Translate all Firestore collections to Prisma models
   - Generate migrations: `npx prisma migrate dev`

1. **Set up database abstraction layer**

   ```typescript
   // packages/database/src/index.ts
   export interface DatabaseClient {
     users: UserRepository;
     organizations: OrganizationRepository;
     memberships: MembershipRepository;
     schedules: ScheduleRepository;
     shifts: ShiftRepository;
     positions: PositionRepository;
   }

   // Create both implementations
   export { FirestoreClient } from "./firestore";
   export { PostgresClient } from "./postgres";
   ```

### Phase 1: Shadow Writes (1 week)
1. **Enable dual-write mode**
   - All writes go to both Firestore AND PostgreSQL
   - Reads still come from Firestore (source of truth)
   - Monitor for discrepancies

1. **Data sync script**

   ```typescript
   // scripts/sync-to-postgres.ts
   async function syncCollection(collectionPath: string, tableName: string) {
     const snapshot = await firestore.collection(collectionPath).get();

     for (const doc of snapshot.docs) {
       await prisma[tableName].upsert({
         where: { id: doc.id },
         update: transformDoc(doc.data()),
         create: { id: doc.id, ...transformDoc(doc.data()) },
       });
     }
   }
   ```

1. **Validation queries**
   - Count comparison: Firestore vs PostgreSQL
   - Sample comparison: Random 100 records
   - Hash comparison: Full data integrity check

### Phase 2: Read Migration (1 week)
1. **Create feature flag**

   ```typescript
   const USE_POSTGRES = process.env.DATABASE_PROVIDER === "postgres";
   ```

1. **Migrate reads one API route at a time**
   - Start with low-traffic, non-critical routes
   - Monitor latency and errors
   - Roll back if issues detected

1. **Order of migration (by risk)**
   2. `GET /api/ops/*` (internal only)
   3. `GET /api/positions` (simple CRUD)
   4. `GET /api/venues` (simple CRUD)
   5. `GET /api/schedules` (medium complexity)
   6. `GET /api/shifts` (high volume)
   7. Auth-related reads (highest risk)

### Phase 3: Write Migration (1 week)
1. **Switch writes to PostgreSQL-first**
   - PostgreSQL is now source of truth
   - Shadow-write to Firestore (for rollback capability)

1. **Update all POST/PUT/PATCH/DELETE handlers**

1. **Run full test suite against PostgreSQL**

### Phase 4: Cleanup (2-3 days)
1. **Disable Firestore writes**
2. **Remove dual-write code**
3. **Archive Firestore data (export to JSON)**
4. **Delete Firestore collections**
5. **Update Firebase billing to Spark (free) tier**

---

## Part 5: Auth Migration
### Option A: Supabase Auth (Recommended)
**Pros**: Drop-in replacement, similar API, built-in row-level security\
**Cons**: Vendor lock-in (but less than Firebase)

```typescript
// Before (Firebase)
import { getAuth } from "firebase-admin/auth";
const auth = getAuth();
const user = await auth.verifyIdToken(token);

// After (Supabase)
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(url, key);
const {
  data: { user },
} = await supabase.auth.getUser(token);
```

### Option B: Auth.js (NextAuth)
**Pros**: Open source, self-hosted, flexible providers\
**Cons**: More setup, manage sessions yourself

```typescript
// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});
```

### User Migration Script
```typescript
// scripts/migrate-users.ts
import { getAuth } from "firebase-admin/auth";
import { createClient } from "@supabase/supabase-js";

async function migrateUsers() {
  const firebaseAuth = getAuth();
  const supabase = createClient(url, serviceRoleKey);

  let nextPageToken: string | undefined;

  do {
    const result = await firebaseAuth.listUsers(1000, nextPageToken);

    for (const user of result.users) {
      await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: user.emailVerified,
        user_metadata: {
          display_name: user.displayName,
          photo_url: user.photoURL,
          firebase_uid: user.uid, // Keep for reference
        },
      });
    }

    nextPageToken = result.pageToken;
  } while (nextPageToken);
}
```

---

## Part 6: Real-time Migration
### Firestore Real-time → PostgreSQL Subscriptions
**Option A: Supabase Realtime**

```typescript
// Before (Firestore)
const unsubscribe = onSnapshot(collection(db, `orgs/${orgId}/schedules`), (snapshot) => {
  setSchedules(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

// After (Supabase)
const channel = supabase
  .channel("schedules")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "schedules",
      filter: `org_id=eq.${orgId}`,
    },
    (payload) => {
      setSchedules((prev) => updateSchedules(prev, payload));
    },
  )
  .subscribe();
```

**Option B: WebSockets (Custom)**

```typescript
// Use Socket.io or Pusher for custom real-time
import Pusher from "pusher-js";

const pusher = new Pusher(key, { cluster: "us2" });
const channel = pusher.subscribe(`org-${orgId}`);

channel.bind("schedule-updated", (data) => {
  setSchedules((prev) => [...prev.filter((s) => s.id !== data.id), data]);
});
```

---

## Part 7: Storage Migration
### Firebase Storage → Supabase Storage (or S3/R2)
```typescript
// Migration script
import { getStorage } from "firebase-admin/storage";
import { createClient } from "@supabase/supabase-js";

async function migrateStorage() {
  const firebaseBucket = getStorage().bucket();
  const supabase = createClient(url, key);

  const [files] = await firebaseBucket.getFiles();

  for (const file of files) {
    const [content] = await file.download();

    await supabase.storage.from("uploads").upload(file.name, content, {
      contentType: file.metadata.contentType,
    });
  }
}
```

---

## Part 8: Functions Migration
### Firebase Functions → Vercel Functions
Most Cloud Functions can be converted to Next.js API routes or Vercel Edge Functions.

```typescript
// Before: Firebase Function
import { onCall } from "firebase-functions/v2/https";

export const processPayment = onCall(async (request) => {
  const { amount, customerId } = request.data;
  // Process payment
  return { success: true };
});

// After: Next.js API Route
// apps/web/app/api/payments/process/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

export const POST = createOrgEndpoint({
  roles: ["admin"],
  input: PaymentSchema,
  handler: async ({ input }) => {
    const { amount, customerId } = input;
    // Process payment
    return NextResponse.json({ success: true });
  },
});
```

### Firestore Triggers → PostgreSQL Triggers or Webhooks
```sql
-- PostgreSQL trigger example
CREATE OR REPLACE FUNCTION notify_shift_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('shift_changes', json_build_object(
    'operation', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'data', to_json(NEW)
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shift_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON shifts
FOR EACH ROW EXECUTE FUNCTION notify_shift_change();
```

---

## Part 9: Rollback Plan
If PostgreSQL migration fails at any phase:

### Phase 1-2 Rollback (Shadow/Read)
1. Disable feature flag: `DATABASE_PROVIDER=firestore`
2. All traffic returns to Firestore immediately
3. No data loss (Firestore remained source of truth)

### Phase 3 Rollback (Write)
1. Re-enable Firestore writes
2. Sync any PostgreSQL-only changes back to Firestore
3. Disable PostgreSQL writes

### Full Rollback
1. Keep PostgreSQL as backup
2. Restore Firestore as primary
3. Document lessons learned
4. Plan for retry with fixes

---

## Part 10: Cost Comparison
### Current Firebase (Estimated at Scale)
| Resource          | Usage          | Monthly Cost   |
| ----------------- | -------------- | -------------- |
| Firestore reads   | 5M             | $18            |
| Firestore writes  | 500K           | $54            |
| Firestore storage | 10GB           | $1.08          |
| Auth (MAU)        | 5K             | Free           |
| Cloud Functions   | 1M invocations | $0.40          |
| Cloud Storage     | 20GB           | $0.52          |
| **Total**         |                | **~$75/month** |

### PostgreSQL (Supabase Pro)
| Resource       | Included                       | Monthly Cost  |
| -------------- | ------------------------------ | ------------- |
| Database       | 8GB storage, unlimited queries | $25           |
| Auth           | 100K MAU                       | Included      |
| Edge Functions | 2M invocations                 | Included      |
| Storage        | 100GB                          | Included      |
| Realtime       | 500 concurrent                 | Included      |
| **Total**      |                                | **$25/month** |

### Break-even Analysis
- Firebase < $25/month → Stay on Firebase
- Firebase $25-100/month → Monitor, plan migration
- Firebase > $100/month → Execute migration

---

## Part 11: Timeline Summary
| Phase                  | Duration      | Milestone                           |
| ---------------------- | ------------- | ----------------------------------- |
| **0: Preparation**     | 1-2 days      | PostgreSQL instance + ORM setup     |
| **1: Shadow Writes**   | 1 week        | Dual-write enabled, data synced     |
| **2: Read Migration**  | 1 week        | All reads from PostgreSQL           |
| **3: Write Migration** | 1 week        | PostgreSQL is source of truth       |
| **4: Cleanup**         | 2-3 days      | Firestore archived, billing reduced |
| **Total**              | **3-4 weeks** | Full migration complete             |

---

## Appendix: Quick Reference
### Environment Variables (PostgreSQL)
```bash
# Supabase
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"

# Or Neon
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# Or Railway
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/railway"
```

### Useful Commands
```bash
# Prisma
npx prisma migrate dev          # Create and apply migration
npx prisma db push              # Push schema without migration
npx prisma generate             # Generate client
npx prisma studio               # Visual database browser

# Supabase CLI
supabase init                   # Initialize project
supabase db reset               # Reset local database
supabase db dump                # Export schema
supabase functions deploy       # Deploy edge functions
```

### Key Files to Create
```
packages/database/
├── src/
│   ├── index.ts                # Database abstraction
│   ├── firestore.ts            # Firestore implementation
│   ├── postgres.ts             # PostgreSQL implementation
│   └── types.ts                # Shared types
├── prisma/
│   ├── schema.prisma           # Prisma schema
│   └── migrations/             # Migration files
└── package.json
```
