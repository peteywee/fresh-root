---

title: "[ARCHIVED] Fresh Schedules: Complete Application Flow"
description: "Archived full application flow walkthrough from sign-in to logout."
keywords:
  - archive
  - app-flow
  - onboarding
  - journey
category: "archive"
status: "archived"
audience:
  - developers
  - designers
createdAt: "2026-01-31T07:18:58Z"
lastUpdated: "2026-01-31T07:18:58Z"

---

# Fresh Schedules: Complete Application Flow

> **Complete User Journey** from sign-in to logout\
> **Generated**: 2025-12-16\
> **Based on**: Actual code inspection via Repomix analysis

---

## Table of Contents

- [1.0 Sign-In](#10-sign-in)
  - [1.1 Login Page](#11-login-page)
  - [1.2 Google OAuth Flow](#12-google-oauth-flow)
  - [1.3 Magic Link Flow](#13-magic-link-flow)
- [2.0 Auth Callback](#20-auth-callback)
  - [2.1 Callback Processing](#21-callback-processing)
  - [2.2 Session Establishment](#22-session-establishment)
- [3.0 Org Gate (Middleware)](#30-org-gate-middleware)
  - [3.1 Proxy Check](#31-proxy-check)
  - [3.2 Security Headers](#32-security-headers)
- [4.0 Onboarding Wizard](#40-onboarding-wizard)
  - [4.1 Profile Step](#41-profile-step)
  - [4.2 Intent Selection](#42-intent-selection)
  - [4.3 Path A: Join Existing](#43-path-a-join-existing)
  - [4.4 Path B: Create Organization](#44-path-b-create-organization)
  - [4.5 Path C: Create Corporate](#45-path-c-create-corporate)
  - [4.6 Completion (Block 4)](#46-completion-block-4)
- [5.0 Protected App](#50-protected-app)
  - [5.1 Client-Side Guard](#51-client-side-guard)
  - [5.2 Dashboard](#52-dashboard)
  - [5.3 Protected Demo](#53-protected-demo)
- [6.0 Schedule Builder](#60-schedule-builder)
  - [6.1 Week View Prototype](#61-week-view-prototype)
- [7.0 Logout](#70-logout)
  - [7.1 Logout Function](#71-logout-function)
  - [7.2 Session Deletion API](#72-session-deletion-api)
- [8.0 Visual Flow Diagram](#80-visual-flow-diagram)
- [9.0 Key Files Reference](#90-key-files-reference)
- [10.0 Identified Gaps](#100-identified-gaps)

---

## 1.0 Sign-In

### 1.1 Login Page

**File**: `apps/web/app/(auth)/login/page.tsx`

The login page provides two authentication methods:

1. **Google OAuth** (popup-based)
2. **Magic Link** (email-based)

```tsx
// Login options
<button onClick={onGoogle}>Continue with Google</button>
<form onSubmit={onSendMagicLink}>
  <input type="email" placeholder="you@example.com" />
  <button type="submit">Email me a magic link</button>
</form>
```

**Key Behavior**:

- If URL contains email link parameters (`oobCode`), redirects to `/auth/callback`
- Uses `sendEmailLinkRobust()` for magic link sending
- Uses `startGooglePopup()` for Google OAuth

### 1.2 Google OAuth Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Login Page    │────▶│  Google Popup   │────▶│ establishSession│
│  /login         │     │  (Firebase)     │     │    Success?     │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                          ┌──────────────┴──────────────┐
                                          │                             │
                                          ▼                             ▼
                                   ┌──────────┐                  ┌──────────────┐
                                   │ Home "/"  │                  │/auth/callback│
                                   │ (success) │                  │  (fallback)  │
                                   └──────────┘                  └──────────────┘
```

**Code Path**:

```typescript
// startGooglePopup() → Firebase handles OAuth
// On success:
await establishServerSession();
router.replace("/"); // Direct to home
// On failure:
router.replace("/auth/callback"); // Retry via callback
```

### 1.3 Magic Link Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Login Page    │────▶│  Email Sent     │────▶│  User Clicks    │
│  Enter email    │     │  (Firebase)     │     │  Link in Email  │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │/auth/callback│
                                                  │ Complete flow│
                                                  └──────────────┘
```

**Code Path**:

```typescript
// sendEmailLinkRobust(email) → Firebase sends magic link
// Link contains oobCode parameter
// User clicks → lands on /login with oobCode
// Detected → router.replace("/auth/callback")
```

---

## 2.0 Auth Callback

### 2.1 Callback Processing

**File**: `apps/web/app/auth/callback/page.tsx`

Handles completion of any auth flow (email link or Google redirect):

```typescript
export default function AuthCallbackPage() {
  useEffect(() => {
    (async () => {
      // Try email link completion
      const completedEmail = await completeEmailLinkIfPresent();
      // Try Google redirect completion
      const completedGoogle = await completeGoogleRedirectOnce();
      // Check for current user
      const hasCurrentUser = !!(auth && auth.currentUser);

      if (completedEmail || completedGoogle || hasCurrentUser) {
        await establishServerSession();
      }
      router.replace("/");
    })();
  }, [router]);
}
```

### 2.2 Session Establishment

**File**: `apps/web/src/lib/auth-helpers.ts`

```typescript
export async function establishServerSession() {
  const user = auth?.currentUser;
  if (!user) throw new Error("No user is currently signed in");

  const idToken = await user.getIdToken(true);
  const resp = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!resp.ok) throw new Error("Failed to create session");
}
```

**Server Response** (POST /api/session):

```typescript
// Create 5-day session cookie
const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days
const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

response.cookies.set("session", sessionCookie, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: expiresIn / 1000,
});
```

---

## 3.0 Org Gate (Middleware)

### 3.1 Proxy Check

**File**: `apps/web/lib/proxy.ts`

Before entering protected app routes, the proxy checks for organization context:

```typescript
export function proxy(req: NextRequest) {
  // Public routes bypass
  const PUBLIC = [/^\/onboarding/, /^\/signin/, /^\/api/, /^\/_next/];

  if (PUBLIC.some((rx) => rx.test(pathname))) {
    return NextResponse.next();
  }

  // Check for orgId cookie
  const orgId = req.cookies.get("orgId")?.value;

  if (!orgId) {
    // No org context → redirect to onboarding
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
}
```

### 3.2 Security Headers

**File**: `apps/web/app/middleware.ts`

The middleware only sets security headers (no auth logic):

```typescript
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Content-Security-Policy", "...CSP rules...");
  // ... more headers

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
```

---

## 4.0 Onboarding Wizard

### 4.1 Profile Step

**File**: `apps/web/app/onboarding/profile/page.tsx`

First step collects user profile information:

```
┌─────────────────────────────────────┐
│        Profile Information          │
├─────────────────────────────────────┤
│  Display Name: [________________]   │
│  Phone (opt):  [________________]   │
│                                     │
│          [Continue →]               │
└─────────────────────────────────────┘
         │
         ▼
   /onboarding/intent
```

### 4.2 Intent Selection

**File**: `apps/web/app/onboarding/intent/page.tsx`

User selects their path:

```typescript
// Pre-checks before showing options
if (!user?.emailVerified) {
  router.push("/onboarding/blocked/email-not-verified");
  return;
}

if (isInvitedStaff) {
  router.push("/onboarding/blocked/staff-invite");
  return;
}

// User selects intent
const handleClick = (choice: "join_existing" | "create_workspace") => {
  setIntent(choice);
  if (choice === "join_existing") {
    router.push("/onboarding/join");
  } else {
    router.push("/onboarding/admin-responsibility");
  }
};
```

```
┌─────────────────────────────────────┐
│       What brings you here?         │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ 👥 Join existing workspace  │    │ ──▶ /onboarding/join
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🏢 Create a new workspace   │    │ ──▶ /onboarding/admin-responsibility
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 4.3 Path A: Join Existing

**File**: `apps/web/app/onboarding/join/page.tsx`

```
Intent: join_existing
         │
         ▼
┌─────────────────────────────────────┐
│      Enter Invite Code              │
├─────────────────────────────────────┤
│  Code: [________________]           │
│                                     │
│  [Validate & Join]                  │
└─────────────────────────────────────┘
         │
         │ POST /api/onboarding/join
         ▼
   /onboarding/block-4 (completion)
```

### 4.4 Path B: Create Organization

**Files**:

- `apps/web/app/onboarding/admin-responsibility/page.tsx`
- `apps/web/app/onboarding/create-network-org/page.tsx`

```
Intent: create_workspace (org_owner path)
         │
         ▼
┌─────────────────────────────────────┐
│    Admin Responsibility Form        │
├─────────────────────────────────────┤
│  ☐ I am a business owner/manager   │
│  ☐ I have authority to create       │
│                                     │
│  [Continue as Org Owner]            │
│  [Continue as Corporate Owner]      │
└─────────────────────────────────────┘
         │
         │ User selects "Org Owner"
         ▼
┌─────────────────────────────────────┐
│    Create Organization              │
├─────────────────────────────────────┤
│  Organization Name: [____________]  │
│  Primary Venue:     [____________]  │
│  City:              [____________]  │
│  State:             [____________]  │
│                                     │
│  [Create Organization]              │
└─────────────────────────────────────┘
         │
         │ POST /api/onboarding/create-network-org
         ▼
   /onboarding/block-4 (completion)
```

### 4.5 Path C: Create Corporate

**File**: `apps/web/app/onboarding/create-network-corporate/page.tsx`

```
Intent: create_workspace (corporate path)
         │
         ▼
   Admin Responsibility Form
         │
         │ User selects "Corporate Owner"
         ▼
┌─────────────────────────────────────┐
│    Create Corporate Network         │
├─────────────────────────────────────┤
│  Corporate Name:    [____________]  │
│  First Location:    [____________]  │
│                                     │
│  [Create Corporate Network]         │
└─────────────────────────────────────┘
         │
         │ POST /api/onboarding/create-network-corporate
         ▼
   /onboarding/block-4 (completion)
```

### 4.6 Completion (Block 4)

**File**: `apps/web/app/onboarding/block-4/page.tsx`

```typescript
export default function Block4Page() {
  const { intent, networkId, orgId, venueId, corpId, joinedRole } = useOnboardingWizard();

  const description = intent === "join_existing"
    ? "You have joined an existing workspace."
    : "Your workspace has been created.";

  return (
    <div>
      <h1>You're in.</h1>
      <p>{description}</p>

      {/* Display IDs */}
      {networkId && <div>Network ID: {networkId}</div>}
      {orgId && <div>Org ID: {orgId}</div>}
      {venueId && <div>Venue ID: {venueId}</div>}
      {corpId && <div>Corporate ID: {corpId}</div>}
      {joinedRole && <div>Role: {joinedRole}</div>}

      <button onClick={() => router.push("/")}>
        Go to the app
      </button>
    </div>
  );
}
```

```
┌─────────────────────────────────────┐
│           You're in! ✓              │
├─────────────────────────────────────┤
│  Network ID: net_abc123             │
│  Org ID: org_xyz789                 │
│  Venue ID: ven_def456               │
│  Role: org_owner                    │
│                                     │
│        [Go to the app →]            │
└─────────────────────────────────────┘
         │
         ▼
   Home "/" (Protected App)
```

---

## 5.0 Protected App

### 5.1 Client-Side Guard

**File**: `apps/web/app/components/ProtectedRoute.tsx`

All protected pages wrap content with this guard:

```typescript
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
```

### 5.2 Dashboard

**File**: `apps/web/app/(app)/protected/dashboard/page.tsx`

Main dashboard with publishing and schedule views:

```typescript
export default function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onPublish = async () => {
    setBusy(true);
    try {
      await publishSchedule(scheduleId);
      setMessage("Published successfully");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedRoute>
      <main>
        <h1>Dashboard</h1>
        <button onClick={onPublish}>🚀 Publish Schedule</button>

        <MonthView />  {/* Calendar component */}
        <Inbox />      {/* Notifications/messages */}
      </main>
    </ProtectedRoute>
  );
}
```

```
┌─────────────────────────────────────────────────────┐
│                   Dashboard                          │
├─────────────────────────────────────────────────────┤
│        [🚀 Publish Schedule]  [✓ Published]         │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │     Month View       │  │       Inbox          │ │
│  │  ┌──┬──┬──┬──┬──┐   │  │  • New shift swap    │ │
│  │  │Mo│Tu│We│Th│Fr│   │  │  • Time-off approved │ │
│  │  ├──┼──┼──┼──┼──┤   │  │  • Schedule updated  │ │
│  │  │  │  │  │  │  │   │  │                      │ │
│  │  └──┴──┴──┴──┴──┘   │  └──────────────────────┘ │
│  └──────────────────────┘                           │
└─────────────────────────────────────────────────────┘
```

### 5.3 Protected Demo

**File**: `apps/web/app/(app)/protected/page.tsx`

Demo page for testing CRUD operations:

```typescript
export default function ProtectedDemoPage() {
  const createItem = useCreateItem();

  return (
    <ProtectedRoute>
      <main>
        <h1>Protected Demo</h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          const name = e.currentTarget.elements.name.value;
          createItem.mutate({ name });
        }}>
          <input name="name" placeholder="New item name" />
          <button type="submit">Create</button>
        </form>
      </main>
    </ProtectedRoute>
  );
}
```

---

## 6.0 Schedule Builder

### 6.1 Week View Prototype

**File**: `apps/web/app/schedules/builder/page.tsx`

Local-state prototype for schedule building:

```typescript
export default function ScheduleBuilder() {
  const [shifts, setShifts] = useState([
    { id: "s1", day: 0, start: "09:00", end: "13:00", title: "Morning" },
    { id: "s2", day: 2, start: "12:00", end: "18:00", title: "Afternoon" },
  ]);

  function addDemoShift(day = 0) {
    const id = `s-${Date.now()}`;
    setShifts((s) => [...s, { id, day, start: "10:00", end: "14:00", title: "New" }]);
  }

  return (
    <div>
      <h2>Week view (prototype)</h2>
      <button onClick={() => addDemoShift(0)}>Add shift</button>

      <div className="grid grid-cols-7">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
          <div key={day}>
            <div>{day}</div>
            {shifts.filter(sh => sh.day === i).map(sh => (
              <div key={sh.id}>{sh.title} — {sh.start}-{sh.end}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

```
┌─────────────────────────────────────────────────────────────────┐
│   Week view (prototype)                    [Add shift]          │
├────────┬────────┬────────┬────────┬────────┬────────┬──────────┤
│  Mon   │  Tue   │  Wed   │  Thu   │  Fri   │  Sat   │   Sun    │
├────────┼────────┼────────┼────────┼────────┼────────┼──────────┤
│Morning │        │Aftern. │        │        │        │          │
│9-13    │        │12-18   │        │        │        │          │
└────────┴────────┴────────┴────────┴────────┴────────┴──────────┘
```

---

## 7.0 Logout

### 7.1 Logout Function

**File**: `apps/web/src/lib/auth-helpers.ts`

```typescript
export async function logoutEverywhere() {
  // Step 1: Clear server session
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch (e) {
    reportError(e, { phase: "session_delete" });
  }

  // Step 2: Clear client Firebase auth
  try {
    const { signOut } = await import("firebase/auth");
    await signOut(auth!);
  } catch (e) {
    reportError(e, { phase: "client_signout" });
  }
}
```

### 7.2 Session Deletion API

**File**: `apps/web/app/api/session/route.ts`

```typescript
export const DELETE = createPublicEndpoint({
  handler: async () => {
    const response = ok({ ok: true });

    // Clear cookie by setting maxAge: 0
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Immediate expiration
    });

    return response;
  },
});
```

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User clicks   │────▶│ logoutEverywhere│────▶│ DELETE /api/    │
│   "Logout"      │     │    called       │     │ session         │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 │                       ▼
                                 │               ┌──────────────┐
                                 │               │ Cookie set   │
                                 │               │ maxAge: 0    │
                                 │               └──────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ signOut(auth)   │
                        │ Firebase client │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   /login        │
                        │ (ProtectedRoute │
                        │   redirects)    │
                        └─────────────────┘
```

---

## 8.0 Visual Flow Diagram

### Complete User Journey

```
                                    FRESH SCHEDULES - COMPLETE USER FLOW
═══════════════════════════════════════════════════════════════════════════════════

                                          ┌───────────────┐
                                          │  Entry Point  │
                                          │    (Home)     │
                                          └───────┬───────┘
                                                  │
                              ┌───────────────────┴───────────────────┐
                              ▼                                       ▼
                       ┌──────────────┐                       ┌──────────────┐
                       │   Not Auth   │                       │   Has Auth   │
                       │   /login     │                       │ (Protected)  │
                       └──────┬───────┘                       └──────┬───────┘
                              │                                      │
             ┌────────────────┼────────────────┐                     │
             ▼                ▼                ▼                     │
      ┌──────────┐    ┌──────────────┐  ┌──────────┐                 │
      │  Google  │    │  Magic Link  │  │  OAuth   │                 │
      │  Popup   │    │  (Email)     │  │ Redirect │                 │
      └────┬─────┘    └──────┬───────┘  └────┬─────┘                 │
           │                 │               │                       │
           └────────┬────────┴───────────────┘                       │
                    ▼                                                │
           ┌─────────────────┐                                       │
           │  /auth/callback │                                       │
           │  Session Setup  │                                       │
           └────────┬────────┘                                       │
                    │                                                │
                    ▼                                                │
           ┌─────────────────┐                                       │
           │  POST /api/     │                                       │
           │  session        │                                       │
           │  (set cookie)   │                                       │
           └────────┬────────┘                                       │
                    │                                                │
                    ▼                                                │
           ┌─────────────────┐                                       │
           │   ORG GATE      │◄──────────────────────────────────────┘
           │  (proxy.ts)     │
           │  Has orgId?     │
           └────────┬────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   ┌──────────────┐   ┌──────────────┐
   │   No orgId   │   │  Has orgId   │
   │  /onboarding │   │  Protected   │
   └──────┬───────┘   └──────┬───────┘
          │                  │
          ▼                  │
   ┌──────────────┐          │
   │   Profile    │          │
   └──────┬───────┘          │
          │                  │
          ▼                  │
   ┌──────────────┐          │
   │    Intent    │          │
   └──────┬───────┘          │
          │                  │
    ┌─────┴─────┐            │
    ▼           ▼            │
┌───────┐  ┌────────────┐    │
│ Join  │  │Create Work │    │
│Existing│  │   space    │    │
└───┬───┘  └─────┬──────┘    │
    │            │           │
    │      ┌─────┴─────┐     │
    │      ▼           ▼     │
    │  ┌───────┐  ┌───────┐  │
    │  │  Org  │  │ Corp  │  │
    │  │ Path  │  │ Path  │  │
    │  └───┬───┘  └───┬───┘  │
    │      │          │      │
    └──────┼──────────┘      │
           ▼                 │
    ┌──────────────┐         │
    │   Block 4    │         │
    │  Completion  │         │
    └──────┬───────┘         │
           │                 │
           ▼                 │
    ┌──────────────┐         │
    │  Go to App   │─────────┼─────────────────────┐
    └──────────────┘         │                     │
                             │                     │
                             ▼                     ▼
                      ┌─────────────────────────────────┐
                      │         PROTECTED APP           │
                      ├─────────────────────────────────┤
                      │                                 │
                      │  ┌───────────┐  ┌───────────┐   │
                      │  │ Dashboard │  │ Schedule  │   │
                      │  │  /app/    │  │  Builder  │   │
                      │  │ protected │  │/schedules/│   │
                      │  │/dashboard │  │  builder  │   │
                      │  └───────────┘  └───────────┘   │
                      │                                 │
                      │  ┌───────────┐                  │
                      │  │  Demo     │                  │
                      │  │  /app/    │                  │
                      │  │ protected │                  │
                      │  └───────────┘                  │
                      │                                 │
                      └─────────────┬───────────────────┘
                                    │
                                    │ [Logout Button]
                                    ▼
                             ┌──────────────┐
                             │logoutEvery-  │
                             │  where()     │
                             └──────┬───────┘
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
                 ┌──────────────┐       ┌──────────────┐
                 │DELETE /api/  │       │signOut(auth) │
                 │  session     │       │ Firebase     │
                 │(clear cookie)│       │  client      │
                 └──────────────┘       └──────────────┘
                        │                       │
                        └───────────┬───────────┘
                                    ▼
                             ┌──────────────┐
                             │   /login     │
                             │(ProtectedRoute│
                             │  redirects)   │
                             └──────────────┘

═══════════════════════════════════════════════════════════════════════════════════
```

---

## 9.0 Key Files Reference

### Authentication

| File                                  | Purpose                                 |
| ------------------------------------- | --------------------------------------- |
| `apps/web/app/(auth)/login/page.tsx`  | Login page (Google + Magic Link)        |
| `apps/web/app/auth/callback/page.tsx` | Auth completion handler                 |
| `apps/web/src/lib/auth-helpers.ts`    | Auth utilities (login, logout, session) |
| `apps/web/app/api/session/route.ts`   | Session creation/deletion API           |

### Middleware & Guards

| File                                         | Purpose                |
| -------------------------------------------- | ---------------------- |
| `apps/web/app/middleware.ts`                 | Security headers only  |
| `apps/web/lib/proxy.ts`                      | Org gate check         |
| `apps/web/app/components/ProtectedRoute.tsx` | Client-side auth guard |

### Onboarding

| File                                                          | Purpose                 |
| ------------------------------------------------------------- | ----------------------- |
| `apps/web/app/onboarding/profile/page.tsx`                    | Profile collection      |
| `apps/web/app/onboarding/intent/page.tsx`                     | Path selection          |
| `apps/web/app/onboarding/join/page.tsx`                       | Join existing workspace |
| `apps/web/app/onboarding/admin-responsibility/page.tsx`       | Admin confirmation      |
| `apps/web/app/onboarding/create-network-org/page.tsx`         | Create org              |
| `apps/web/app/onboarding/create-network-corporate/page.tsx`   | Create corporate        |
| `apps/web/app/onboarding/block-4/page.tsx`                    | Completion step         |
| `apps/web/app/onboarding/_wizard/OnboardingWizardContext.tsx` | Wizard state            |

### Protected App

| File                                              | Purpose                    |
| ------------------------------------------------- | -------------------------- |
| `apps/web/app/(app)/protected/page.tsx`           | Protected demo page        |
| `apps/web/app/(app)/protected/dashboard/page.tsx` | Main dashboard             |
| `apps/web/app/schedules/builder/page.tsx`         | Schedule builder prototype |

---

## 10.0 SR Dev Gap Analysis

> **Comprehensive review** of the entire golden path - auth, data, security, UX, and integration

---

### 🔴 P0: BLOCKING (Production cannot ship)

| #     | Category | Gap                                          | Evidence                                                                | Impact                                           |
| ----- | -------- | -------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| **1** | **Auth** | `useAuth()` is a **stub**                    | `auth-context.tsx:22`: `setUser(null)` always                           | Auth guard always fails → infinite redirect loop |
| **2** | **Auth** | `proxy.ts` **never called**                  | `middleware.ts` doesn't import/call `proxy()`                           | Org gate is dead code                            |
| **3** | **Data** | `orgId` cookie **never set**                 | No `response.cookies.set("orgId",...)` anywhere                         | Post-onboarding redirect loop                    |
| **4** | **Data** | Onboarding APIs **don't write to Firestore** | `create-network-org/route.ts`: returns mock `{ id: org-${Date.now()} }` | No data persisted                                |
| **5** | **Data** | `join-with-token` **doesn't validate token** | Returns mock `status: "pending_approval"`                               | Anyone can "join" any org                        |

---

### 🟠 P1: CRITICAL (Core flows broken)

| #      | Category        | Gap                                | Evidence                                                       | Impact                             |
| ------ | --------------- | ---------------------------------- | -------------------------------------------------------------- | ---------------------------------- |
| **6**  | **UX**          | No logout button                   | `logoutEverywhere()` exported but never wired                  | Users can't sign out               |
| **7**  | **UX**          | No navigation                      | No header/sidebar component                                    | Users can't navigate between pages |
| **8**  | **Data**        | No profile persistence             | `POST /api/onboarding/profile` doesn't write to `/users/{uid}` | Profile data lost                  |
| **9**  | **Security**    | Session cookie not HttpOnly in dev | `secure: process.env.NODE_ENV === 'production'`                | XSS can steal session in dev       |
| **10** | **Integration** | Dashboard uses hardcoded orgId     | `_orgId = "orgA"` in dashboard                                 | Wrong data displayed               |

---

### 🟡 P2: IMPORTANT (Degraded experience)

| #      | Category       | Gap                              | Evidence                                               | Impact                  |
| ------ | -------------- | -------------------------------- | ------------------------------------------------------ | ----------------------- |
| **11** | **Data**       | Schedule builder is local-only   | `useState([...])` in `builder/page.tsx`                | Schedules don't persist |
| **12** | **Data**       | No membership documents created  | No Firestore write for `/memberships/{userId}_{orgId}` | Role checks will fail   |
| **13** | **Security**   | CSP blocks Firebase              | `connect-src 'self'` doesn't allow Firebase domains    | Firebase calls blocked  |
| **14** | **Validation** | `ActivateNetworkSchema` is local | Not exported from `@fresh-schedules/types`             | Triad violation         |
| **15** | **Error**      | Generic error messages           | `serverError("Failed to create organization network")` | No debugging info       |

---

### 🟢 P3: MINOR (Polish)

| #      | Category | Gap                             | Evidence                                      | Impact                     |
| ------ | -------- | ------------------------------- | --------------------------------------------- | -------------------------- |
| **16** | **UX**   | No loading states in onboarding | Missing `isSubmitting` state                  | Form resubmission possible |
| **17** | **UX**   | No error boundaries             | No `error.tsx` files                          | Crashes show blank page    |
| **18** | **A11y** | Missing ARIA labels             | Forms lack `aria-describedby`                 | Screen reader issues       |
| **19** | **Perf** | No route prefetching            | Missing `<Link prefetch>`                     | Slower navigation          |
| **20** | **Test** | No E2E for golden path          | `login_publish_logout.e2e.spec.ts` gitignored | Flow untested              |

---

## 11.0 Root Cause Analysis

### Why is `useAuth()` a stub

```tsx
// apps/web/src/lib/auth-context.tsx:20-24
useEffect(() => {
  setTimeout(() => {
    setUser(null); // ← ALWAYS sets to null
    setIsLoading(false);
  }, 10);
}, []);
```

**Fix Required**: Wire to Firebase `onAuthStateChanged`:

```tsx
useEffect(() => {
  const unsub = onAuthStateChanged(auth, (fbUser) => {
    setUser(fbUser ? { uid: fbUser.uid, email: fbUser.email } : null);
    setIsLoading(false);
  });
  return unsub;
}, []);
```

---

### Why isn't `proxy.ts` used

```typescript
// apps/web/app/middleware.ts - ONLY sets headers
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  // ... headers only, no proxy() call
}
```

**Fix Required**: Import and call proxy:

```typescript
import { proxy } from "../../proxy";

export function middleware(request: NextRequest) {
  const proxyResponse = proxy(request);
  if (proxyResponse.status !== 200) return proxyResponse;

  const response = NextResponse.next();
  // ...headers
}
```

---

### Why no Firestore writes

```typescript
// apps/web/app/api/onboarding/create-network-org/route.ts:21-28
const org = {
  id: `org-${Date.now()}`, // ← Generated, not persisted
  name: typedInput.organizationName,
  // ...
};
return ok(org); // ← Returns mock, no db.collection().add()
```

**Exception**: `activate-network/route.ts` DOES write:

```typescript
await updateDocWithType<NetworkDoc>(adb, networkRef, {
  status: "active",
  activatedAt: Timestamp.now(),
});
```

---

## 12.0 Fix Roadmap

### Phase 1: Auth Chain (P0s 1-3)

```
Day 1:
├── 1.1 Wire useAuth() to Firebase onAuthStateChanged
├── 1.2 Call proxy() from middleware.ts
└── 1.3 Set orgId cookie in onboarding completion API
```

### Phase 2: Data Persistence (P0s 4-5)

```
Day 2:
├── 2.1 create-network-org: Write to Firestore /orgs/{id}
├── 2.2 create-network-org: Create /memberships/{userId}_{orgId}
├── 2.3 join-with-token: Validate invite token exists
└── 2.4 join-with-token: Add member to org
```

### Phase 3: UX Completion (P1s 6-10)

```
Day 3:
├── 3.1 Add header component with logout button
├── 3.2 Add sidebar navigation
├── 3.3 Write profile to /users/{uid} on profile submit
├── 3.4 Replace hardcoded orgId with context
└── 3.5 Update CSP to allow Firebase domains
```

### Phase 4: Integration (P2s 11-15)

```
Day 4:
├── 4.1 Connect schedule builder to /api/schedules
├── 4.2 Move ActivateNetworkSchema to @fresh-schedules/types
├── 4.3 Add structured error responses
└── 4.4 Create E2E test for golden path
```

---

## 13.0 Dependency Graph

```
                    ┌─────────────────────┐
                    │  1.1 Fix useAuth()  │
                    │  (Firebase auth)    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│ 3.1 Logout button│  │ 3.2 Navbar  │  │ 1.2 Wire proxy() │
│   (needs user)   │  │ (needs user)│  │  (org gate)      │
└──────────────────┘  └──────────────┘  └────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │ 1.3 Set orgId    │
                                        │   cookie         │
                                        └────────┬─────────┘
                                                 │
                              ┌──────────────────┼──────────────────┐
                              │                  │                  │
                              ▼                  ▼                  ▼
                    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
                    │ 2.1 Write    │   │ 2.2 Create   │   │ 3.4 Use org  │
                    │ orgs to DB   │   │ memberships  │   │ from context │
                    └──────────────┘   └──────────────┘   └──────────────┘
                              │                  │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │ 4.1 Schedule     │
                              │ builder → API    │
                              └──────────────────┘
```

---

## 14.0 Verification Checklist

After fixes, verify each gate:

| Gate           | Test                             | Expected                                |
| -------------- | -------------------------------- | --------------------------------------- |
| **Auth**       | Visit `/` unauthenticated        | Redirect to `/login`                    |
| **Login**      | Google OAuth flow                | Session cookie set, redirect to `/`     |
| **Org Gate**   | Visit `/` without orgId cookie   | Redirect to `/onboarding`               |
| **Onboarding** | Complete create-org flow         | Firestore doc created, orgId cookie set |
| **App**        | Visit `/app/protected/dashboard` | Dashboard renders with real data        |
| **Logout**     | Click logout button              | Session cleared, redirect to `/login`   |

---

## 15.0 Additional Gaps from Deep Repomix Scan

### 🔴 Mock Data Routes (Returning Static Data Instead of Firestore)

**Discovered Pattern**: Multiple API routes return hardcoded mock data instead of querying
Firestore.

| Route                | Issue     | Evidence                                             |
| -------------------- | --------- | ---------------------------------------------------- |
| `/api/attendance`    | Mock data | `// Mock data - in production, fetch from Firestore` |
| `/api/positions`     | Mock data | Returns hardcoded position array                     |
| `/api/schedules`     | Mock data | Returns mock schedule list                           |
| `/api/shifts`        | Mock data | Returns mock shift list                              |
| `/api/venues`        | Mock data | Returns mock venue list                              |
| `/api/widgets`       | Mock data | Returns mock widget list                             |
| `/api/zones`         | Mock data | Returns mock zone list                               |
| `/api/users/profile` | Mock data | Returns mock user profile                            |

**Impact**: App "works" visually but no data persists. Users create content that vanishes on
refresh.

---

### 🟡 Type Safety Issues

| File                        | Issue                | Line       | Fix                          |
| --------------------------- | -------------------- | ---------- | ---------------------------- |
| `_shared/middleware.ts`     | `ctx: any` parameter | L642, L644 | Type as `RouteContext`       |
| `batch/route.ts`            | `context: any`       | L1322      | Type as `RequestContext`     |
| `rate-limit.ts`             | `req: any`           | L4057      | Type as `NextRequest`        |
| `test-utils/authHelpers.ts` | `options: any`       | L5674      | Type as `MockRequestOptions` |

---

### 🟡 TODO Comments Still in Code

| File                       | TODO                                           | Line               |
| -------------------------- | ---------------------------------------------- | ------------------ |
| `publishSchedule`          | `TODO: perform the privileged write`           | `schedules.ts:503` |
| `batch/route.ts`           | `TODO: Move to packages/types/src/batch.ts`    | `route.ts:1313`    |
| `internal/backup/route.ts` | `TODO: Move to packages/types/src/internal.ts` | `route.ts:1377`    |

---

### 🟡 Stub/Placeholder Implementations

| File                        | Issue                                                                      |
| --------------------------- | -------------------------------------------------------------------------- |
| `src/lib/auth-context.tsx`  | `Placeholder: replace with real initialization` - Always returns null user |
| `components/UploadStub.tsx` | File upload is completely stubbed                                          |
| `proxy.ts`                  | Contains `TEMPORARY: Set BYPASS_ONBOARDING_GUARD` bypass flag              |
| `firebase.server.ts`        | Returns early in stub mode, no real Firestore                              |

---

### 🟢 Code Quality Observations

| Category                 | Finding                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **SDK Factory Adoption** | ✅ Good - 36 routes using SDK factory patterns                                     |
| **Endpoint Types**       | 6 `createPublicEndpoint`, 15 `createAuthenticatedEndpoint`, 15 `createOrgEndpoint` |
| **Error Handling**       | ⚠️ Minimal - Only 3 catch blocks in entire codebase                                |
| **Console Logging**      | ⚠️ 27 console/debug references (should use structured logger)                      |
| **TypeScript Any**       | ⚠️ 11 `any` type usages found                                                      |

---

### 🟢 Duplicate Code Detection

| Pattern              | Files                               | Recommendation                                            |
| -------------------- | ----------------------------------- | --------------------------------------------------------- |
| `typed-wrappers.ts`  | Duplicated in 2 locations           | Consolidate to single `@fresh-schedules/firebase` package |
| `adminFormDrafts.ts` | Duplicated in `lib/` and `src/lib/` | Consolidate to single location                            |

---

## 16.0 Updated Fix Roadmap (Including Deep Scan Findings)

### Phase 5: Implement Real Firestore Queries (NEW)

```
Day 5:
├── 5.1 /api/attendance: Replace mock with Firestore query
├── 5.2 /api/positions: Replace mock with Firestore query
├── 5.3 /api/schedules: Replace mock with Firestore query
├── 5.4 /api/shifts: Replace mock with Firestore query
├── 5.5 /api/venues: Replace mock with Firestore query
├── 5.6 /api/zones: Replace mock with Firestore query
├── 5.7 /api/users/profile: Replace mock with Firestore query
└── 5.8 /api/widgets: Replace mock with Firestore query
```

### Phase 6: Type Safety & Code Quality (NEW)

```
Day 6:
├── 6.1 Replace all `any` types with proper types
├── 6.2 Add catch blocks with structured error logging
├── 6.3 Move batch/internal schemas to @fresh-schedules/types
├── 6.4 Consolidate duplicate typed-wrappers
└── 6.5 Implement publishSchedule privileged write
```

---

## 17.0 Gap Summary Matrix

| Priority | Count | Category             | Status                |
| -------- | ----- | -------------------- | --------------------- |
| 🔴 P0    | 5     | Auth Chain           | Blocking              |
| 🟠 P1    | 5     | Critical UX          | Broken                |
| 🟡 P2    | 5     | Degraded Experience  | Impaired              |
| 🟢 P3    | 5     | Polish               | Minor                 |
| 🔴 NEW   | 8     | Mock Data Routes     | Data Not Persisting   |
| 🟡 NEW   | 4     | Type Safety          | TypeScript Violations |
| 🟡 NEW   | 3     | TODO Comments        | Incomplete Features   |
| 🟡 NEW   | 4     | Stub Implementations | Placeholder Code      |
| 🟢 NEW   | 2     | Duplicate Code       | Technical Debt        |

**Total Gaps**: 41 issues identified

---

**Document Version**: 3.0\
**Generated from**: SR Dev code audit + Deep Repomix Scan\
**Verification Method**: Repomix pack_codebase + grep patterns (TODO, mock, stub, any, console)\
**Scan Output ID**: 993e14056ec3d502 (165 files, 39,976 tokens)\
**Audit Date**: 2025-12-18
