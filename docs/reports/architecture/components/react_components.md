---

title: "L3 — React Components & Pages"
description: "Catalog of React components and Next.js pages."
keywords:
	- react
	- components
	- pages
category: "report"
status: "active"
audience:
	- developers
	- designers
createdAt: "2026-01-31T07:19:00Z"
lastUpdated: "2026-01-31T07:19:00Z"

---

# L3 — React Components & Pages

This file catalogs all React components and Next.js pages in the Fresh Schedules application.

---

## 1. Page Structure (App Router)

Located in `apps/web/app/`:

### Public Pages

| Path             | File                     | Description            |
| ---------------- | ------------------------ | ---------------------- |
| `/`              | `page.tsx`               | Landing page           |
| `/demo`          | `(app)/demo/page.tsx`    | Demo showcase          |
| `/login`         | `(auth)/login/page.tsx`  | Login page             |
| `/auth/callback` | `auth/callback/page.tsx` | OAuth callback handler |
| `/planning`      | `planning/page.tsx`      | Planning view          |

### Protected Pages

| Path                   | File                                 | Description          |
| ---------------------- | ------------------------------------ | -------------------- |
| `/protected`           | `(app)/protected/page.tsx`           | Protected home       |
| `/protected/dashboard` | `(app)/protected/dashboard/page.tsx` | Main dashboard       |
| `/protected/schedules` | `(app)/protected/schedules/page.tsx` | Schedules management |

### Onboarding Flow

| Path                                   | File                                           | Description               |
| -------------------------------------- | ---------------------------------------------- | ------------------------- |
| `/onboarding`                          | `onboarding/page.tsx`                          | Onboarding entry          |
| `/onboarding/intent`                   | `onboarding/intent/page.tsx`                   | User intent selection     |
| `/onboarding/profile`                  | `onboarding/profile/page.tsx`                  | Profile setup             |
| `/onboarding/admin-form`               | `onboarding/admin-form/page.tsx`               | Admin form                |
| `/onboarding/admin-responsibility`     | `onboarding/admin-responsibility/page.tsx`     | Admin responsibility form |
| `/onboarding/create-network-org`       | `onboarding/create-network-org/page.tsx`       | Create network org        |
| `/onboarding/create-network-corporate` | `onboarding/create-network-corporate/page.tsx` | Create corporate entity   |
| `/onboarding/join`                     | `onboarding/join/page.tsx`                     | Join organization         |
| `/onboarding/block-4`                  | `onboarding/block-4/page.tsx`                  | Block 4 completion        |
| `/onboarding/blocked/*`                | `onboarding/blocked/*/page.tsx`                | Blocked state pages       |

### Schedule Builder

| Path                 | File                         | Description         |
| -------------------- | ---------------------------- | ------------------- |
| `/schedules/builder` | `schedules/builder/page.tsx` | Schedule builder UI |

---

## 2. Layout Components

| File                    | Scope                           |
| ----------------------- | ------------------------------- |
| `layout.tsx`            | Root layout (html, body, fonts) |
| `onboarding/layout.tsx` | Onboarding flow layout          |

---

## 3. Loading States

| File                                    | Scope                  |
| --------------------------------------- | ---------------------- |
| `(app)/protected/loading.tsx`           | Protected area loading |
| `(app)/protected/dashboard/loading.tsx` | Dashboard loading      |
| `(app)/protected/schedules/loading.tsx` | Schedules loading      |
| `onboarding/block-4/loading.tsx`        | Block-4 loading        |

---

## 4. UI Components

Located in `apps/web/app/components/`:

### Core UI (`components/ui/`)

| Component | File             | Description                                      |
| --------- | ---------------- | ------------------------------------------------ |
| `Alert`   | `ui/Alert.tsx`   | Alert/notification component                     |
| `Button`  | `ui/Button.tsx`  | Button with variants (primary, secondary, sizes) |
| `Card`    | `ui/Card.tsx`    | Card container component                         |
| `Input`   | `ui/Input.tsx`   | Text input with forwardRef                       |
| `Loading` | `ui/Loading.tsx` | Loading spinner with text                        |
| `Spinner` | `ui/Loading.tsx` | Spinner animation (sm, md, lg)                   |

### Functional Components

| Component        | File                 | Description                  |
| ---------------- | -------------------- | ---------------------------- |
| `ErrorBoundary`  | `ErrorBoundary.tsx`  | React error boundary wrapper |
| `FirebaseSignIn` | `FirebaseSignIn.tsx` | Firebase authentication UI   |
| `Inbox`          | `Inbox.tsx`          | Notifications/messages inbox |
| `MonthView`      | `MonthView.tsx`      | Calendar month view          |
| `ProtectedRoute` | `ProtectedRoute.tsx` | Auth guard component         |
| `UploadStub`     | `UploadStub.tsx`     | File upload placeholder      |

---

## 5. Context Providers

| Provider                  | File                                             | Purpose                   |
| ------------------------- | ------------------------------------------------ | ------------------------- |
| `AuthContext`             | `lib/auth-context.tsx`                           | Firebase auth state       |
| `OnboardingWizardContext` | `onboarding/_wizard/OnboardingWizardContext.tsx` | Onboarding flow state     |
| `Providers`               | `providers.tsx`, `providers/index.tsx`           | Root provider composition |
| `QueryClient`             | `providers/queryClient.ts`                       | TanStack Query setup      |

---

## 6. Hooks

| Hook            | File                   | Purpose                |
| --------------- | ---------------------- | ---------------------- |
| `useCreateItem` | `lib/useCreateItem.ts` | Item creation mutation |

---

## 7. Server Actions

| Action            | File                         | Purpose                     |
| ----------------- | ---------------------------- | --------------------------- |
| `createSchedule`  | `actions/createSchedule.ts`  | Server action for schedules |
| `scheduleActions` | `actions/scheduleActions.ts` | Schedule CRUD actions       |

---

## 8. Utilities & Libs

| Module                  | File                           | Purpose                   |
| ----------------------- | ------------------------------ | ------------------------- |
| `cache`                 | `lib/cache.ts`                 | Client-side caching       |
| `db`                    | `lib/db.ts`                    | Database utilities        |
| `env`                   | `lib/env.ts`                   | Environment configuration |
| `firebaseClient`        | `lib/firebaseClient.ts`        | Firebase client SDK setup |
| `http`                  | `lib/http.ts`                  | HTTP client utilities     |
| `registerServiceWorker` | `lib/registerServiceWorker.ts` | PWA service worker setup  |

---

## 9. Middleware

| File            | Purpose                              |
| --------------- | ------------------------------------ |
| `middleware.ts` | Next.js middleware (auth, redirects) |

---

## 10. Styling

| File          | Purpose                    |
| ------------- | -------------------------- |
| `globals.css` | Global Tailwind CSS styles |
| `fonts.ts`    | Font configuration         |

---

**Total Page Files**: 25+\
**Total Components**: 15+\
**Last Generated**: December 2025
