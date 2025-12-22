# Section-Specific PostgreSQL Migration Guides

**Version**: 1.0  
**Created**: December 22, 2025  
**Parent Document**: [POSTGRESQL_MIGRATION_STRATEGY.md](./POSTGRESQL_MIGRATION_STRATEGY.md)

---

## Overview

This document provides **detailed migration guides for each subsystem** of Fresh Schedules. Each section can be migrated independently, allowing for incremental migration.

---

## Section 1: Authentication

### Current State (Firebase Auth)

**Files**:
- `apps/web/lib/firebase-admin.ts` - Server-side auth verification
- `apps/web/app/lib/firebaseClient.ts` - Client-side auth
- `apps/web/src/lib/auth-context.tsx` - React auth context
- `apps/web/app/api/session/route.ts` - Session cookie management

**Features Used**:
- Email/password authentication
- Google OAuth
- Session cookies (5-day expiry)
- ID token verification
- Custom claims (optional)

### Target State

**Option A: Supabase Auth** (Recommended - minimal code changes)

**Option B: Auth.js (NextAuth)** (Self-hosted, more control)

### Migration Steps (Supabase Auth)

#### Step 1: Install Supabase Client

```bash
pnpm add @supabase/supabase-js @supabase/ssr --filter @apps/web
```

#### Step 2: Create Supabase Client Utilities

```typescript
// apps/web/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
```

```typescript
// apps/web/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### Step 3: Update Auth Context

```typescript
// apps/web/src/lib/auth-context.tsx (AFTER)
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

#### Step 4: Update API Route Auth Verification

```typescript
// packages/api-framework/src/middleware/auth.ts (AFTER)
import { createClient } from "@/lib/supabase/server";

export async function verifyAuth(request: NextRequest): Promise<AuthContext | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;
  
  return {
    userId: user.id,
    email: user.email!,
    emailVerified: user.email_confirmed_at !== null,
    customClaims: user.user_metadata,
  };
}
```

#### Step 5: Migrate Users

```typescript
// scripts/migrate-auth-users.ts
import { getAuth } from "firebase-admin/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateUsers() {
  const firebaseAuth = getAuth();
  let nextPageToken: string | undefined;
  let migrated = 0;
  
  do {
    const result = await firebaseAuth.listUsers(1000, nextPageToken);
    
    for (const user of result.users) {
      try {
        await supabase.auth.admin.createUser({
          email: user.email!,
          email_confirm: user.emailVerified,
          password: undefined, // Users will need to reset password
          user_metadata: {
            display_name: user.displayName,
            photo_url: user.photoURL,
            firebase_uid: user.uid,
            migrated_at: new Date().toISOString(),
          },
        });
        migrated++;
      } catch (err) {
        console.error(`Failed to migrate ${user.email}:`, err);
      }
    }
    
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  
  console.log(`✅ Migrated ${migrated} users`);
}
```

### Rollback Plan

1. Keep Firebase Auth enabled during transition
2. Both auth systems can coexist (check Supabase first, fallback to Firebase)
3. Full rollback: Revert to original auth-context.tsx

---

## Section 2: Data Layer (Firestore → PostgreSQL)

### Current State

**Files**:
- `apps/web/lib/firebase-admin.ts` - `getFirebaseAdminDb()`
- `apps/web/src/lib/firebase/typed-wrappers.ts` - Type-safe Firestore operations
- All API routes under `apps/web/app/api/`

**Collections**:
- `/organizations/{orgId}`
- `/organizations/{orgId}/members/{userId}`
- `/orgs/{orgId}/schedules/{scheduleId}`
- `/orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId}`
- `/orgs/{orgId}/positions/{positionId}`
- `/orgs/{orgId}/venues/{venueId}`
- `/memberships/{membershipId}`
- `/users/{userId}`

### Target State

PostgreSQL with Prisma ORM + Supabase (or Neon/Railway)

### Migration Steps

#### Step 1: Set Up Prisma

```bash
pnpm add prisma @prisma/client --filter @apps/web
pnpm add -D prisma --filter @apps/web
cd apps/web && npx prisma init
```

#### Step 2: Create Prisma Schema

```prisma
// apps/web/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid()) @db.Uuid
  email         String   @unique
  displayName   String?  @map("display_name")
  photoUrl      String?  @map("photo_url")
  phone         String?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  memberships   Membership[]
  createdShifts Shift[]     @relation("ShiftCreator")
  assignedShifts Shift[]    @relation("ShiftAssignee")
  
  @@map("users")
}

model Organization {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  type      String   @default("organization")
  status    String   @default("active")
  settings  Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  memberships Membership[]
  schedules   Schedule[]
  positions   Position[]
  venues      Venue[]
  
  @@map("organizations")
}

model Membership {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  orgId     String   @map("org_id") @db.Uuid
  role      String   @default("staff")
  status    String   @default("active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  @@unique([userId, orgId])
  @@map("memberships")
}

model Schedule {
  id          String    @id @default(uuid()) @db.Uuid
  orgId       String    @map("org_id") @db.Uuid
  name        String
  weekStart   DateTime  @map("week_start") @db.Date
  weekEnd     DateTime  @map("week_end") @db.Date
  venueId     String?   @map("venue_id") @db.Uuid
  status      String    @default("draft")
  publishedAt DateTime? @map("published_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  venue        Venue?       @relation(fields: [venueId], references: [id])
  shifts       Shift[]
  
  @@map("schedules")
}

model Shift {
  id         String   @id @default(uuid()) @db.Uuid
  scheduleId String   @map("schedule_id") @db.Uuid
  positionId String?  @map("position_id") @db.Uuid
  userId     String?  @map("user_id") @db.Uuid
  createdBy  String?  @map("created_by") @db.Uuid
  startTime  DateTime @map("start_time")
  endTime    DateTime @map("end_time")
  status     String   @default("draft")
  notes      String?
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  
  schedule Schedule  @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  position Position? @relation(fields: [positionId], references: [id])
  assignee User?     @relation("ShiftAssignee", fields: [userId], references: [id])
  creator  User?     @relation("ShiftCreator", fields: [createdBy], references: [id])
  
  @@map("shifts")
}

model Position {
  id          String   @id @default(uuid()) @db.Uuid
  orgId       String   @map("org_id") @db.Uuid
  name        String
  description String?
  color       String?
  hourlyRate  Decimal? @map("hourly_rate") @db.Decimal(10, 2)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  shifts       Shift[]
  
  @@map("positions")
}

model Venue {
  id        String   @id @default(uuid()) @db.Uuid
  orgId     String   @map("org_id") @db.Uuid
  name      String
  address   String?
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  schedules    Schedule[]
  
  @@map("venues")
}
```

#### Step 3: Create Database Abstraction

```typescript
// packages/database/src/index.ts
export interface DatabaseClient {
  // Users
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: string, data: UpdateUserInput): Promise<User>;
  
  // Organizations
  getOrgById(id: string): Promise<Organization | null>;
  getOrgBySlug(slug: string): Promise<Organization | null>;
  createOrg(data: CreateOrgInput): Promise<Organization>;
  
  // Memberships
  getMembership(userId: string, orgId: string): Promise<Membership | null>;
  getUserMemberships(userId: string): Promise<Membership[]>;
  createMembership(data: CreateMembershipInput): Promise<Membership>;
  
  // Schedules
  getSchedulesByOrg(orgId: string, filters?: ScheduleFilters): Promise<Schedule[]>;
  getScheduleById(id: string): Promise<Schedule | null>;
  createSchedule(data: CreateScheduleInput): Promise<Schedule>;
  updateSchedule(id: string, data: UpdateScheduleInput): Promise<Schedule>;
  
  // Shifts
  getShiftsBySchedule(scheduleId: string): Promise<Shift[]>;
  getShiftById(id: string): Promise<Shift | null>;
  createShift(data: CreateShiftInput): Promise<Shift>;
  updateShift(id: string, data: UpdateShiftInput): Promise<Shift>;
  deleteShift(id: string): Promise<void>;
  
  // Positions
  getPositionsByOrg(orgId: string): Promise<Position[]>;
  getPositionById(id: string): Promise<Position | null>;
  createPosition(data: CreatePositionInput): Promise<Position>;
  updatePosition(id: string, data: UpdatePositionInput): Promise<Position>;
}
```

```typescript
// packages/database/src/firestore.ts
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export class FirestoreClient implements DatabaseClient {
  private db = getFirebaseAdminDb();
  
  async getUserById(id: string): Promise<User | null> {
    const doc = await this.db.collection("users").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  }
  
  async getSchedulesByOrg(orgId: string, filters?: ScheduleFilters): Promise<Schedule[]> {
    let query = this.db.collection(`orgs/${orgId}/schedules`);
    if (filters?.status) {
      query = query.where("status", "==", filters.status);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
  }
  
  // ... implement all methods
}
```

```typescript
// packages/database/src/postgres.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PostgresClient implements DatabaseClient {
  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
  
  async getSchedulesByOrg(orgId: string, filters?: ScheduleFilters): Promise<Schedule[]> {
    return prisma.schedule.findMany({
      where: {
        orgId,
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        venue: true,
        shifts: true,
      },
    });
  }
  
  // ... implement all methods
}
```

#### Step 4: Create Feature Flag

```typescript
// apps/web/lib/database.ts
import { FirestoreClient } from "@packages/database/firestore";
import { PostgresClient } from "@packages/database/postgres";

const USE_POSTGRES = process.env.DATABASE_PROVIDER === "postgres";

export function getDatabase(): DatabaseClient {
  if (USE_POSTGRES) {
    return new PostgresClient();
  }
  return new FirestoreClient();
}

// Usage in API routes
import { getDatabase } from "@/lib/database";

export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    const db = getDatabase();
    const schedules = await db.getSchedulesByOrg(context.org.orgId);
    return NextResponse.json({ data: schedules });
  },
});
```

#### Step 5: Data Migration Script

```typescript
// scripts/migrate-data-to-postgres.ts
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { PrismaClient } from "@prisma/client";

const firestore = getFirebaseAdminDb();
const prisma = new PrismaClient();

async function migrateOrganizations() {
  console.log("📦 Migrating organizations...");
  const orgsSnap = await firestore.collection("organizations").get();
  
  for (const doc of orgsSnap.docs) {
    const data = doc.data();
    await prisma.organization.upsert({
      where: { id: doc.id },
      update: {},
      create: {
        id: doc.id,
        name: data.name,
        slug: data.slug || doc.id,
        type: data.type || "organization",
        status: data.status || "active",
        settings: data.settings || {},
        createdAt: data.createdAt?.toDate() || new Date(),
      },
    });
  }
  console.log(`✅ Migrated ${orgsSnap.size} organizations`);
}

async function migrateSchedules() {
  console.log("📦 Migrating schedules...");
  const orgsSnap = await firestore.collection("organizations").get();
  let total = 0;
  
  for (const orgDoc of orgsSnap.docs) {
    const schedulesSnap = await firestore
      .collection(`orgs/${orgDoc.id}/schedules`)
      .get();
    
    for (const schedDoc of schedulesSnap.docs) {
      const data = schedDoc.data();
      await prisma.schedule.upsert({
        where: { id: schedDoc.id },
        update: {},
        create: {
          id: schedDoc.id,
          orgId: orgDoc.id,
          name: data.name,
          weekStart: new Date(data.weekStart),
          weekEnd: new Date(data.weekEnd),
          venueId: data.venueId || null,
          status: data.status || "draft",
          createdAt: data.createdAt?.toDate() || new Date(),
        },
      });
      total++;
    }
  }
  console.log(`✅ Migrated ${total} schedules`);
}

// Similar functions for shifts, positions, venues, memberships...

async function main() {
  try {
    await migrateOrganizations();
    await migrateSchedules();
    // ... other collections
    console.log("🎉 Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### Rollback Plan

1. Keep `DATABASE_PROVIDER=firestore` as default
2. Toggle back anytime by changing env var
3. Firestore data remains untouched during migration

---

## Section 3: Real-time Updates

### Current State (Firestore Listeners)

**Files**:
- React components using `onSnapshot()`
- Schedule builder with live updates

**Usage Pattern**:
```typescript
const unsubscribe = onSnapshot(
  collection(db, `orgs/${orgId}/schedules`),
  (snapshot) => {
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSchedules(schedules);
  }
);
```

### Target State: Supabase Realtime

#### Step 1: Enable Realtime in Supabase

```sql
-- Run in Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE shifts;
```

#### Step 2: Create React Hook

```typescript
// apps/web/src/hooks/useRealtimeSchedules.ts
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Schedule } from "@prisma/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtimeSchedules(orgId: string) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    // Initial fetch
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("org_id", orgId)
        .order("week_start", { ascending: false });
      
      if (error) {
        console.error("Failed to fetch schedules:", error);
      } else {
        setSchedules(data || []);
      }
      setIsLoading(false);
    };
    
    fetchSchedules();
    
    // Subscribe to changes
    const channel = supabase
      .channel(`schedules:${orgId}`)
      .on<Schedule>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedules",
          filter: `org_id=eq.${orgId}`,
        },
        (payload: RealtimePostgresChangesPayload<Schedule>) => {
          if (payload.eventType === "INSERT") {
            setSchedules(prev => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setSchedules(prev =>
              prev.map(s => s.id === payload.new.id ? payload.new : s)
            );
          } else if (payload.eventType === "DELETE") {
            setSchedules(prev =>
              prev.filter(s => s.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, supabase]);
  
  return { schedules, isLoading };
}
```

#### Step 3: Alternative - WebSocket Server

If not using Supabase, set up custom WebSocket:

```typescript
// apps/web/app/api/ws/route.ts
// Use Socket.io or Pusher for real-time updates
```

### Rollback Plan

Real-time can be disabled without affecting core functionality. Fallback to polling.

---

## Section 4: Cloud Functions → Vercel Functions

### Current State

**Files**:
- `functions/src/onboarding.ts` - Join organization callable
- `functions/src/ledger.ts` - Attendance triggers
- `functions/src/domain/billing.ts` - Payment calculations

### Target State

All functions moved to Next.js API routes (already mostly done).

### Migration Steps

#### Step 1: Convert Callable Functions to API Routes

**Before (Firebase Callable)**:
```typescript
// functions/src/onboarding.ts
export const joinOrganization = onCall(async (request) => {
  const { tokenId, joinToken } = request.data;
  // ... logic
  return { success: true };
});
```

**After (Next.js API Route)**:
```typescript
// apps/web/app/api/organizations/join/route.ts
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { JoinOrganizationSchema } from "@fresh-schedules/types";

export const POST = createAuthenticatedEndpoint({
  input: JoinOrganizationSchema,
  handler: async ({ input, context }) => {
    const { tokenId, joinToken } = input;
    // ... same logic
    return NextResponse.json({ success: true });
  },
});
```

#### Step 2: Convert Firestore Triggers to Webhooks

**Before (Firestore Trigger)**:
```typescript
// functions/src/ledger.ts
export const onAttendanceApproved = onDocumentUpdated(
  "attendance/{docId}",
  async (event) => {
    // Calculate pay, update ledger
  }
);
```

**After (API Route + PostgreSQL Trigger)**:

```sql
-- PostgreSQL trigger
CREATE OR REPLACE FUNCTION process_attendance_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Call webhook
    PERFORM http_post(
      'https://your-app.vercel.app/api/webhooks/attendance-approved',
      json_build_object('id', NEW.id, 'data', to_json(NEW)),
      'application/json'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// apps/web/app/api/webhooks/attendance-approved/route.ts
export const POST = async (request: NextRequest) => {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id, data } = await request.json();
  
  // Process attendance approval
  const payBreakdown = calculateShiftPay(data);
  await prisma.ledgerEntry.create({ data: payBreakdown });
  
  return NextResponse.json({ success: true });
};
```

### Rollback Plan

Keep Cloud Functions deployed but disabled. Can re-enable if needed.

---

## Section 5: Cloud Storage → Supabase Storage / S3

### Current State

**Files**:
- `apps/web/app/lib/firebaseClient.ts` - Storage client
- File upload components

**Bucket Structure**:
```
gs://fresh-schedules.appspot.com/
├── avatars/{userId}/{filename}
├── documents/{orgId}/{filename}
└── exports/{orgId}/{filename}
```

### Target State

Supabase Storage (S3-compatible) or direct S3/R2.

### Migration Steps

#### Step 1: Create Supabase Storage Buckets

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('exports', 'exports', false);

-- RLS policies
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

#### Step 2: Update Upload Components

```typescript
// Before (Firebase)
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

async function uploadAvatar(file: File, userId: string) {
  const storage = getStorage();
  const avatarRef = ref(storage, `avatars/${userId}/${file.name}`);
  await uploadBytes(avatarRef, file);
  return getDownloadURL(avatarRef);
}

// After (Supabase)
import { createClient } from "@/lib/supabase/client";

async function uploadAvatar(file: File, userId: string) {
  const supabase = createClient();
  const filePath = `${userId}/${file.name}`;
  
  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });
  
  if (error) throw error;
  
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}
```

#### Step 3: Migrate Existing Files

```typescript
// scripts/migrate-storage.ts
import { getStorage } from "firebase-admin/storage";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateStorage() {
  const firebaseBucket = getStorage().bucket();
  const [files] = await firebaseBucket.getFiles();
  
  let migrated = 0;
  
  for (const file of files) {
    const [content] = await file.download();
    const path = file.name;
    
    // Determine bucket from path
    const bucket = path.startsWith("avatars/") ? "avatars"
                 : path.startsWith("documents/") ? "documents"
                 : "exports";
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path.replace(`${bucket}/`, ""), content, {
        contentType: file.metadata.contentType,
        upsert: true,
      });
    
    if (error) {
      console.error(`Failed to migrate ${path}:`, error);
    } else {
      migrated++;
    }
  }
  
  console.log(`✅ Migrated ${migrated}/${files.length} files`);
}
```

### Rollback Plan

Keep Firebase Storage files until migration verified. Update URLs in database.

---

## Summary: Migration Order

| Priority | Subsystem | Complexity | Time |
|----------|-----------|------------|------|
| 1 | Data Layer | High | 1 week |
| 2 | Authentication | Medium | 2-3 days |
| 3 | Cloud Functions | Low | 1-2 days |
| 4 | Real-time | Medium | 2-3 days |
| 5 | Cloud Storage | Low | 1 day |

**Total Estimated Time**: 2-3 weeks for full migration

---

## Environment Variables Reference

```bash
# PostgreSQL/Supabase
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"

# Feature Flags
DATABASE_PROVIDER="postgres"  # or "firestore"
AUTH_PROVIDER="supabase"      # or "firebase"
STORAGE_PROVIDER="supabase"   # or "firebase"

# Keep Firebase for rollback
FIREBASE_PROJECT_ID="fresh-schedules"
GOOGLE_APPLICATION_CREDENTIALS_JSON="..."
```
