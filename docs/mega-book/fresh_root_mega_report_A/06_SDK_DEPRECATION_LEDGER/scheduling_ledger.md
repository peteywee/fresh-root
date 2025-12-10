# Scheduling Ledger — SDK Deprecation & Migration Path

> **Purpose:** Track deprecated scheduling patterns, legacy components, and migration roadmap to framework-integrated scheduling.\
> **Status:** Active\
> **Last Updated:** November 30, 2025

---

## 1. Deprecation Mapping

### Legacy Components Under Consolidation

| Component                      | Location                                    | Status     | Replacement                    | Migration Deadline |
| ------------------------------ | ------------------------------------------- | ---------- | ------------------------------ | ------------------ |
| **Firestore Task Scheduler**   | `src/services/scheduler/firestore-tasks.ts` | Deprecated | Cloud Functions `onSchedule`   | Q1 2026            |
| **Custom Retry Logic**         | `src/lib/scheduling/retry-handler.ts`       | Deprecated | Framework `retryConfig`        | Q1 2026            |
| **Manual Cron Job Registry**   | `functions/scheduled/*.ts`                  | Partial    | Unified registry               | Q2 2026            |
| **Task Queue (Home-grown)**    | `src/services/queue/*`                      | Deprecated | Cloud Tasks via framework      | Q2 2026            |
| **Lock Coordination (Ad-hoc)** | Various (Firestore-based)                   | Deprecated | Redis/Spanner distributed lock | Q3 2026            |

---

## 2. Legacy Component Analysis

### 2.1 Firestore Task Scheduler

**File:** `src/services/scheduler/firestore-tasks.ts`

**What it is:** Custom task storage and execution coordinator using Firestore collection `_scheduler`.

**Why it exists:** Pre-framework solution for delayed task execution and retry management.

**Current usage:**

```typescript
// LEGACY PATTERN
import { scheduleTask } from "@/services/scheduler/firestore-tasks";

await scheduleTask(db, {
  type: "INVOICE_ARCHIVE",
  scheduledFor: tomorrow,
  payload: { batchId: "INV-123" },
});
```

**Problems:**

- Manual retry logic doesn't integrate with Cloud Tasks
- No built-in exponential backoff validation
- Requires explicit cron job to poll `_scheduler` collection
- Scaling issues under high task volume

**Migration path:**

```typescript
// NEW PATTERN: Framework-native scheduling
import { onSchedule } from "firebase-functions/v2/scheduler";

export const archiveInvoices = onSchedule(
  {
    schedule: "0 3 * * SAT",
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: "3600s", // 1 hour
      minBackoffDuration: "60s",
      maxBackoffDuration: "600s",
    },
  },
  async (context) => {
    const logger = structuredLogger(context);
    logger.info("invoice_archive_start");
    await archiveInvoices();
  },
);
```

**Timeline:** Remove `firestore-tasks.ts` by end of Q1 2026

---

### 2.2 Custom Retry Handler

**File:** `src/lib/scheduling/retry-handler.ts`

**What it is:** Manual exponential backoff implementation with circuit breaker pattern.

**Legacy code:**

```typescript
// DEPRECATED
export async function retryWithBackoff(
  fn: () => Promise<void>,
  options: {
    maxRetries: number;
    initialDelayMs: number;
    backoffMultiplier: number;
  },
) {
  let delay = options.initialDelayMs;
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.maxRetries - 1) throw error;
      await sleep(delay);
      delay *= options.backoffMultiplier; // ⚠️ Unbounded growth
    }
  }
}
```

**Issues:**

- No validation of `backoffMultiplier` (can explode or converge to zero)
- Redundant with framework retry logic
- Difficult to reason about in tracing

**Replacement:**

```typescript
// NEW PATTERN: Declare retry policy at deploy time
const task = onSchedule(
  {
    schedule: "0 2 * * *",
    retryConfig: {
      retryCount: 3,
      minBackoffDuration: "60s",
      maxBackoffDuration: "600s",
    },
  },
  handler,
);
// Framework handles backoff automatically
```

**Timeline:** Remove by end of Q1 2026

---

### 2.3 Manual Cron Job Registry

**Location:** `functions/scheduled/`

**Current files:**

- `cleanup.ts` — Expired session cleanup
- `billing-reset.ts` — Daily user quota reset
- `maintenance.ts` — Database maintenance tasks
- `reporting.ts` — Report generation

**Current pattern:**

```typescript
// functions/scheduled/cleanup.ts
export const cleanupExpiredSessions = onSchedule(
  "0 2 * * *",
  async (context) => {
    // Direct implementation
    const db = getFirestore();
    await db.collection("sessions")
      .where("expiresAt", "<", new Date())
      .get()
      .then(snap => /* delete logic */);
  }
);
```

**Architectural issues:**

- Each task implements its own error handling
- No centralized observability
- Inconsistent logging across files
- No validation of cron expressions

**Unified approach:**

```typescript
// Proposed: Single registry with shared middleware
import { createScheduledTask, TaskConfig } from "@/lib/scheduling/registry";

const tasks: TaskConfig[] = [
  {
    id: "cleanup-sessions",
    schedule: "0 2 * * *",
    handler: cleanupExpiredSessions,
    isolation: "strict",
    retry: { maxAttempts: 3, backoffMultiplier: 2 },
  },
  {
    id: "reset-quotas",
    schedule: "0 0 * * *",
    handler: resetDailyQuotas,
    isolation: "moderate",
    retry: { maxAttempts: 2, backoffMultiplier: 1.5 },
  },
];

export const scheduledTasks = tasks.map((config) => createScheduledTask(config));
```

**Timeline:** Consolidate registry by Q2 2026

---

### 2.4 Home-Grown Task Queue

**Location:** `src/services/queue/*`

**What it is:** Custom pub/sub-based queue for background work processing.

**Why deprecated:** Google Cloud Tasks provides native queuing with better semantics.

**Legacy pattern:**

```typescript
// DEPRECATED: Custom queue
import { enqueueTask } from "@/services/queue";

export async function handleUserSignup(userId: string) {
  // Enqueue welcome email
  await enqueueTask("send-email", {
    userId,
    template: "welcome",
  });
}

// Separate worker consumes queue
export const queueWorker = onMessagePublished("task-queue-topic", async (message) => {
  const task = message.json;
  await processTask(task);
});
```

**Problems:**

- At-least-once semantics (duplicates possible)
- No built-in deadletter handling
- Manual implementation of rate limiting
- Difficult to reason about ordering

**Modern replacement:**

```typescript
// NEW PATTERN: Cloud Tasks
import { v2 } from "@google-cloud/tasks";

export async function handleUserSignup(userId: string) {
  const client = new v2.CloudTasksClient();
  const project = "my-project";
  const queue = "send-email";
  const location = "us-central1";

  const parent = client.queuePath(project, location, queue);

  await client.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: "POST",
        url: "https://my-function-url/send-email",
        headers: { "Content-Type": "application/json" },
        body: Buffer.from(JSON.stringify({ userId, template: "welcome" })).toString("base64"),
      },
    },
  });
}
```

**Timeline:** Migrate to Cloud Tasks by Q2 2026

---

### 2.5 Ad-Hoc Lock Coordination

**Locations:**

- `functions/scheduled/maintenance.ts` (Firestore-based lock)
- `src/services/scheduler/locks.ts` (homegrown implementation)

**Legacy pattern:**

```typescript
// DEPRECATED: Firestore-based distributed lock
export async function acquireLock(lockId: string, ttlMs: number) {
  const lockRef = db.collection("_locks").doc(lockId);

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(lockRef);

    if (existing.exists && existing.data().expiresAt > Date.now()) {
      return { acquired: false };
    }

    transaction.set(lockRef, {
      expiresAt: Date.now() + ttlMs,
      ownerId: process.env.DEPLOYMENT_ID,
    });

    return { acquired: true };
  });
}
```

**Issues:**

- Transaction overhead on every attempt
- No automatic cleanup of expired locks
- Vulnerable to clock skew across zones
- Firestore contention under high concurrency

**Recommended approach:**

```typescript
// NEW PATTERN: Redis-backed distributed lock (Redlock)
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function acquireLock(lockKey: string, ttlMs: number): Promise<boolean> {
  const lockValue = crypto.randomUUID();

  // SET with NX (only if not exists) and PX (milliseconds TTL)
  const result = await redis.set(`lock:${lockKey}`, lockValue, "NX", "PX", ttlMs);

  return result === "OK";
}

export async function releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
  // Lua script ensures atomic check-then-delete
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  const result = await redis.eval(script, 1, `lock:${lockKey}`, lockValue);

  return result === 1;
}
```

**Timeline:** Migrate to Redis-backed locks by Q3 2026

---

## 3. Before & After Examples

### Example 1: Scheduled Maintenance Task

#### ❌ BEFORE (Legacy Pattern)

```typescript
// functions/scheduled/maintenance.ts
import { onSchedule } from "firebase-functions/v1/pubsub";
import { getFirestore } from "firebase-admin/firestore";
import { scheduleTask } from "@/services/scheduler/firestore-tasks";
import { retryWithBackoff } from "@/lib/scheduling/retry-handler";

export const performDailyMaintenance = onSchedule("every 24 hours", async (context) => {
  // 1. Manual lock acquisition (Firestore-based)
  const lockId = "maintenance:daily";
  const lock = await acquireFirestoreLock(lockId, 3600000);

  if (!lock.acquired) {
    console.log("Maintenance already running elsewhere");
    return;
  }

  try {
    // 2. Manual retry wrapper
    await retryWithBackoff(
      async () => {
        const db = getFirestore();

        // 3. Unstructured logging
        console.log("Starting index rebuild");

        // 4. Synchronous batch processing (can timeout)
        const indexes = await db.collection("_indexes").get();
        const batch = db.batch();

        indexes.forEach((doc) => {
          batch.update(doc.ref, {
            rebuiltAt: new Date(),
            status: "ok",
          });
        });

        await batch.commit();

        console.log("Index rebuild complete");
      },
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        backoffMultiplier: 2, // ⚠️ Not validated
      },
    );
  } catch (error) {
    console.error("Maintenance failed:", error);
    // No structured error context
  } finally {
    await releaseFirestoreLock(lockId);
  }
});
```

**Problems:**

- Manual lock management (error-prone)
- Unvalidated retry config
- Bare console logging (not queryable)
- Synchronous batch can timeout
- No context about execution environment

#### ✅ AFTER (Framework Pattern)

```typescript
// functions/scheduled/maintenance.ts
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { structuredLogger } from "@/lib/logging";
import { executeWithLock } from "@/lib/scheduling/distributed-lock";

// Validated retry policy
const retryPolicy = {
  retryCount: 2,
  minBackoffDuration: "60s",
  maxBackoffDuration: "300s",
};

export const performDailyMaintenance = onSchedule(
  {
    schedule: "0 2 * * *", // 2 AM UTC
    timeZone: "UTC",
    retryConfig: retryPolicy,
  },
  async (context) => {
    const logger = structuredLogger(context);

    try {
      logger.info("maintenance_start", {
        taskId: context.eventId,
        scheduledTime: context.eventTime,
      });

      // Redis-backed distributed lock
      const success = await executeWithLock(
        "maintenance:daily",
        600_000, // 10 minute lock
        async () => {
          const db = getFirestore();
          const indexes = await db.collection("_indexes").get();

          // Chunked processing (prevents timeout)
          const chunkSize = 100;
          for (let i = 0; i < indexes.size; i += chunkSize) {
            const chunk = indexes.docs.slice(i, i + chunkSize);
            const batch = db.batch();

            chunk.forEach((doc) => {
              batch.update(doc.ref, {
                rebuiltAt: new Date(),
                status: "ok",
              });
            });

            await batch.commit();

            logger.info("maintenance_chunk_processed", {
              chunk: Math.floor(i / chunkSize),
              docsProcessed: chunk.length,
            });
          }

          logger.info("maintenance_complete", {
            totalDocs: indexes.size,
            durationMs: Date.now() - startTime,
          });
        },
      );

      if (!success) {
        logger.warn("maintenance_skipped", {
          reason: "lock_held_elsewhere",
        });
      }
    } catch (error) {
      logger.error("maintenance_failed", {
        error: error instanceof Error ? error.message : String(error),
        errorCode: (error as any)?.code,
      });

      // Framework will retry based on retryConfig
      throw error;
    }
  },
);
```

**Improvements:**

- Framework handles retry policy validation
- Distributed lock via Redis (atomic, efficient)
- Structured logging (queryable in Cloud Logging)
- Chunked processing (avoids timeout)
- Context propagation (taskId, timing)

---

### Example 2: Event-Triggered Deferred Task

#### ❌ BEFORE (Custom Queue)

```typescript
// DEPRECATED: Custom pub/sub-based queue
import { enqueueTask } from "@/services/queue";

export async function handleInvoiceCreated(invoiceId: string) {
  // Schedule invoice processing (deferred)
  await enqueueTask("process-invoice", {
    invoiceId,
    timestamp: Date.now(),
  });
}

// Separate function consumes queue
export const invoiceQueueWorker = onMessagePublished(
  "invoice-processing-topic",
  async (message) => {
    const { invoiceId } = message.json;

    try {
      const invoice = await fetchInvoice(invoiceId);
      await processInvoice(invoice);

      // Manual ack (no automatic retry)
      console.log("Invoice processed");
    } catch (error) {
      console.error("Failed to process invoice");
      // Message lost or indefinite retry
    }
  },
);
```

#### ✅ AFTER (Cloud Tasks)

```typescript
// NEW PATTERN: Cloud Tasks with HTTP handler
import { v2 as tasksV2 } from "@google-cloud/tasks";
import { onCallable } from "firebase-functions/v2/https";

const tasksClient = new tasksV2.CloudTasksClient();

export const handleInvoiceCreated = onCallable(async (data, context) => {
  const { invoiceId } = data;

  // Enqueue task in Cloud Tasks
  const project = process.env.GCP_PROJECT;
  const queue = "invoice-processing";
  const location = "us-central1";

  const parent = tasksClient.queuePath(project, location, queue);

  await tasksClient.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: "POST",
        url: process.env.INVOICE_HANDLER_URL,
        headers: { "Content-Type": "application/json" },
        body: Buffer.from(
          JSON.stringify({
            invoiceId,
            retryAttempt: 0,
          }),
        ).toString("base64"),
        oidcToken: {
          serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL,
          audience: process.env.INVOICE_HANDLER_URL,
        },
      },
      dispatchDeadline: "3600s", // 1 hour
      scheduleTime: {
        seconds: Math.floor(Date.now() / 1000),
      },
    },
  });

  return { enqueued: true, invoiceId };
});

// Task handler function
export const processInvoiceTask = onRequest(
  { cors: true, enforceAppCheck: false },
  async (req, res) => {
    const logger = structuredLogger(req);

    try {
      const { invoiceId, retryAttempt } = req.body;

      logger.info("invoice_processing_start", {
        invoiceId,
        retryAttempt,
        cloudTasksRetryCount: req.headers["x-cloudtasks-retry-count"],
      });

      const invoice = await fetchInvoice(invoiceId);
      await processInvoice(invoice);

      logger.info("invoice_processing_complete", { invoiceId });
      res.json({ success: true });
    } catch (error) {
      logger.error("invoice_processing_failed", { error });

      // Return 5xx to trigger Cloud Tasks retry
      res.status(500).json({ error: "Processing failed" });
    }
  },
);
```

**Improvements:**

- Built-in retry with exponential backoff
- Automatic deadletter queue
- Service-to-service auth (OIDC token)
- Structured logging with retry context
- Exactly-once semantics within retry window

---

## 4. Migration Checklist

### Phase 1: Prepare (Q4 2025 - December)

- \[ ] Audit all scheduled tasks in `functions/scheduled/`
- \[ ] Document retry policies for each task
- \[ ] Identify tasks requiring distributed locking
- \[ ] Set up Redis infrastructure (staging)
- \[ ] Create `SchedulingPolicy` codec with validation

### Phase 2: Framework Migration (Q1 2026 - January-March)

- \[ ] Migrate `firestore-tasks.ts` to `onSchedule` triggers
- \[ ] Replace `retryWithBackoff` with framework config
- \[ ] Implement Redis-backed distributed locking
- \[ ] Deploy observability middleware
- \[ ] Run parallel execution (old + new) for validation

### Phase 3: Queue Migration (Q2 2026 - April-June)

- \[ ] Migrate custom queue to Cloud Tasks
- \[ ] Update event handlers to use Cloud Tasks SDK
- \[ ] Deprecate pub/sub-based queue
- \[ ] Set up deadletter handling
- \[ ] Monitor for duplicate execution

### Phase 4: Cleanup (Q3 2026 - July-September)

- \[ ] Remove deprecated components
- \[ ] Consolidate scheduled task registry
- \[ ] Archive legacy code to audit folder
- \[ ] Update documentation
- \[ ] Conduct team training

---

## 5. Risk Assessment & Mitigation

| Risk                                         | Severity | Mitigation                                                             |
| -------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **Duplicate execution during migration**     | High     | Run canary deployment with duplicate detection (hash-based)            |
| **Lock contention in Redis**                 | Medium   | Pre-allocate locks; implement exponential backoff in lock acquisition  |
| **Task timeout during large migrations**     | Medium   | Split large tasks; increase function timeout for duration of migration |
| **Retry storm from misconfiguration**        | High     | Validate backoff multiplier at deploy time; add circuit breaker        |
| **Lost tasks during Cloud Tasks transition** | Medium   | Implement audit log; run reconciliation job to detect gaps             |

---

## 6. Cross-References

- **L2 Architecture:** See `03_SUBSYSTEMS_L2/scheduling.md` for comprehensive subsystem analysis
- **Task Dependency Graph:** See `04_COMPONENTS_L3/task-coordination.md` for multi-step workflows
- **Observability Standards:** See `04_COMPONENTS_L3/logging-standards.md` for structured logging codec
- **Cloud Tasks Documentation:** https://cloud.google.com/tasks/docs
- **Redlock Algorithm:** https://redis.io/docs/manual/patterns/distributed-locks/

---

## 7. Version History

| Date       | Author            | Changes                                           |
| ---------- | ----------------- | ------------------------------------------------- |
| 2025-11-30 | Architecture Team | Initial deprecation mapping and migration roadmap |
