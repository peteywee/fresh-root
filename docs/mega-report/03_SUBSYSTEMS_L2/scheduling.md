# L2 — Scheduling Core Engine

## 1. Role in the System (L0/L1 Context)

The Scheduling Core Engine is responsible for turning:

- **Labor constraints** (budget %, average wage, legal rules),
- **Demand predictions** (forecasted sales/traffic),
- **Staff reality** (availability, skills, preferences),

into an actual **publishable schedule** for a venue or org.

If this subsystem fails:

- Managers cannot create schedules in under 5 minutes.
- Employees lose trust in the app.
- Labor costs drift and compliance risks increase.
- The entire product's value proposition collapses.

---

## 2. Panel Summary

**Distributed Systems (Elena)**  
Typical pattern today: route handlers and functions perform **multiple Firestore writes in sequence** (schedule, shifts, assignments) without guaranteed atomicity or idempotency. That works in demos, but under real failure and retry conditions it will create **orphan docs** and inconsistent schedules.

**Security (Marcus)**  
Any schedule operation must be tightly scoped to:

- `orgId` and `venueId`
- caller's role (`manager/admin` vs `employee`)
- "view vs edit" capabilities

Loose checks in handlers plus "hope the rules catch it" is not enough.

**DDD (Ingrid)**  
Right now, the "Schedule" behaves more like a **bag of documents** than a true **Aggregate**. Code in API routes and functions directly manipulates `schedules`, `shifts`, and `assignments` independently. That scatters invariants (no double booking, correct date ranges, etc.) across the codebase.

**Platform (Kenji)**  
There is no single **scheduling SDK** that other layers depend on. That makes it hard to:

- instrument logs/tracing consistently
- reason about performance
- roll out changes safely.

**Staff Engineer (Priya)**  
A dev adding a new rule today is likely to touch multiple routes, helpers, and collections. This leads to "shotgun surgery" and increases the odds of subtle bugs.

**Database (Omar)**  
The natural Firestore modeling (`schedules/{id}`, `schedules/{id}/shifts`, `assignments`) is fine, but the **query patterns** need discipline. Fully loading a week's worth of schedules, shifts, and assignments can turn into N+1 reads if not centralized.

**API Design (Sarah)**  
The external interface should be **small and predictable**:

- `POST /api/schedules/generate`
- `POST /api/schedules/publish`
- `POST /api/schedules/clone`
- `GET /api/schedules?venueId=...&weekOf=...`

Right now, it's easy for "helper endpoints" or ad-hoc routes to proliferate.

**Devil's Advocate (Rafael)**  
If the **5-minute schedule** experience is confusing, fragile, or slow, no amount of clever features elsewhere will matter. Any complexity here that doesn't directly improve that experience is suspect.

**Strategic/Impact (Victoria)**  
This engine *is* your moat:

> "We generate better schedules, faster, with fewer labor surprises."

That's what gets a regional manager or COO to care.

---

## 3. Critical Finding SCHED-1 — Schedule Aggregate Boundary Missing

### 3.1 What Was Here (Typical Pattern)

In the current style, schedule creation often looks like this in routes or functions:

```ts
// PSEUDO-EXAMPLE of existing pattern

// 1) Create schedule doc
const scheduleRef = db.collection("schedules").doc();
await scheduleRef.set({
  orgId,
  venueId,
  weekOf,
  status: "draft",
  createdBy: userId,
  createdAt: serverTimestamp(),
});

// 2) Create shifts one-by-one
for (const shift of incomingShifts) {
  await scheduleRef.collection("shifts").add({
    ...shift,
    orgId,
    venueId,
    scheduleId: scheduleRef.id,
  });
}

// 3) Create assignments (maybe in the same handler, maybe elsewhere)
for (const assignment of incomingAssignments) {
  await db.collection("assignments").add({
    ...assignment,
    orgId,
    venueId,
    scheduleId: scheduleRef.id,
  });
}
```

This "works" in happy-path testing. But:

- There is no transaction across schedule, shifts, and assignments.
- A crash or timeout halfway through leaves dangling docs.
- There is no idempotency if the client retries.
- Different parts of the app can write to these collections independently.

### 3.2 What Should Be Here (Safer, Still Familiar)

First step toward better:

- Use a transaction around the core writes.
- Encapsulate the logic in a reusable function/file instead of spreading it around.

```ts
// better, but still local: transactional helper

export async function createScheduleTransactional(input: CreateScheduleInput) {
  const { orgId, venueId, weekOf, shifts, assignments } = input;

  return db.runTransaction(async (tx) => {
    const scheduleRef = db.collection("schedules").doc();

    tx.set(scheduleRef, {
      orgId,
      venueId,
      weekOf,
      status: "draft",
      createdBy: input.createdBy,
      createdAt: serverTimestamp(),
    });

    for (const shift of shifts) {
      const shiftRef = scheduleRef.collection("shifts").doc();
      tx.set(shiftRef, {
        ...shift,
        orgId,
        venueId,
        scheduleId: scheduleRef.id,
      });
    }

    for (const assignment of assignments ?? []) {
      const assignmentRef = db.collection("assignments").doc();
      tx.set(assignmentRef, {
        ...assignment,
        orgId,
        venueId,
        scheduleId: scheduleRef.id,
      });
    }

    return { scheduleId: scheduleRef.id };
  });
}
```

Better, but still has problems:

- Any route can call this helper directly.
- No idempotency.
- Hard to evolve without touching every caller.

### 3.3 What Works Best (Target Pattern — SDK Aggregate)

Create a scheduling SDK as the only way to create schedules:

```ts
// packages/scheduling-sdk/src/types.ts
export interface CreateScheduleInput {
  orgId: string;
  venueId: string;
  weekOf: string; // ISO date for week start
  templateId?: string;
  laborInputs: {
    avgWage: number;
    laborPercent: number;
    forecastSales: number;
  };
  shifts: ShiftDraft[];
  assignments?: AssignmentDraft[];
  idempotencyKey: string;
  createdByUserId: string;
}

export interface CreateScheduleResult {
  scheduleId: string;
  createdShiftCount: number;
  createdAssignmentCount: number;
}
```

```ts
// packages/scheduling-sdk/src/transactions/createSchedule.ts
import { db } from "../firestore";

export async function createScheduleWithShifts(
  input: CreateScheduleInput,
): Promise<CreateScheduleResult> {
  const {
    orgId,
    venueId,
    weekOf,
    laborInputs,
    shifts,
    assignments = [],
    idempotencyKey,
    createdByUserId,
  } = input;

  // Idempotency record (simple pattern)
  const idemRef = db
    .collection("scheduling_idempotency")
    .doc(`${orgId}_${venueId}_${weekOf}_${idempotencyKey}`);

  return db.runTransaction(async (tx) => {
    const idemSnap = await tx.get(idemRef);
    if (idemSnap.exists) {
      return idemSnap.data() as CreateScheduleResult;
    }

    const scheduleRef = db.collection("schedules").doc();
    tx.set(scheduleRef, {
      orgId,
      venueId,
      weekOf,
      status: "draft",
      laborInputs,
      createdBy: createdByUserId,
      createdAt: new Date(),
    });

    let createdShiftCount = 0;
    let createdAssignmentCount = 0;

    for (const shift of shifts) {
      const shiftRef = scheduleRef.collection("shifts").doc();
      tx.set(shiftRef, {
        ...shift,
        orgId,
        venueId,
        scheduleId: scheduleRef.id,
      });
      createdShiftCount++;
    }

    for (const assignment of assignments) {
      const assignmentRef = db.collection("assignments").doc();
      tx.set(assignmentRef, {
        ...assignment,
        orgId,
        venueId,
        scheduleId: scheduleRef.id,
      });
      createdAssignmentCount++;
    }

    const result: CreateScheduleResult = {
      scheduleId: scheduleRef.id,
      createdShiftCount,
      createdAssignmentCount,
    };

    tx.set(idemRef, result);

    return result;
  });
}
```

Then API routes become thin wrappers:

```ts
// apps/web/app/api/schedules/generate/route.ts
import { createScheduleWithShifts } from "@fresh-root/scheduling-sdk";

export async function POST(request: Request) {
  const body = await request.json();

  const result = await createScheduleWithShifts({
    orgId: body.orgId,
    venueId: body.venueId,
    weekOf: body.weekOf,
    laborInputs: body.laborInputs,
    shifts: body.shifts,
    assignments: body.assignments,
    idempotencyKey: body.idempotencyKey,
    createdByUserId: body.userId,
  });

  return new Response(JSON.stringify(result), { status: 201 });
}
```

Key properties of the "best" pattern:

- Only one place in the whole system knows the full write pattern.
- Transactions + idempotency are enforced centrally.
- API handlers and functions become very simple, easy to test and secure.
- Later, you can swap Firestore internals without rewriting all callers.

---

## 4. Critical Finding SCHED-2 — Publish vs Draft Conflated

### 4.1 What Was Here

Common pattern in early versions:

- `schedule.status` toggled from "draft" to "published" directly.
- Same collection used for both draft and published schedules.
- No explicit notion of publish event or publish audit.

```ts
await scheduleRef.update({ status: "published" });
```

### 4.2 What Should Be Here

At minimum, treat publish as a distinct step that:

- Verifies all invariants (no conflicting assignments, labor overspend, etc.).
- Triggers notifications.
- Records who published and when.

```ts
await db.runTransaction(async (tx) => {
  const scheduleSnap = await tx.get(scheduleRef);
  const schedule = scheduleSnap.data();

  // validate invariants here ...

  tx.update(scheduleRef, {
    status: "published",
    publishedAt: new Date(),
    publishedBy: userId,
  });

  // enqueue notifications, etc.
});
```

### 4.3 What Works Best

Promote publish into its own SDK method:

```ts
// packages/scheduling-sdk/src/commands/publishSchedule.ts
export async function publishSchedule(
  orgId: string,
  scheduleId: string,
  userId: string,
): Promise<void> {
  const scheduleRef = db.collection("schedules").doc(scheduleId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(scheduleRef);
    if (!snap.exists) throw new Error("Schedule not found");

    const schedule = snap.data();
    if (schedule.orgId !== orgId) throw new Error("Org mismatch");

    // 1) Validate labor constraints & conflicts
    // 2) Validate assignments (no double-booking, etc.)

    tx.update(scheduleRef, {
      status: "published",
      publishedAt: new Date(),
      publishedBy: userId,
    });

    // 3) Optionally write a publish event document
    const eventRef = db.collection("schedule_events").doc();
    tx.set(eventRef, {
      type: "PUBLISHED",
      scheduleId,
      orgId,
      venueId: schedule.venueId,
      actorUserId: userId,
      at: new Date(),
    });
  });

  // 4) Out-of-transaction: trigger notifications via a Function or queue
}
```

Then your route is trivial:

```ts
// apps/web/app/api/schedules/[scheduleId]/publish/route.ts
import { publishSchedule } from "@fresh-root/scheduling-sdk";

export async function POST(
  _req: Request,
  { params }: { params: { scheduleId: string } },
) {
  const { scheduleId } = params;
  const { orgId, userId } = await getAuthContext(); // your auth helper

  await publishSchedule(orgId, scheduleId, userId);

  return new Response(null, { status: 204 });
}
```

---

## 5. Open Questions for Scheduling Engine

- Do we allow multiple active schedules for the same venue/week, or enforce uniqueness at the SDK level?
- Do we need a full version history (e.g., schedule v1, v2, v3) or rely on events + snapshots?
- How tightly should the engine couple to the labor planning subsystem vs treating it as a plugin?

---

## 6. Cross-Links

- See `03_SUBSYSTEMS_L2/labor_planning.md` for how labor inputs should be shaped.
- See `03_SUBSYSTEMS_L2/rbac_security.md` for required checks before calling SDK methods.
- See `04_COMPONENTS_L3/scheduling_engine_modules.md` for a catalog of scheduling-related modules.
- See `06_SDK_DEPRECATION_LEDGER/` for how legacy patterns are mapped to SDK calls.
