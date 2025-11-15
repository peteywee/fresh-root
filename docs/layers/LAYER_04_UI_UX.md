# LAYER_04_UI_UX

**Purpose**  
Implements all user-facing experience: pages, layouts, and interactive components.  
Connects only to the API Edge via HTTP or typed client wrappers.

---

## 1. Scope

- `apps/web/app/**` (Next.js App Router)
- `apps/web/components/**`
- `apps/web/public/**` (PWA assets)

---

## 2. Responsibilities

- Render views for onboarding, roles, shifts, attendance.
- Manage local UI state and mutations through API calls.
- Ensure accessibility and PWA readiness.

---

## 3. Inputs

- Typed DTOs from API Edge.
- User session context.

---

## 4. Outputs

- JSX UI components and routes.
- PWA manifest & service worker.

---

## 5. Dependencies

- `next@14+`
- `react@18+`
- `tailwindcss`
- `shadcn/ui`
- `lucide-react`
- `react-query` or `@tanstack/query`
- `@fresh-schedules/types` (for types only)

---

## 6. Invariants

- No direct Firebase calls.
- All data flows through API Edge.
- Components pure and typed.
- Dark/light theme support.

---

## 7. Core Screens

| Screen        | Description                      |
| ------------- | -------------------------------- |
| `/onboarding` | Org creation/join wizard         |
| `/roles`      | Role management UI               |
| `/schedule`   | Shift creation + role assignment |
| `/attendance` | Clock-in/out UI (select role)    |
| `/dashboard`  | Manager overview of attendance   |

---

## 8. UX Standards

- Responsive layout (≥ 375 px mobile).
- Lighthouse ≥ 90.
- TTI < 1.8 s prod.
- Color contrast AA+.

---

## 9. Validation Checklist

- [ ] No SDK imports.
- [ ] Uses typed fetch wrappers.
- [ ] UI matches Bible flows.
- [ ] PWA install works.

---

## 10. Change Log

| Date       | Author         | Change            |
| ---------- | -------------- | ----------------- |
| YYYY-MM-DD | Patrick Craven | Initial L04 guide |

<!--# LAYER_04_UI_UX (duplicate section removed)-->

**Purpose**
The UI/UX layer renders the **user-facing experience** of Fresh Schedules.
It turns domain data and application results into **screens, components, and interactions**.

This layer is responsible for:

- Layouts and page structure
- Visual design and styling
- User flows (navigation, forms, confirmations)
- Client-side behavior and state that is **purely presentational or interaction-oriented**

All business rules and persistence belong in lower layers.

---

## Scope

This layer includes:

- Next.js app router pages and layouts:
  - `apps/web/app/layout.tsx`
  - `apps/web/app/page.tsx`
  - `apps/web/app/(app)/**`
  - `apps/web/app/(auth)/**`
  - `apps/web/app/(marketing)/**` (if present)

- Shared UI components:
  - `apps/web/components/**`
  - `apps/web/components/ui/**` (design system primitives)

- PWA UI scaffolding:
  - `apps/web/app/RegisterServiceWorker.tsx`
  - Any client-only wrappers for PWA behavior

- Hooks that are **UI-centric**:
  - e.g. `useSidebarState`, `useTheme`, etc. (if present and clearly UI-related)

Not in scope:

- Business logic, scheduling calculations, or persistence calls.
- Direct calls to Firebase Admin or Firestore SDKs.

---

## Inputs

UI/UX consumes:

- **Data and types**:
  - Domain types from `@fresh-schedules/types`
  - Application-layer results (fetched via API or directly via app libs/hooks)

- **State and navigation APIs**:
  - Next.js routing (e.g., `useRouter`, `Link`, etc.)
  - React state and context APIs

- **Configuration**:
  - Environment flags that affect UI (e.g., feature toggles, branding)

---

## Outputs

UI/UX produces:

1. **Visual Representation**
   - Pages, dashboards, calendar views, forms, and modals.

2. **User Interactions**
   - Form submissions
   - Button clicks
   - Navigation events
   - Client-side validation hints

3. **Requests to API Edge / App Libs**
   - Fetch calls to `/api/**`
   - Calls to app-level hooks or utilities

The outputs of this layer are **experiences**, not data models.

---

## Dependencies

Allowed dependencies:

- React and Next.js (components, hooks, routing)
- `@fresh-schedules/types` for typing props and API responses
- Application libraries (Layer 02) where appropriate, ideally via hooks
- Design system libraries (e.g., Tailwind CSS classes, headless components)
- Client-side utility libraries (date formatting, number formatting, etc.)

Forbidden dependencies:

- `firebase-admin` or direct Firestore/Redis clients
- `services/api/src/**`
- Direct imports from `apps/web/app/api/**` (should be accessed via HTTP or formal client helpers)
- Low-level infra details

The UI must not know **how** data is stored or secured; only _what_ data is and _how_ to show it.

---

## Consumers

UI/UX is consumed by:

- **Human users** (staff, managers, admins) via browsers.
- Embeds or iframes if you expose parts of the UI elsewhere.

No code layer consumes UI/UX; it is the final surface.

---

## Invariants

1. **No Business Logic**
   - Calculations for labor budgets, rule enforcement, or tenant separation must not live here.
   - UI may display results and statuses, not compute domain truths.

2. **Separation of Concerns**
   - Presentational components (buttons, cards) should not fetch or mutate data.
   - Smart/container components may orchestrate calls to the API/App libs but do not define domain rules.

3. **Type Safety**
   - Data passed into components must use types from `@fresh-schedules/types` or app-layer DTOs.
   - Avoid `any` and untyped props.

4. **Resilience & UX Quality**
   - Handle loading, error, and empty states explicitly.
   - Never assume data is present; always handle failure from API Edge.

5. **Accessibility & Responsiveness**
   - Components should be usable across screen sizes.
   - Accessible attributes (ARIA, keyboard navigation) should be respected where applicable.

6. **No Direct Infra Access**
   - UI must not import or configure Firebase Admin, Firestore clients, or direct infra modules.
   - All data access goes through API Edge or clearly defined clients/hooks built on Application Libraries.

---

## Change Log

| Date       | Author         | Change                       |
| ---------- | -------------- | ---------------------------- |
| YYYY-MM-DD | Patrick Craven | Initial v15 layer definition |

## LAYER_04_UI_UX (continued)

**Purpose**
Describe exactly why this layer exists and what problems it solves.

### Scope

Which directories, modules, or files belong to it.

### Inputs

What it consumes (events, requests, data types).

### Outputs

What it produces (domain entities, responses, UI state).

### Dependencies

Which other layers or systems it depends on (always downward only).

### Consumers

Which layers depend on this layer.

### Invariants

Rules that must never break inside this layer.

## Change Log (continued)

| Date       | Author         | Change        |
| ---------- | -------------- | ------------- |
| 2025-11-11 | Patrick Craven | Initial draft |
