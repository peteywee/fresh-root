# L2 — Billing, Subscription & Pricing Subsystem

> **Status:** 🟡 Schema-Only Implementation (No Active Payment Processing) **Last Updated:**
> 2025-12-17 **Implementation Status:** Type definitions exist, but no billing logic implemented

## 1. Role in the System

The Billing & Pricing subsystem is designed to manage subscription tiers, usage limits, and payment
processing for the Fresh Schedules platform. Currently, it exists **only as type definitions** - no
actual billing routes, Stripe integration, or payment processing has been implemented.

**Current State:**

- ✅ Type schemas defined for plans, billing modes, and subscription tiers
- ✅ Usage limit fields present in Network and Organization schemas
- ❌ No API endpoints for billing operations
- ❌ No Stripe or payment provider integration
- ❌ No usage metering or quota enforcement
- ❌ No invoice generation or payment webhooks

## 2. Actual Implementation Analysis

### 2.1 Type Definitions Inventory

#### Network-Level Billing (from `packages/types/src/networks.ts`)

```typescript
// Subscription Plans
export const NetworkPlan = z.enum([
  "free",
  "starter",
  "growth",
  "enterprise",
  "internal", // For internal/testing use
]);
export type NetworkPlan = z.infer<typeof NetworkPlan>;

// Payment Methods
export const BillingMode = z.enum([
  "none", // No billing (free tier or trial)
  "card", // Credit card via Stripe
  "invoice", // Monthly invoicing
  "partner_billed", // Billed through partner/reseller
]);
export type BillingMode = z.infer<typeof BillingMode>;

// Network Schema (billing fields)
export const NetworkSchema = z.object({
  // ... other fields ...

  // Subscription
  plan: NetworkPlan.optional(),
  billingMode: BillingMode.optional(),

  // Usage Limits
  maxVenues: z.number().int().nullable().optional(),
  maxActiveOrgs: z.number().int().nullable().optional(),
  maxActiveUsers: z.number().int().nullable().optional(),
  maxShiftsPerDay: z.number().int().nullable().optional(),
});
```

#### Organization-Level Billing (from `packages/types/src/orgs.ts`)

```typescript
// Subscription Tiers
export const SubscriptionTier = z.enum(["free", "starter", "professional", "enterprise"]);
export type SubscriptionTier = z.infer<typeof SubscriptionTier>;

// Organization Status (includes billing states)
export const OrganizationStatus = z.enum([
  "active", // Paid and current
  "suspended", // Payment failed or admin action
  "trial", // In trial period
  "cancelled", // Subscription cancelled
]);
export type OrganizationStatus = z.infer<typeof OrganizationStatus>;

// Organization Schema (billing fields)
export const OrganizationSchema = z.object({
  // ... other fields ...

  status: OrganizationStatus.optional(),
  subscriptionTier: SubscriptionTier.optional(),

  // Trial & Subscription Dates
  trialEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
  subscriptionEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
});
```

### 2.2 Missing Implementation Components

#### ❌ No Billing API Endpoints

**Expected but not found:**

- `/api/billing/subscribe` - Create subscription
- `/api/billing/update-payment-method` - Update card
- `/api/billing/cancel` - Cancel subscription
- `/api/billing/invoices` - List invoices
- `/api/billing/usage` - View current usage
- `/api/webhooks/stripe` - Handle Stripe events

**Actual routes found:** Zero billing endpoints exist.

#### ❌ No Payment Provider Integration

**No Stripe SDK imports found in codebase:**

```bash
$ grep -r "stripe" apps/web functions packages --include="*.ts"
# Zero results (excluding node_modules)
```

**Expected integration points:**

- Stripe Checkout Sessions
- Stripe Customer Portal
- Stripe Webhooks (subscription.created, invoice.paid, etc.)
- Payment Intent handling

#### ❌ No Usage Metering

**Expected metering targets:**

- Active users per organization
- Venues per network
- Shifts created per day/month
- API requests per billing period

**Current state:**

- Usage limits defined in schemas but never checked
- No middleware to enforce quotas
- No background jobs to track usage

#### ❌ No Invoice Generation

**Expected functionality:**

- Monthly invoice generation
- PDF invoice rendering
- Email delivery to billing contacts
- Invoice history and downloads

**Current state:** None implemented

### 2.3 Firestore Collections (Billing-Related)

**Expected Collections (not found):**

```typescript
// Expected but MISSING:
/subscriptions/{networkId} - Subscription state
/invoices/{invoiceId} - Invoice records
/payment_methods/{customerId}/{methodId} - Stored cards
/usage_logs/{networkId}/{timestamp} - Daily usage snapshots
/billing_events/{eventId} - Audit log for billing actions
```

**Collections that DO exist with billing fields:**

```typescript
/networks/{networkId}
  - plan: NetworkPlan
  - billingMode: BillingMode
  - maxVenues, maxActiveOrgs, maxActiveUsers, maxShiftsPerDay

/orgs/{orgId}
  - status: OrganizationStatus
  - subscriptionTier: SubscriptionTier
  - trialEndsAt, subscriptionEndsAt
```

## 3. Critical Findings

### 🔴 CRITICAL-01: Complete Absence of Payment Processing

**Location:** Entire codebase **Issue:** No payment processing infrastructure exists

**Evidence:**

```typescript
// Only evidence of billing is type definitions:
export const NetworkPlan = z.enum(["free", "starter", ...]);

// But zero usage of these types in actual logic:
$ grep -r "NetworkPlan" apps/web/app/api --include="*.ts"
# Only import statements, no actual checks
```

**Impact:**

- 🔴 Cannot monetize the platform
- 🔴 All users default to unmetered access
- 🔴 No revenue tracking or reporting
- 🔴 Cannot enforce subscription limits

**Recommendation:** Build complete billing subsystem before production launch

### 🔴 CRITICAL-02: No Quota Enforcement

**Location:** All API routes **Issue:** Usage limits defined but never enforced

**Example - Organizations route:**

```typescript
// File: apps/web/app/api/organizations/route.ts
export const POST = createAuthenticatedEndpoint({
  input: CreateOrganizationSchema,
  handler: async ({ input, context }) => {
    const { name, networkId } = input;

    // ❌ PROBLEM: No check against maxActiveOrgs!
    // Should verify:
    // 1. Get network's maxActiveOrgs limit
    // 2. Count current active orgs
    // 3. Reject if at limit

    const orgRef = adminDb.collection("organizations").doc();
    await setDoc(orgRef, {
      id: orgRef.id,
      name,
      networkId,
      createdAt: Timestamp.now(),
    });

    return ok({ id: orgRef.id });
  },
});
```

**Impact:**

- ⚠️ Users can exceed plan limits
- ⚠️ No upgrade prompts when hitting limits
- ⚠️ Impossible to enforce tiered pricing

**Recommendation:** Add quota middleware to all resource creation endpoints

### 🔴 CRITICAL-03: Trial Periods Not Enforced

**Location:** Organization schema has `trialEndsAt` but no enforcement **Issue:** Trials defined but
never expire

**Evidence:**

```typescript
// File: packages/types/src/orgs.ts
export const OrganizationSchema = z.object({
  trialEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(), // ✅ Field exists
  // ... but no code checks if trial expired!
});
```

**Impact:**

- ⚠️ Free trials run indefinitely
- ⚠️ No automatic conversion to paid
- ⚠️ No trial expiration warnings

**Recommendation:** Add trial check middleware to all authenticated routes

### 🟡 HIGH-01: Inconsistent Plan/Tier Naming

**Location:** `networks.ts` and `orgs.ts` **Issue:** Two similar but incompatible enums

**Problem:**

```typescript
// Network-level plans
NetworkPlan = "free" | "starter" | "growth" | "enterprise" | "internal";

// Org-level tiers
SubscriptionTier = "free" | "starter" | "professional" | "enterprise";
```

**Conflicts:**

- `growth` vs `professional` - which is which?
- Can network be on "growth" but org on "professional"?
- How do they relate in hierarchy?

**Impact:**

- ⚠️ Unclear which tier controls what features
- ⚠️ Potential for mismatched billing states

**Recommendation:** Unify into single source of truth or document relationship

### 🟡 HIGH-02: No Billing Contact Information

**Location:** Organization schema **Issue:** No billing-specific contact fields

**Current schema:**

```typescript
export const OrganizationSchema = z.object({
  contactEmail: z.string().email().optional(), // Generic contact
  contactPhone: z.string().max(20).optional(),
  // ❌ Missing: billingEmail, billingContact, billingAddress
});
```

**Impact:**

- ⚠️ Invoices can't be sent to billing dept
- ⚠️ Payment failures have no escalation path
- ⚠️ Can't separate billing from technical contacts

**Recommendation:** Add dedicated billing contact fields

### 🟡 HIGH-03: No Audit Trail for Billing Events

**Location:** N/A (missing entirely) **Issue:** No tracking of subscription changes, payments, or
failures

**Expected but missing:**

```typescript
// Should exist:
/billing_events/{eventId}
  - eventType: "subscription.created" | "payment.succeeded" | ...
  - networkId: string
  - amount: number
  - timestamp: Timestamp
  - metadata: Record<string, any>
```

**Impact:**

- ⚠️ Can't debug billing issues
- ⚠️ No financial audit trail
- ⚠️ Can't reconcile revenue

**Recommendation:** Implement billing event log collection

## 4. Architectural Notes & Invariants

### ✅ Correctly Designed (Schema-Level)

1. **Plan Hierarchy:** Network → Organization separation makes sense
2. **Nullable Limits:** `maxVenues: z.number().int().nullable()` - allows unlimited
3. **Multiple Billing Modes:** Supports card, invoice, and partner billing
4. **Trial Support:** Schema includes trial period tracking
5. **Status Enum:** Captures all subscription states

### ⚠️ Missing Invariants (Need Implementation)

1. **Quota Enforcement:** Resources MUST NOT exceed plan limits
2. **Trial Expiration:** Expired trials MUST be downgraded or suspended
3. **Payment Validation:** Subscription changes MUST validate payment method
4. **Billing Consistency:** Network plan MUST match org subscription tier
5. **Audit Logging:** All billing events MUST be logged immutably

### 🏗️ Recommended Architecture

```typescript
// Proposed middleware structure
export const withQuotaCheck = (resourceType: string) => {
  return async (handler: Handler) => {
    return async (req, res) => {
      const network = await getNetwork(req.networkId);
      const usage = await getUsage(req.networkId, resourceType);

      const limit = getLimitForResource(network.plan, resourceType);
      if (limit !== null && usage >= limit) {
        return forbidden({
          error: "Plan limit reached",
          code: "QUOTA_EXCEEDED",
          details: {
            resource: resourceType,
            limit,
            usage,
            plan: network.plan,
          },
        });
      }

      return handler(req, res);
    };
  };
};

// Usage:
export const POST = createAuthenticatedEndpoint({
  input: CreateOrgSchema,
  middleware: [withQuotaCheck("organizations")],
  handler: async ({ input }) => {
    // Create org...
  },
});
```

## 5. Example Patterns

### ❌ Current Pattern: No Enforcement

```typescript
// File: apps/web/app/api/venues/route.ts
export const POST = createAuthenticatedEndpoint({
  input: CreateVenueSchema,
  handler: async ({ input }) => {
    // ❌ PROBLEM: No quota check!
    const venueRef = adminDb.collection("venues").doc();
    await setDoc(venueRef, {
      ...input,
      id: venueRef.id,
    });
    return ok({ id: venueRef.id });
  },
});
```

**Why Bad:**

- No limit enforcement
- Plan is never consulted
- Users can create unlimited resources

### ✅ Recommended Pattern: Quota Middleware

```typescript
// File: apps/web/app/api/venues/route.ts
export const POST = createAuthenticatedEndpoint({
  input: CreateVenueSchema,
  middleware: [
    withNetworkAccess(), // Ensures network exists
    withQuotaCheck("venues"), // ✅ Enforces maxVenues limit
  ],
  handler: async ({ input, context }) => {
    const venueRef = adminDb.collection("venues").doc();

    await runTransaction(adminDb, async (tx) => {
      // 1. Create venue
      tx.set(venueRef, {
        ...input,
        id: venueRef.id,
        createdAt: Timestamp.now(),
      });

      // 2. Increment usage counter
      const usageRef = adminDb.collection("usage_counters").doc(`${context.networkId}_venues`);
      tx.set(
        usageRef,
        {
          count: FieldValue.increment(1),
          lastUpdated: Timestamp.now(),
        },
        { merge: true },
      );
    });

    return ok({ id: venueRef.id });
  },
});
```

**Why Good:**

- ✅ Quota checked before creation
- ✅ Usage tracked atomically
- ✅ Transaction ensures consistency

### ✅ Recommended Pattern: Trial Enforcement Middleware

```typescript
// File: packages/api-framework/src/middleware/trial.ts
export const withTrialCheck = () => {
  return async (req: NextRequest, context: AuthContext): Promise<Response | void> => {
    const org = await getOrganization(context.orgId);

    if (org.status === "trial" && org.trialEndsAt) {
      const now = Date.now();
      const trialEnd =
        typeof org.trialEndsAt === "number" ? org.trialEndsAt : new Date(org.trialEndsAt).getTime();

      if (now > trialEnd) {
        // Trial expired - suspend org
        await updateDoc(orgRef, {
          status: "suspended",
          suspendedReason: "trial_expired",
          suspendedAt: Timestamp.now(),
        });

        return forbidden({
          error: "Trial period has ended",
          code: "TRIAL_EXPIRED",
          details: {
            trialEndsAt: org.trialEndsAt,
            upgradeUrl: "/billing/upgrade",
          },
        });
      }
    }

    // Trial valid or org is paid
    return;
  };
};

// Usage in routes:
export const POST = createAuthenticatedEndpoint({
  input: CreateScheduleSchema,
  middleware: [withTrialCheck()], // ✅ Check trial before scheduling
  handler: async ({ input }) => {
    // Create schedule...
  },
});
```

### ✅ Recommended Pattern: Stripe Webhook Handler

```typescript
// File: apps/web/app/api/webhooks/stripe/route.ts
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
    });
  }

  // Handle events
  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;

    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(event.data.object);
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const networkId = subscription.metadata.networkId;

  await updateDoc(adminDb.collection("networks").doc(networkId), {
    plan: mapStripePlanToNetworkPlan(subscription.items.data[0].price.id),
    billingMode: "card",
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    updatedAt: Timestamp.now(),
  });

  // Log event
  await addDoc(adminDb.collection("billing_events"), {
    eventType: "subscription.created",
    networkId,
    stripeEventId: subscription.id,
    timestamp: Timestamp.now(),
    metadata: {
      plan: subscription.items.data[0].price.id,
      status: subscription.status,
    },
  });
}
```

## 6. Open Questions

1. **What is the pricing model?**
   - Per-user? Per-venue? Per-organization?
   - Flat monthly fee or usage-based?
   - How do Network vs Organization plans interact?

2. **What features are gated by plan tier?**
   - Is AI scheduling only for enterprise?
   - Are analytics available in starter?
   - What's the feature matrix per plan?

3. **How should trials work?**
   - Automatic trial on signup?
   - How many days?
   - What happens when trial expires (grace period, immediate suspend)?

4. **What payment providers are planned?**
   - Stripe only or also PayPal, Square?
   - International payment methods?
   - Cryptocurrency?

5. **How are network-level vs org-level plans related?**
   - Can org exceed network's plan?
   - Do limits cascade (network limit → org limit)?
   - Who pays - network owner or org owner?

6. **What's the upgrade/downgrade flow?**
   - Immediate effect or next billing cycle?
   - Prorated refunds?
   - Data retention on downgrade?

7. **How are partners/resellers handled?**
   - Commission structure?
   - White-label pricing?
   - Separate admin portal?

## 7. Recommendations Summary

| Priority | Action                                                | Estimated Effort |
| -------- | ----------------------------------------------------- | ---------------- |
| 🔴 P0    | Design and document pricing model                     | 2-3 days         |
| 🔴 P0    | Implement Stripe integration (checkout, webhooks)     | 5-7 days         |
| 🔴 P0    | Build quota enforcement middleware                    | 3-4 days         |
| 🔴 P0    | Implement trial expiration logic                      | 2-3 days         |
| 🟡 P1    | Add billing API endpoints (subscribe, cancel, update) | 4-5 days         |
| 🟡 P1    | Build usage metering and tracking                     | 3-4 days         |
| 🟡 P1    | Create billing event audit log                        | 2-3 days         |
| 🟡 P1    | Add billing contact fields to schemas                 | 1 day            |
| 🟢 P2    | Build customer billing portal                         | 3-5 days         |
| 🟢 P2    | Implement invoice generation and email                | 3-4 days         |
| 🟢 P2    | Create admin billing dashboard                        | 4-5 days         |
| 🟢 P2    | Add usage analytics and reporting                     | 3-4 days         |

**Total Estimated Effort:** ~35-50 days (full billing subsystem)

## 8. Related Subsystems

- **Authentication** - Trial checks must integrate with auth middleware
- **Organizations** - Org status tied to subscription state
- **Networks** - Network plans govern org limits
- **RBAC** - Billing admins need special permissions
- **Onboarding** - New signups need trial activation
- **Notifications** - Payment failures, trial expiration warnings

## 9. Next Steps

### Phase 1: Foundation (P0)

1. Document pricing model and feature matrix
2. Set up Stripe account and API keys
3. Design billing database schema (subscriptions, invoices, etc.)
4. Implement quota middleware framework

### Phase 2: Core Billing (P0)

1. Build Stripe checkout integration
2. Implement webhook handler for subscription events
3. Add trial expiration middleware
4. Create basic billing API endpoints

### Phase 3: Enforcement (P1)

1. Add quota checks to all resource creation routes
2. Implement usage tracking and metering
3. Build billing event audit log
4. Add upgrade prompts when limits hit

### Phase 4: Customer Experience (P2)

1. Build customer billing portal
2. Implement invoice generation
3. Create billing notification system
4. Add usage analytics dashboard

## 10. Implementation Checklist

### Data Layer

- [ ] Create `/subscriptions/{networkId}` collection
- [ ] Create `/invoices/{invoiceId}` collection
- [ ] Create `/payment_methods/{customerId}/{methodId}` collection
- [ ] Create `/usage_logs/{networkId}/{date}` collection
- [ ] Create `/billing_events/{eventId}` audit log
- [ ] Add billing contact fields to Organization schema
- [ ] Add Stripe IDs to Network schema (customerId, subscriptionId)

### API Layer

- [ ] `POST /api/billing/checkout` - Create Stripe checkout session
- [ ] `POST /api/billing/portal` - Redirect to customer portal
- [ ] `POST /api/billing/cancel` - Cancel subscription
- [ ] `GET /api/billing/invoices` - List invoices
- [ ] `GET /api/billing/usage` - Current usage stats
- [ ] `POST /api/webhooks/stripe` - Handle Stripe events

### Middleware

- [ ] `withQuotaCheck(resource)` - Enforce plan limits
- [ ] `withTrialCheck()` - Validate trial status
- [ ] `withBillingAccess()` - Verify user can manage billing

### Background Jobs

- [ ] Daily usage aggregation (count users, venues, shifts)
- [ ] Trial expiration checker (runs daily)
- [ ] Failed payment retry (runs daily)
- [ ] Usage limit notifications (near quota warnings)

### Testing

- [ ] Unit tests for quota enforcement logic
- [ ] Integration tests for Stripe webhooks
- [ ] E2E tests for subscription lifecycle
- [ ] Load tests for usage metering

## 11. Pricing Model Proposal (Draft)

**Note:** This is a placeholder based on schema analysis. Needs product/business validation.

### Free Plan

- **Cost:** $0/month
- **Limits:**
  - 1 organization
  - 2 venues
  - 10 active users
  - 50 shifts/day
- **Features:** Basic scheduling, mobile app

### Starter Plan

- **Cost:** $29/month
- **Limits:**
  - 1 organization
  - 5 venues
  - 25 active users
  - 200 shifts/day
- **Features:** + Analytics, email support

### Growth/Professional Plan

- **Cost:** $99/month
- **Limits:**
  - 3 organizations
  - 15 venues
  - 100 active users
  - 1000 shifts/day
- **Features:** + AI scheduling, priority support, API access

### Enterprise Plan

- **Cost:** Custom pricing
- **Limits:** Unlimited (or custom)
- **Features:** + Custom integrations, dedicated support, SLA

### Internal Plan

- **Cost:** N/A (for testing/demos)
- **Limits:** Unlimited
- **Features:** All features enabled
