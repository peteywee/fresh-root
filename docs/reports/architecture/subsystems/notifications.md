# L2 — Notifications & Communication
> **Status:** Documented from actual codebase analysis **Last Updated:** 2025-12-17 **Analyzed
> Routes:** 2 endpoints (publish, messages), 5 schemas

## 1. Role in the System
The Notifications & Communication subsystem is responsible for delivering timely updates to users
about schedule changes, shift assignments, and organizational events. The system currently defines
the foundational schemas and minimal infrastructure for multi-channel notifications (email, SMS,
push) but **lacks complete implementation**.

**Key Responsibilities:**

1. **Schedule Publishing Notifications** - Alert staff when schedules are published
2. **In-App Messaging** - Lightweight message system for org-wide and targeted communications
3. **Audit Receipts** - Track notification delivery and user acknowledgments
4. **Event Triggers** - Emit notifications based on system events (schedule.publish, shift.assign,
   etc.)

**Current State:** The subsystem is in **EARLY STAGE** - schemas are defined but delivery
mechanisms, queuing, templates, and retry logic are NOT implemented.

## 2. Actual Implementation Analysis
### 2.1 Endpoints Inventory
| Endpoint       | Method | Purpose                             | Auth          | Status      |
| -------------- | ------ | ----------------------------------- | ------------- | ----------- |
| `/api/publish` | POST   | Publish schedule with notifications | Org (manager) | Schema only |

**Note:** No dedicated `/api/notifications` or `/api/messages` CRUD endpoints exist yet.

### 2.2 Data Models & Types
#### Message Schema
From `/packages/types/src/messages.ts`:

```typescript
export const MessageSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  authorId: z.string().min(1), // uid or "system"
  channel: z.enum(["system", "inbox", "alerts", "schedule"]),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  createdAt: z.string(), // ISO

  // Targeting
  audience: z.union([
    z.literal("org"), // Broadcast to all
    z.object({
      type: z.literal("members"),
      memberIds: z.array(z.string().min(1)).min(1),
    }),
  ]),

  // Linkage to resources
  links: z
    .array(
      z.object({
        type: z.string().min(1), // "schedule", "shift", etc.
        id: z.string().min(1),
      }),
    )
    .optional(),

  // Read tracking
  readBy: z.array(z.string()).default([]),
});
```

**Design Notes:**

- **Channel segregation** - System vs user-facing messages
- **Flexible targeting** - Org-wide or specific members
- **Resource linking** - Connect messages to schedules/shifts
- **Read tracking** - Array-based tracking (potential scalability issue)

#### PublishRequest Schema
From `/packages/types/src/internal.ts`:

```typescript
export const PublishRequestSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID is required"),
  publishAt: z.number().int().positive().optional(),
  notifyUsers: z.boolean().default(true),
  channels: z.array(z.enum(["email", "push", "sms"])).default(["email"]),
});
```

**Design Notes:**

- **Multi-channel** - Email, push, SMS delivery (not implemented)
- **Opt-in/out** - `notifyUsers` flag for silent publishing
- **Scheduling** - `publishAt` for delayed notifications (not implemented)

#### Receipt Schema
From `/packages/types/src/receipts.ts`:

```typescript
export const ReceiptSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  actorId: z.string().min(1),
  action: z.enum([
    "schedule.publish",
    "shift.assign",
    "member.approve",
    "token.issue",
    "mfa.enroll",
    "mfa.verify",
  ]),
  resource: z
    .object({
      type: z.string().min(1),
      id: z.string().min(1),
    })
    .optional(),
  createdAt: z.string(), // ISO
  meta: z.record(z.string(), z.any()).default({}),
});
```

**Design Notes:**

- **Audit trail** - Track who did what and when
- **Resource context** - Link to the affected resource
- **Flexible metadata** - Store delivery status, error details, etc.

#### Event Schema
From `/packages/types/src/events.ts`:

```typescript
export const EventSchema = z.object({
  id: z.string(),
  at: z.number().int().positive(),
  category: EventCategory, // "onboarding", "network", "org", etc.
  type: EventType, // "network.created", "org.created", etc.

  // Optional scope
  actorUserId: z.string().optional(),
  networkId: z.string().optional(),
  orgId: z.string().optional(),
  venueId: z.string().optional(),

  payload: EventPayloadSchema,
});
```

**Design Notes:**

- **Event sourcing** - Append-only log for audit and analytics
- **Future AI data** - Events feed into future AI recommendations
- **Missing notification events** - No "schedule.published" or "shift.assigned" events defined

### 2.3 Firestore Collections (Expected)
**Collections defined in schemas but NOT confirmed in actual usage:**

- **`messages`** - In-app messages
  - Path: `/messages/{messageId}` or `/orgs/{orgId}/messages/{messageId}`
  - Fields: `id, orgId, authorId, channel, title, body, audience, links, readBy, createdAt`

- **`receipts`** - Audit trail for actions
  - Path: `/receipts/{receiptId}` or `/orgs/{orgId}/receipts/{receiptId}`
  - Fields: `id, orgId, actorId, action, resource, meta, createdAt`

- **`events`** - System event log
  - Path: `/events/{eventId}`
  - Fields: `id, at, category, type, actorUserId, networkId, orgId, payload`

**Missing Collections:**

- **`notification_preferences`** - User opt-in/out settings
- **`notification_queue`** - Pending notifications for delivery
- **`notification_templates`** - Email/SMS templates
- **`notification_logs`** - Delivery status and errors

### 2.4 Implementation Status
#### Publish Route Analysis
From `/apps/web/app/api/publish/route.ts`:

```typescript
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: PublishRequestSchema,
  handler: async ({ input, context }) => {
    try {
      const result = {
        success: true,
        scheduleId: input.scheduleId,
        publishedBy: context.auth?.userId,
        publishedAt: input.publishAt || Date.now(),
        notifyUsers: input.notifyUsers,
        channels: input.channels,
      };
      return ok(result);
    } catch {
      return serverError("Failed to publish schedule");
    }
  },
});
```

**Critical Issues:**

1. No actual Firestore write to mark schedule as published
2. No notification delivery (no emails/SMS/push sent)
3. No receipt creation for audit trail
4. No event emission for "schedule.publish"
5. Returns mock success response

## 3. Critical Findings
### CRITICAL-01: No Notification Delivery Infrastructure
**Location:** Entire subsystem **Issue:** Notification channels (email, SMS, push) are defined in
schemas but have ZERO implementation

**Evidence:**

```typescript
// packages/types/src/internal.ts
channels: z.array(z.enum(["email", "push", "sms"])).default(["email"]),

// apps/web/app/api/publish/route.ts - NO DELIVERY CODE
return ok({ channels: input.channels }); // Just echoes back
```

**Impact:**

- Users receive NO notifications when schedules are published
- Staff assignment changes are silent
- System appears functional but doesn't deliver on core promise

**Missing Components:**

1. **Email Service** - No SendGrid/AWS SES/Nodemailer integration
2. **SMS Service** - No Twilio/AWS SNS integration
3. **Push Service** - No Firebase Cloud Messaging (FCM) setup
4. **Queue System** - No Bull/Redis/Pub-Sub for async delivery
5. **Template Engine** - No Handlebars/Mustache for personalized messages
6. **Retry Logic** - No exponential backoff for failed deliveries

**Recommendation:** Implement notification delivery pipeline (see §5 for architecture)

### CRITICAL-02: Read Tracking Array Scalability Issue
**Location:** `/packages/types/src/messages.ts` **Issue:** `readBy` array grows unbounded, causing
performance degradation

```typescript
export const MessageSchema = z.object({
  readBy: z.array(z.string()).default([]), // PROBLEM!
});
```

**Problem:**

- Org-wide message to 1000 users = 1000-element array
- Firestore document max size = 1MB (arrays count toward limit)
- Array updates require full document read/write
- No pagination support for large teams

**Impact:**

- Message documents hit size limits in large orgs
- Read status queries become slow (O(n) array scans)
- Concurrent mark-as-read operations cause write conflicts

**Recommendation:** Use separate `message_reads` subcollection or map structure

### CRITICAL-03: No Notification Preferences
**Location:** Missing implementation **Issue:** Users cannot opt-in/opt-out of notification channels

**Missing:**

- User preference schema for email/SMS/push toggles
- Per-notification-type preferences (schedule changes, shift swaps, etc.)
- Quiet hours / Do Not Disturb settings
- Notification frequency controls (instant, digest, weekly)

**Impact:**

- Privacy/GDPR violations - cannot honor user preferences
- Spam complaints - users receive unwanted notifications
- Regulatory risk - CAN-SPAM Act requires opt-out mechanism

**Recommendation:** Create `NotificationPreferencesSchema` and user settings UI

### HIGH-01: No Queue System for Async Delivery
**Location:** Missing implementation **Issue:** Synchronous notification delivery blocks API
responses

**Current Flow (if implemented):**

```typescript
// BAD: Blocking delivery
await sendEmail(user.email, template);
await sendSMS(user.phone, message);
return ok({ published: true }); // Waits for delivery
```

**Problems:**

- API latency increases with number of recipients
- Single delivery failure fails entire request
- No retry mechanism for transient failures
- Cannot scale horizontally

**Recommendation:** Implement async queue (Firestore Tasks, Cloud Tasks, or Bull/Redis)

### HIGH-02: No Template System
**Location:** Missing implementation **Issue:** Hardcoded message content prevents localization and
personalization

**Missing:**

- Template storage (Firestore or external CMS)
- Variable substitution ({{userName}}, {{scheduleName}})
- Multi-language support (i18n)
- HTML vs plain text rendering
- Preview/testing tools

**Impact:**

- Cannot personalize notifications ("Hi Patrick" vs "Hi User")
- No localization (Spanish, French, etc.)
- Difficult to A/B test messaging
- Requires code deployment to change wording

**Recommendation:** Create template system with Handlebars or similar

### HIGH-03: Missing Delivery Status Tracking
**Location:** No implementation **Issue:** Cannot track if notifications were successfully delivered

**Missing:**

- Delivery logs (sent, delivered, failed, bounced)
- Webhook handling for email bounces / SMS failures
- Retry queue for failed deliveries
- User-facing delivery status ("Sent 10m ago", "Delivered")

**Impact:**

- Cannot debug delivery failures
- No visibility into notification health
- Cannot resend failed notifications
- Users don't know if message was sent

**Recommendation:** Add `notification_logs` collection with delivery status

### MEDIUM-01: No Rate Limiting on Notifications
**Location:** Missing implementation **Issue:** No protection against notification spam

**Risk Scenarios:**

- Buggy code triggers 1000s of notifications
- Malicious actor abuses publish endpoint
- Accidental spam from rapid schedule updates
- Cost explosion from cloud provider fees

**Recommendation:** Implement per-user, per-org rate limits (100/hour, 1000/day)

### MEDIUM-02: Missing Notification Deduplication
**Location:** Missing implementation **Issue:** Users may receive duplicate notifications

**Scenarios:**

- Schedule published twice within 5 minutes
- Retry logic resends on transient failure
- Multiple admins publish same schedule

**Recommendation:** Use idempotency keys or deduplication window (5-minute hash)

### MEDIUM-03: No Event Schema for Notifications
**Location:** `/packages/types/src/events.ts` **Issue:** Event types don't include
notification-relevant events

```typescript
export const EventType = z.enum([
  "network.created",
  "org.created",
  // MISSING:
  // "schedule.published",
  // "shift.assigned",
  // "notification.sent",
  // "notification.failed",
]);
```

**Recommendation:** Extend EventType to include notification events

## 4. Architectural Notes & Invariants
### Enforced Invariants (Schema Level)
1. **Channel Enum** - Only `email`, `push`, `sms` allowed (type-safe)
2. **Message Channels** - Only `system`, `inbox`, `alerts`, `schedule` (type-safe)
3. **Receipt Actions** - Limited action types prevent arbitrary strings
4. **Read Tracking** - `readBy` array tracks user IDs (scalability concern)

### Missing Invariants (Not Enforced)
1. **Notification Delivery** - No guarantee notifications are actually sent
2. **Template Validation** - No enforcement of required template variables
3. **Idempotency** - No deduplication of duplicate publish requests
4. **Rate Limiting** - No throttling on notification volume
5. **Audit Trail** - No guarantee receipts are created for actions
6. **User Preferences** - No enforcement of opt-out requests

### Design Principles (Implied)
1. **Multi-Channel First** - Design assumes multiple delivery channels
2. **Audit Everything** - Receipts track all notification-worthy actions
3. **Resource Linking** - Messages connect to originating resources
4. **Flexible Targeting** - Support both broadcast and targeted messages
5. **Read Tracking** - Track message read status (implementation flawed)

## 5. Example Patterns
### MISSING PATTERN: Notification Delivery Pipeline
**Current State:** No delivery infrastructure

**Recommended Architecture:**

```typescript
// 1. QUEUE LAYER: Async notification queuing
interface NotificationJob {
  jobId: string;
  type: "email" | "sms" | "push";
  recipient: {
    userId: string;
    email?: string;
    phone?: string;
    fcmToken?: string;
  };
  template: string;
  variables: Record<string, any>;
  scheduledAt?: number;
  priority: "high" | "normal" | "low";
  retryCount: number;
  maxRetries: number;
}

// 2. TEMPLATE SYSTEM: Personalized messages
interface NotificationTemplate {
  id: string;
  name: string; // "schedule_published"
  channels: ("email" | "sms" | "push")[];
  subject: string; // "{{scheduleName}} published for {{date}}"
  bodyHtml: string;
  bodyText: string;
  variables: string[]; // ["scheduleName", "date", "userName"]
  locales: Record<string, LocalizedTemplate>;
}

// 3. PREFERENCE SYSTEM: User opt-in/out
interface NotificationPreferences {
  userId: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  notificationTypes: {
    schedulePublished: boolean;
    shiftAssigned: boolean;
    shiftReminder: boolean;
    scheduleChanged: boolean;
  };
  quietHours?: {
    start: string; // "22:00"
    end: string; // "08:00"
    timezone: string;
  };
  digestMode?: "instant" | "hourly" | "daily" | "weekly";
}

// 4. DELIVERY SERVICE: Abstracted sending
interface NotificationService {
  sendEmail(params: EmailParams): Promise<DeliveryResult>;
  sendSMS(params: SMSParams): Promise<DeliveryResult>;
  sendPush(params: PushParams): Promise<DeliveryResult>;
}

// 5. DELIVERY LOG: Track status
interface NotificationLog {
  id: string;
  jobId: string;
  userId: string;
  type: "email" | "sms" | "push";
  status: "queued" | "sent" | "delivered" | "failed" | "bounced";
  sentAt?: number;
  deliveredAt?: number;
  failedAt?: number;
  error?: string;
  provider: string; // "sendgrid", "twilio", "fcm"
  providerId?: string; // External message ID
  metadata: Record<string, any>;
}
```

### GOOD PATTERN: Message Schema Design
**File:** `/packages/types/src/messages.ts`

```typescript
export const MessageSchema = z.object({
  channel: z.enum(["system", "inbox", "alerts", "schedule"]),
  audience: z.union([
    z.literal("org"),
    z.object({
      type: z.literal("members"),
      memberIds: z.array(z.string().min(1)).min(1),
    }),
  ]),
  links: z
    .array(
      z.object({
        type: z.string().min(1),
        id: z.string().min(1),
      }),
    )
    .optional(),
});
```

**Why Good:**

- **Channel segregation** - Separates system alerts from user messages
- **Flexible targeting** - Supports both broadcast and targeted delivery
- **Resource linking** - Connects messages to related entities
- **Type-safe** - Zod validation prevents invalid data

### BAD PATTERN: Read Tracking with Array
**File:** `/packages/types/src/messages.ts`

```typescript
export const MessageSchema = z.object({
  readBy: z.array(z.string()).default([]), // PROBLEM!
});
```

**Why Bad:**

- **Unbounded growth** - Array grows with every reader
- **Document size limit** - Firestore 1MB limit hit in large orgs
- **Write conflicts** - Concurrent reads cause conflicts
- **Poor query performance** - O(n) array scans

**Better Alternative:**

```typescript
// Option 1: Subcollection
// /messages/{messageId}/reads/{userId}
export const MessageReadSchema = z.object({
  messageId: z.string(),
  userId: z.string(),
  readAt: z.number(),
});

// Option 2: Map structure (limited to ~1000 users)
export const MessageSchema = z.object({
  readByMap: z.record(z.string(), z.number()).optional(), // userId -> timestamp
});

// Option 3: Separate collection with compound index
// /message_reads/{id} with index on (messageId, userId)
export const MessageReadSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  userId: z.string(),
  readAt: z.number(),
});
```

### BAD PATTERN: No Actual Notification Sending
**File:** `/apps/web/app/api/publish/route.ts`

```typescript
export const POST = createOrgEndpoint({
  handler: async ({ input, context }) => {
    try {
      const result = {
        success: true,
        notifyUsers: input.notifyUsers,
        channels: input.channels,
      };
      return ok(result); // NO ACTUAL SENDING!
    } catch {
      return serverError("Failed to publish schedule");
    }
  },
});
```

**Why Bad:**

- No Firestore write to mark schedule as published
- No notification delivery code
- No receipt creation for audit
- Returns success even though nothing happened

**Refactored Pattern:**

```typescript
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: PublishRequestSchema,
  idempotency: { keyField: "requestId" },
  handler: async ({ input, context }) => {
    const scheduleId = input.scheduleId;
    const publisherId = context.auth!.userId;
    const orgId = context.org!.orgId;

    // 1. Update schedule status
    const scheduleRef = adminDb.collection("schedules").doc(scheduleId);
    await updateDocWithType<Schedule>(adminDb, scheduleRef, {
      status: "published",
      publishedAt: Timestamp.now(),
      publishedBy: publisherId,
    });

    // 2. Create audit receipt
    const receiptRef = adminDb.collection("receipts").doc();
    await setDoc(receiptRef, {
      id: receiptRef.id,
      orgId,
      actorId: publisherId,
      action: "schedule.publish",
      resource: { type: "schedule", id: scheduleId },
      createdAt: new Date().toISOString(),
      meta: {
        notifyUsers: input.notifyUsers,
        channels: input.channels,
      },
    });

    // 3. Emit event for audit log
    await emitEvent({
      category: "schedule",
      type: "schedule.published",
      actorUserId: publisherId,
      orgId,
      payload: { scheduleId, channels: input.channels },
    });

    // 4. Queue notifications (if enabled)
    if (input.notifyUsers) {
      const staff = await getScheduleStaff(scheduleId);
      const jobs = staff.map((user) => ({
        type: "notification.schedule.published",
        userId: user.uid,
        scheduleId,
        channels: input.channels,
        priority: "normal",
      }));

      await queueNotifications(jobs);
    }

    return ok({
      success: true,
      scheduleId,
      publishedBy: publisherId,
      publishedAt: Date.now(),
      notificationsQueued: input.notifyUsers ? staff.length : 0,
    });
  },
});
```

### REFACTORED PATTERN: Notification Queue Worker
**Missing Implementation - Recommended:**

```typescript
// Cloud Function or background worker
export async function processNotificationQueue() {
  const batch = await getNextNotificationBatch(100);

  for (const job of batch) {
    try {
      // 1. Check user preferences
      const prefs = await getUserPreferences(job.userId);
      if (!shouldSendNotification(job, prefs)) {
        await markJobSkipped(job.id, "user_preferences");
        continue;
      }

      // 2. Check quiet hours
      if (inQuietHours(prefs)) {
        await rescheduleJob(job.id, getEndOfQuietHours(prefs));
        continue;
      }

      // 3. Load template
      const template = await getTemplate(job.templateName);
      const rendered = renderTemplate(template, job.variables);

      // 4. Send via appropriate channel
      let result: DeliveryResult;
      if (job.type === "email") {
        result = await sendEmail({
          to: job.recipient.email,
          subject: rendered.subject,
          html: rendered.bodyHtml,
          text: rendered.bodyText,
        });
      } else if (job.type === "sms") {
        result = await sendSMS({
          to: job.recipient.phone,
          body: rendered.bodyText,
        });
      } else if (job.type === "push") {
        result = await sendPush({
          token: job.recipient.fcmToken,
          title: rendered.subject,
          body: rendered.bodyText,
          data: job.metadata,
        });
      }

      // 5. Log delivery status
      await createNotificationLog({
        jobId: job.id,
        userId: job.userId,
        type: job.type,
        status: result.success ? "sent" : "failed",
        provider: result.provider,
        providerId: result.messageId,
        error: result.error,
      });

      // 6. Mark job complete or retry
      if (result.success) {
        await markJobComplete(job.id);
      } else if (job.retryCount < job.maxRetries) {
        await retryJob(job.id, getBackoffDelay(job.retryCount));
      } else {
        await markJobFailed(job.id, "max_retries_exceeded");
      }
    } catch (error) {
      console.error("Notification processing failed", { job, error });
      await handleJobError(job.id, error);
    }
  }
}
```

## 6. Open Questions
1. **What third-party services should we use?**
   - Email: SendGrid, AWS SES, Mailgun, Postmark?
   - SMS: Twilio, AWS SNS, Vonage?
   - Push: Firebase Cloud Messaging (FCM) or custom?

1. **What queue system should we adopt?**
   - Firestore Tasks (native but limited)?
   - Google Cloud Tasks (managed, scalable)?
   - Bull + Redis (self-hosted, flexible)?
   - Cloud Pub/Sub (GCP native)?

1. **How should templates be stored and managed?**
   - Firestore collection for templates?
   - External CMS (Contentful, Strapi)?
   - Git-based templates in codebase?
   - Admin UI for template editing?

1. **What template engine should we use?**
   - Handlebars (most common)?
   - Mustache (simpler)?
   - Liquid (Shopify-style)?
   - React Email (JSX-based)?

1. **How should read tracking scale?**
   - Subcollection per message?
   - Separate `message_reads` collection?
   - Map structure with 1000-user limit?
   - Hybrid approach (map for small, subcollection for large)?

1. **What retry strategy should we use?**
   - Exponential backoff (2^n seconds)?
   - Fixed intervals (1h, 6h, 24h)?
   - Channel-specific strategies?
   - Max retry count (3, 5, 10)?

1. **How should notification preferences be structured?**
   - Per-channel opt-in/out?
   - Per-notification-type granularity?
   - Digest mode support (daily, weekly)?
   - Quiet hours per timezone?

1. **What compliance requirements exist?**
   - CAN-SPAM Act (email unsubscribe)?
   - GDPR (data portability, right to erasure)?
   - TCPA (SMS consent requirements)?
   - CASL (Canadian anti-spam law)?

1. **How should delivery status be exposed to users?**
   - User-facing notification history page?
   - Delivery receipts ("Sent", "Delivered", "Read")?
   - Failed notification UI?
   - Resend button for failed notifications?

1. **What observability/monitoring is needed?**
    - Delivery success rate metrics?
    - Channel-specific latency tracking?
    - Cost monitoring per provider?
    - Alert on high failure rate?

## 7. Recommendations Summary
| Priority | Action                                                       | Estimated Effort |
| -------- | ------------------------------------------------------------ | ---------------- |
| P0       | Implement notification delivery pipeline (email, SMS, push)  | 2-3 weeks        |
| P0       | Create notification queue system (Cloud Tasks or Bull/Redis) | 1 week           |
| P0       | Add notification preferences schema and UI                   | 1 week           |
| P0       | Fix read tracking scalability (subcollection or map)         | 2-3 days         |
| P1       | Implement template system with variable substitution         | 1 week           |
| P1       | Add delivery status tracking and logging                     | 1 week           |
| P1       | Create notification-related event types                      | 2 days           |
| P1       | Implement idempotency and deduplication                      | 3 days           |
| P2       | Add rate limiting per user/org                               | 2-3 days         |
| P2       | Build notification history UI for users                      | 1 week           |
| P2       | Add retry logic with exponential backoff                     | 3-4 days         |
| P2       | Implement digest mode (daily/weekly summaries)               | 1 week           |
| P3       | Add A/B testing for notification templates                   | 1 week           |
| P3       | Multi-language support (i18n)                                | 1-2 weeks        |

**Total Estimated Effort:** 10-14 weeks

## 8. Related Subsystems
- **Scheduling** - Triggers schedule.publish notifications
- **Staff Management** - Shift assignments trigger notifications
- **RBAC/Security** - Permissions control who can send org-wide messages
- **Events/Audit** - Notification events feed into audit log
- **Organizations** - Org context for message scoping

## 9. Next Steps
1. **P0 (Immediate):**
   - Select third-party providers (SendGrid + Twilio + FCM recommended)
   - Implement basic email delivery for schedule publishing
   - Create `notification_preferences` schema
   - Fix `readBy` scalability issue with subcollection

1. **P1 (Short-term - 1 month):**
   - Build queue system with Cloud Tasks or Bull
   - Create template system with Handlebars
   - Add delivery status tracking
   - Implement retry logic

1. **P2 (Medium-term - 3 months):**
   - SMS and push notification delivery
   - Notification history UI
   - Rate limiting and deduplication
   - Digest mode support

1. **P3 (Long-term - 6 months):**
   - Multi-language support
   - A/B testing framework
   - Advanced analytics dashboard
   - Cost optimization analysis

## 10. Code Examples & References
### Minimal Email Integration (SendGrid)
```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: EmailParams): Promise<DeliveryResult> {
  try {
    const msg = {
      to: params.to,
      from: "noreply@freshschedules.com",
      subject: params.subject,
      html: params.html,
      text: params.text || stripHtml(params.html),
    };

    const [response] = await sgMail.send(msg);

    return {
      success: true,
      provider: "sendgrid",
      messageId: response.headers["x-message-id"],
    };
  } catch (error) {
    console.error("Email send failed", { params, error });
    return {
      success: false,
      provider: "sendgrid",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### Minimal SMS Integration (Twilio)
```typescript
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface SMSParams {
  to: string; // E.164 format: +15551234567
  body: string;
}

export async function sendSMS(params: SMSParams): Promise<DeliveryResult> {
  try {
    const message = await client.messages.create({
      to: params.to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: params.body,
    });

    return {
      success: true,
      provider: "twilio",
      messageId: message.sid,
    };
  } catch (error) {
    console.error("SMS send failed", { params, error });
    return {
      success: false,
      provider: "twilio",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### Minimal Push Notification Integration (FCM)
```typescript
import { getMessaging } from "firebase-admin/messaging";

interface PushParams {
  token: string; // FCM device token
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPush(params: PushParams): Promise<DeliveryResult> {
  try {
    const message = {
      token: params.token,
      notification: {
        title: params.title,
        body: params.body,
      },
      data: params.data,
      android: {
        priority: "high" as const,
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };

    const messageId = await getMessaging().send(message);

    return {
      success: true,
      provider: "fcm",
      messageId,
    };
  } catch (error) {
    console.error("Push send failed", { params, error });
    return {
      success: false,
      provider: "fcm",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

---

**Document Metadata:**

- **Analyzed Files:** 8 type definitions, 2 API routes, 0 implementations
- **Lines of Code Analyzed:** ~400 LOC (schemas only)
- **Critical Findings:** 3 blocking issues
- **High Findings:** 3 major gaps
- **Medium Findings:** 3 design improvements needed
- **Implementation Status:** ~5% (schemas only, no delivery infrastructure)
