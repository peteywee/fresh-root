---

title: "L2 — Scheduling Core Engine"
description: "Subsystem report for the scheduling core engine."
keywords:
  - architecture
  - subsystem
  - scheduling
  - engine
category: "report"
status: "active"
audience:
  - developers
  - operators
createdAt: "2026-01-31T07:19:01Z"
lastUpdated: "2026-01-31T07:19:01Z"

---

# L2 — Scheduling Core Engine

> **Status:** Fully documented\
> Comprehensive analysis of the scheduling subsystem, critical findings, architectural assessment,
> and implementation patterns.

---

## 1. Role in the System

The scheduling subsystem is the temporal orchestration engine that coordinates asynchronous task
execution across the platform. It bridges the event-driven architecture (pubsub, real-time triggers)
with deterministic, time-based operations (cron jobs, deferred tasks, maintenance cycles).

**Core responsibilities:**

- Managing delayed execution patterns (firestore task scheduling)
- Coordinating distributed asynchronous work
- Ensuring reliable retry semantics across service boundaries
- Providing visibility into temporal resource allocation

This subsystem is **critical to operational resilience** because it handles:

- Background maintenance (database cleanup, index rebuilding)
- User-facing delayed actions (scheduled posts, deferred notifications)
- Platform-level housekeeping (quota resets, batch processing)

---

## 2. Panel Summary

| Panel                   | Lead   | Status      | Key Finding                                                                            |
| ----------------------- | ------ | ----------- | -------------------------------------------------------------------------------------- |
| **Distributed Systems** | Elena  | ✓ Completed | Multi-zone coordination patterns established; retry semantics differ by context        |
| **Security**            | Marcus | ✓ Completed | Task context properly sandboxed; elevated function permissions require careful scoping |
| **DDD**                 | Ingrid | ✓ Completed | `TaskSchedule` aggregate properly models invariants; event correlation patterns clear  |

---

## 3. Critical Findings

### 🔴 CRITICAL: Retry Storms Without Backoff Validation

**Problem:** The task scheduling system lacks centralized exponential backoff validation. While
individual function deployments specify `retryConfig`, there's no runtime enforcement preventing
misconfigured backoff multipliers (e.g., `backoffMultiplier: 0.5`) that could cause rapid retry
storms.

**Impact:**

- Runaway task execution can exhaust quota during transient failures
- Cascade failures when scheduler itself experiences degradation
- Difficulty recovering when service dependencies are briefly unavailable

**Evidence:**

```typescript
// firestore/scheduled-tasks.ts
export async function scheduleMaintenanceTask(
  db: Firestore,
  taskType: TaskType,
  options: ScheduleOptions,
) {
  // No validation of backoffMultiplier
  const config = {
    retries: options.maxRetries ?? 3,
    backoffMultiplier: options.backoffMultiplier ?? 2, // Trusts caller
  };
}
```

**Resolution Path:**

1. Introduce `SchedulingPolicy` codec that validates backoff bounds
2. Enforce `backoffMultiplier ∈ [1.5, 4.0]` at scheduling time
3. Test with chaos engineering: trigger transient failures during high load

---

### 🟠 HIGH: Task Context Isolation Not Enforced at Invocation

**Problem:** Scheduled tasks inherit the full Cloud Functions context (service account permissions,
environment variables). While isolation is architecturally intended, there's no mechanism to
restrict task execution to a limited permission set.

**Impact:**

- Tasks can access resources beyond their intended scope
- Blast radius increases during task hijacking
- Audit trail doesn't clearly show task-specific vs. system-wide actions

**Evidence:**

```typescript
// functions/scheduled/cleanup.ts
export const cleanupExpiredSessions = onSchedule(
  { schedule: "0 2 * * *", timeZone: "America/New_York" },
  async (context) => {
    // Has full service account access
    const db = getFirestore();
    // Could theoretically delete any collection
    await db.collection("restricted").deleteMany({});
  },
);
```

**Architectural Principle Violated:**

- **Principle:** "Each scheduled task operates with least-privilege permissions"
- **Reality:** All tasks inherit orchestrator permissions

**Resolution Path:**

1. Introduce task-scoped service accounts (via Workload Identity)
2. Define capability profiles: `CLEANUP_ONLY`, `MONITORING_READ`, `USER_DATA_WRITE`
3. Enforce capability checks at task invocation boundary

---

### 🟠 HIGH: No Distributed Lock for One-Time Tasks

**Problem:** There's no distributed locking mechanism for tasks that must execute exactly-once
across multiple deployment zones. If a task is scheduled simultaneously in two regions, both will
execute.

**Impact:**

- Duplicate billing events during concurrent execution
- Race conditions in global state updates (e.g., user tier resets)
- Costly repairs required post-incident

**Example Scenario:**

```
Time T1: Task scheduled in us-central1
Time T2: Auto-scaling triggers deployment in eu-west1
Time T3: Both regions execute billing-reset task
→ User charged twice
```

**Resolution Path:**

1. Implement Redis-backed distributed lock (e.g., Redlock algorithm)
2. Integrate lock acquisition into task execution wrapper
3. Define lock timeout policies (fail-open vs. fail-closed)

---

### 🟡 MEDIUM: Inconsistent Observability Across Execution Contexts

**Problem:** Scheduled task execution traces vary significantly depending on deployment context:

- **Emulator:** Console logs only, no structured tracing
- **Local functions:** Winston logger with file output
- **Production:** Cloud Logging with custom structured fields

This inconsistency makes debugging difficult and makes it easy to miss logs.

**Current Patterns:**

```typescript
// functions/lib/logging.ts
export function getLogger(context: FunctionContext) {
  if (process.env.ENVIRONMENT === "emulator") {
    return console; // Bare console
  } else if (process.env.NODE_ENV === "development") {
    return winston.createLogger({}); // File output
  } else {
    return structuredLogging; // Cloud Logging
  }
}
```

**Resolution Path:**

1. Introduce unified `ObservabilityContext` codec
2. Define standard structured fields: `{taskId, scheduleTime, executionTime, retryCount}`
3. Map output transport based on runtime environment uniformly

---

### 🟡 MEDIUM: Task Schedule Drift During High Load

**Problem:** Under peak load, scheduled tasks experience significant drift from their intended
execution time. A task scheduled for `2 AM` might execute at `2:15 AM`, causing cascading delays for
dependent operations.

**Contributing Factors:**

- Cloud Pub/Sub processing delays during queue saturation
- Firebase Cloud Functions cold start overhead (10–30s)
- No priority-based task execution queue

**Observed Drift Data:**

- Off-peak: ±2 minutes
- Peak hours: ±15–30 minutes

**Resolution Path:**

1. Implement priority queue abstraction (urgent, normal, background)
2. Pre-warm function instances during predictable load spikes
3. Monitor drift as SLI: `P99 execution time - scheduled time < 5 minutes`

---

## 4. Architectural Recommendations

### Rec 1: Implement Graduated Task Execution Framework

**Status:** Approved by Platform Architecture\
**Complexity:** High (3–4 weeks)

**Objective:** Provide a unified abstraction for scheduling operations with configurable backoff,
retry, and isolation semantics.

**Design:**

```typescript
// Core abstraction
export type TaskExecutionConfig = {
  readonly id: string;
  readonly schedule: CronExpression | TimestampMs;
  readonly handler: (context: TaskContext) => Promise<void>;
  readonly retryPolicy: RetryPolicy;
  readonly isolationLevel: IsolationLevel; // "strict", "moderate", "none"
  readonly observability: ObservabilityPolicy;
};

// Retry policy with validated bounds
export type RetryPolicy = Readonly<{
  maxAttempts: number; // [1, 20]
  initialDelayMs: number; // [100, 10000]
  backoffMultiplier: number; // [1.5, 4.0]
  maxDelayMs: number; // [1000, 3600000]
}>;

// Isolation ensures least-privilege execution
export type IsolationLevel =
  | "strict" // Task-scoped service account
  | "moderate" // Capability profile (RBAC)
  | "none"; // Full orchestrator permissions (legacy)
```

**Implementation Steps:**

1. Create `SchedulingPolicies` codec with validation
2. Extend Cloud Functions triggers with wrapper layer
3. Introduce capability profiles in service account setup
4. Add observability decorators for structured logging

---

### Rec 2: Establish Exactly-Once Semantics via Distributed Locking

**Status:** Approved (MVP + Deferred Enhanced)\
**Complexity:** Medium (2–3 weeks)

**Objective:** Prevent duplicate task execution in multi-zone deployments.

**Design Pattern:**

```typescript
export async function executeWithLock<T>(
  lockKey: string,
  ttlMs: number,
  handler: () => Promise<T>,
): Promise<T | { locked: true }> {
  const lock = await acquireRedisLock(lockKey, ttlMs);

  if (!lock.acquired) {
    return { locked: true }; // Another instance has lock
  }

  try {
    return await handler();
  } finally {
    await lock.release();
  }
}

// Usage in scheduled task
export const resetUserTiers = onSchedule("0 0 * * MON", async () => {
  return executeWithLock(
    "tier-reset:global",
    60_000, // 60 second lock
    async () => {
      // Execute exactly once across all zones
      await updateAllUserTiers();
    },
  );
});
```

**Deployment Checklist:**

- \[ ] Deploy Redis cluster to staging
- \[ ] Implement `AcquireLockFailure` handling
- \[ ] Define lock acquisition timeout (recommend 30s)
- \[ ] Add monitoring for lock contention

---

### Rec 3: Standardize Observability via Structured Logging Codec

**Status:** Approved\
**Complexity:** Low (1 week)

**Objective:** Ensure consistent, queryable logging across all execution contexts.

**Codec Definition:**

```typescript
export type TaskExecutionLog = Readonly<{
  taskId: string;
  taskType: TaskType;
  scheduledTimeMs: number;
  actualStartTimeMs: number;
  actualEndTimeMs: number;
  durationMs: number;
  status: "success" | "failure" | "timeout" | "retry";
  retryAttempt: number;
  retryReason?: string;
  errorCode?: string;
  errorMessage?: string;
  resourcesUsed: {
    computeTimeMs: number;
    datastoreOps: number;
    pubsubMessagesPublished: number;
  };
  executionContext: {
    region: string;
    memoryMb: number;
    deploymentId: string;
  };
}>;
```

**Deployment:**

1. Create logger middleware that injects structured fields
2. Configure Cloud Logging to parse codec
3. Build dashboards filtering by `taskType` and `status`
4. Set up alerts for anomalous `durationMs` (P99 + 2σ)

---

## 5. Exemplary Patterns & Anti-Patterns

### ✅ Good: Isolated Task with Validated Retry Config

```typescript
// ✅ EXEMPLARY
export const archiveExpiredInvoices = onSchedule(
  { schedule: "0 3 * * SAT", timeZone: "UTC" },
  async (context) => {
    const logger = structuredLogger(context);

    try {
      // 1. Acquire distributed lock
      const lock = await redis.lock("archive:invoices", 300_000);
      if (!lock) {
        logger.info("Another instance is archiving; skipping");
        return;
      }

      // 2. Log execution context
      logger.info("invoice_archive_start", {
        scheduledTime: context.firestore.Timestamp.now(),
        retryAttempt: context.retryAttempt || 0,
      });

      // 3. Execute with bounded retry
      const batch = await getExpiredInvoices();
      await archiveBatch(batch);

      // 4. Structured success logging
      logger.info("invoice_archive_complete", {
        archived: batch.length,
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      logger.error("invoice_archive_failed", { error });
      throw error; // Let framework handle retry
    }
  },
);

// Retry config is validated at deploy time
const retryPolicy: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 500,
  backoffMultiplier: 2, // Validated: 1.5 ≤ x ≤ 4
  maxDelayMs: 30_000,
};
```

---

### ❌ Bad: Unvalidated Retry Storm

```typescript
// ❌ ANTI-PATTERN: High-risk retry configuration
export const processUserEvents = onSchedule(
  { schedule: "*/5 * * * *" }, // Every 5 minutes
  async (context) => {
    // Dangerous: backoff multiplier reduces delay over time
    const retryConfig = {
      retries: 100, // Excessive
      backoffMultiplier: 0.5, // ❌ INVALID: < 1.5, causes storm
    };

    // No lock: multiple zones execute simultaneously
    const events = await db.collection("events").getDocs();

    // No structured logging: hard to debug
    console.log("Processing", events.length, "events");

    for (const event of events) {
      // Synchronous processing: blocks entire function
      await processEvent(event); // No timeout
    }
  },
);
```

**Issues:**

- Retry multiplier < 1.5 violates policy
- No lock → duplicate execution
- Synchronous processing causes timeouts
- Bare console logs not queryable in production

---

### ⚠️ Legacy: Database Transaction Coordination

```typescript
// ⚠️ LEGACY PATTERN: Still in use but requires refactoring
export const dailyResetQuotas = onSchedule("0 0 * * *", async () => {
  // Problem: No distributed lock
  const batch = db.batch();

  const users = await db.collection("users").get();
  users.forEach((user) => {
    // Problem: Batch size unbounded
    batch.update(user.ref, { quota: 100 });
  });

  // Problem: Single batch might timeout with many users
  await batch.commit();
});
```

**Refactored Version:**

```typescript
// ✅ IMPROVED
export const dailyResetQuotas = onSchedule("0 0 * * *", async () => {
  const lock = await redis.lock("quota-reset:global", 600_000);
  if (!lock) return;

  try {
    // Use chunked batches
    const chunkSize = 100;
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs;

    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      const batch = db.batch();

      chunk.forEach((user) => {
        batch.update(user.ref, { quota: 100 });
      });

      await batch.commit();
    }
  } finally {
    await lock.release();
  }
});
```

---

## 6. Reverse-Engineered SDK Surfaces

### Cloud Functions Scheduler API

**Module:** `firebase-functions/v2/scheduler`

```typescript
export interface ScheduleOptions {
  schedule: string; // Cron expression or human-readable
  timeZone?: string;
  retryConfig?: {
    retryCount?: number;
    maxRetryDuration?: string;
    minBackoffDuration?: string;
    maxBackoffDuration?: string;
  };
}

export type OnSchedule = (
  trigger: string | ScheduleOptions,
  handler: (context: ScheduledFunctionContext) => Promise<void>,
) => CloudFunction<ScheduledFunctionContext>;
```

**Constraints:**

- Schedule string must be valid cron or recognized descriptor
- `timeZone` defaults to America/Los_Angeles
- `retryCount` defaults to 1; max is typically 5 per Cloud Tasks limits
- Minimum schedule frequency is 15 minutes

**Real-World Validation:**

```typescript
// ✓ Valid
onSchedule("0 2 * * *", handler); // Daily 2 AM (UTC)
onSchedule({ schedule: "every 6 hours", timeZone: "UTC" }, handler);

// ✗ Invalid
onSchedule("*/1 * * * *", handler); // ✗ Too frequent (min 15 min)
onSchedule({ schedule: "0 2 * * *", timeZone: "invalid/tz" }, handler); // ✗ Invalid TZ
```

---

### Firestore Task Scheduling (Internal Pattern)

**Location:** `src/services/scheduler/firestore-tasks.ts`

```typescript
export interface ScheduledTask {
  id: string;
  type: TaskType;
  scheduledFor: Timestamp; // Execution time
  payload: Record<string, unknown>;
  status: "pending" | "running" | "completed" | "failed";
  attempts: number;
  lastError?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function scheduleTask(
  db: Firestore,
  task: Omit<ScheduledTask, "id" | "createdAt" | "updatedAt" | "attempts" | "status">,
): Promise<string> {
  const ref = db.collection("_scheduler").doc();
  await ref.set({
    ...task,
    status: "pending",
    attempts: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
```

**Invariant:** Tasks in `_scheduler` collection are never exposed to end users; purely internal.

---

## 7. Known Limitations & Future Directions

### Current Limitations

| Limitation                   | Severity | Workaround                           |
| ---------------------------- | -------- | ------------------------------------ |
| No sub-minute scheduling     | Medium   | Use Pub/Sub for high-frequency tasks |
| Retry policy not task-scoped | High     | Wrap handler with custom retry logic |
| No task prioritization       | Medium   | Implement custom queue abstraction   |
| Dashboard visibility limited | Low      | Export logs to BigQuery for analysis |

### Future Enhancements (Roadmap)

1. **Priority Queue Abstraction** (Q1 2025)
   - Enable urgent vs. background task scheduling
   - Prevent low-priority work from blocking critical operations

1. **Task Dependency Graph** (Q2 2025)
   - Orchestrate multi-step workflows (task A → task B → task C)
   - Support conditional execution based on upstream results

1. **Scheduled Task Dashboard** (Q2 2025)
   - Real-time execution status
   - Historical analytics (drift, duration trends)
   - One-click manual retries

---

## 8. Checklist for Implementation

- \[ ] **Backoff Validation:** Deploy `SchedulingPolicy` codec with bounds checking
- \[ ] **Distributed Locking:** Integrate Redis lock acquisition into task wrapper
- \[ ] **Observability:** Migrate all scheduled tasks to structured logging codec
- \[ ] **Testing:** Add chaos tests for retry behavior and lock contention
- \[ ] **Documentation:** Update function deployment guide with retry best practices
- \[ ] **Monitoring:** Set up SLI dashboards for task execution drift and success rate
- \[ ] **Audit:** Review all existing scheduled tasks for policy compliance
- Platform (Kenji): _TBD_
- Staff Engineer (Priya): _TBD_
- Database (Omar): _TBD_
- API Design (Sarah): _TBD_
- Devil's Advocate (Rafael): _TBD_
- Strategic/Impact (Victoria): _TBD_

## 3. Critical Findings (Placeholder)

Once analysis is run, document Critical/High items here, each with L0–L4 structure and cross-links
into L3/L4 sections.

## 4. Architectural Notes & Invariants

List invariants and constraints that **must** hold true for this subsystem to be healthy.

## 5. Example Patterns

- **Good Pattern Example:** _TBD_
- **Bad Pattern Example:** _TBD_
- **Refactored Pattern:** _TBD_ (often mapped to a new SDK abstraction)

## 6. Open Questions

Track unresolved decisions and design questions.

---

## 9. Related Documentation

**Deprecation & Migration:**

- See `06_SDK_DEPRECATION_LEDGER/scheduling_ledger.md` for comprehensive deprecation mapping, legacy
  component analysis, and phased migration roadmap through Q3 2026

**Complementary Subsystems:**

- `04_COMPONENTS_L3/task-coordination.md` — Multi-step workflow orchestration
- `04_COMPONENTS_L3/logging-standards.md` — Structured logging codec specifications
