# Brand Kit Implementation & Testing Plan

**Date**: January 14, 2026  
**Status**: Planning phase  
**Scope**: Fix CORS warning, verify/enhance e2e tests, apply brand identity to landing page

---

## 🎯 Objectives

1. **Fix CORS Warning** - Add `allowedDevOrigins` to next.config to suppress dev cross-origin warning
2. **Verify Google OAuth** - Confirm signin with Google still works in refactored login page
3. **Test Auth Flows** - Write/enhance e2e tests for magic link signup and Google signin
4. **Map Post-Signin Flow** - Document where users land after authentication
5. **Apply Brand Kit** - Use existing design tokens + UI/UX agent to professionally design landing page

---

## 📊 Current State Analysis

### Authentication Flow
```
User lands on /
  ↓
Middleware checks session → redirects if needed
  ↓
If authenticated:
  - Redirects to onboarding (if new) or (app)/protected/dashboard
If not authenticated:
  - Stays on / (landing page) or can navigate to /login

After magic link signup/google signin:
  /auth/callback → establishes session → router.replace("/")
  → then middleware redirects to onboarding or dashboard
```

### Existing Brand Kit (From Design System)
**File**: `apps/web/app/globals.css` + `apps/web/tailwind.config.ts`

#### Primary Palette
- **TS Black**: `240 16% 2%` - Primary background
- **TS Mist**: `220 13% 96%` - Primary text
- **TS Gold**: `47 64% 52%` - Primary action/accent
- **TS Charcoal**: `223 13% 11%` - Card backgrounds
- **TS Slate**: `216 10% 19%` - Secondary actions

#### Schedule Color System (Data Visualization)
- **Schedule Blue**: `217 91% 60%` - Morning shifts
- **Schedule Amber**: `32 95% 55%` - Mid-day/peak
- **Schedule Purple**: `270 95% 65%` - Evening shifts
- **Schedule Green**: Data positive states
- **Schedule Rose**: Data negative states

#### Typography
- **Font Family**: Inter (body), Montserrat (headings, weights 600/700/800)
- **Heading Style**: Bold with tight letter-spacing (-0.025em)
- **Size Scale**: H1(4xl)→H6→Body→Small→Tiny

#### Spacing System
- `xs`: 2px
- `sm`: 4px
- `md`: 8px
- `lg`: 16px
- `xl`: 24px
- `2xl`: 32px

---

## 🔧 Task Breakdown

### Task 1: Fix CORS Warning
**Effort**: 5 minutes | **Complexity**: Low

**Current Warning**:
```
⚠ Cross origin request detected from 100.115.92.204 to /_next/* resource.
In a future major version of Next.js, you will need to explicitly configure 
"allowedDevOrigins" in next.config to allow this.
```

**Solution**:
- Read current `apps/web/next.config.mjs`
- Add `allowedDevOrigins` array with localhost IPs/domains
- Restart dev server

**Files Modified**: `apps/web/next.config.mjs` (+5 lines)

---

### Task 2: Verify Google OAuth
**Effort**: 10 minutes | **Complexity**: Low

**Checklist**:
- [ ] Google button visible on `/login` page
- [ ] Google auth provider configured in Firebase
- [ ] Pop-up flow works (not redirect)
- [ ] Session established after Google signin
- [ ] User redirected correctly

**Files to Check**:
- `apps/web/app/(auth)/login/page.tsx` - Google FirebaseUI integration
- `apps/web/src/lib/auth-helpers.ts` - GoogleAuthProvider setup
- `apps/web/app/auth/callback/page.tsx` - completeGoogleRedirectOnce()

---

### Task 3: Enhance E2E Tests
**Effort**: 30-45 minutes | **Complexity**: Medium

**Current Test Coverage** (`e2e/auth-flow.spec.ts`):
- ✅ Redirect unauthenticated users
- ✅ Login page displays auth options
- ✅ Protected routes redirect
- ✅ Security tests (CSRF, rate limiting, cookies)
- ❌ Missing: Magic link signup flow
- ❌ Missing: Google OAuth flow
- ❌ Missing: Email verification success states

**New Tests Needed**:

1. **Magic Link Signup Happy Path**
   - Navigate to /login
   - Click "Create Account"
   - Enter valid email
   - Check email verification page renders
   - Simulate clicking magic link
   - Verify "Email Verified!" success state
   - Verify auto-redirect to dashboard

2. **Magic Link Signin**
   - Navigate to /login
   - Click "Sign In"
   - Enter email
   - Verify link sent
   - Complete link
   - Verify session created

3. **Google OAuth Flow**
   - Navigate to /login
   - Click "Sign In with Google"
   - (Mock via Firebase emulator or use test account)
   - Verify session created
   - Verify redirect to dashboard

4. **Error Scenarios**
   - Invalid email format blocks submit
   - Network error during link send shows error
   - Expired link shows error with recovery option
   - Rate limiting (resend throttle) enforced

5. **Mobile Tests**
   - Magic link flow on mobile viewport
   - Touch targets ≥44px
   - Form responsive on small screens

**Files Created/Modified**:
- `e2e/auth-flow.spec.ts` - Enhance existing file (~100 lines added)
- May create `e2e/magic-link-flow.spec.ts` for dedicated tests

---

### Task 4: Map Post-Signin Flow
**Effort**: 5 minutes | **Complexity**: Low

**Research Results**:
```
After successful signin with magic link or Google:
  
  1. /auth/callback page
     - Calls completeEmailLinkIfPresent() or completeGoogleRedirectOnce()
     - Shows loading spinner
     - On magic link: shows "Email Verified!" success for 1.5s
     - Calls establishServerSession()
  
  2. router.replace("/")
     - Redirects to root
  
  3. Middleware checks session
     - If authenticated: routes to next destination
     - If first time user (no org): sends to /onboarding
     - If existing org: sends to /(app)/protected/dashboard
  
  4. Final destination
     - New users: /onboarding (create org flow)
     - Existing users: /dashboard (schedules, teams, etc.)
```

**Documentation**:
- Create section in docs explaining post-signin routing
- Document how onboarding determines "first time" status

---

### Task 5: Apply Brand Kit to Landing Page
**Effort**: 45 minutes | **Complexity**: Medium

**Current Landing Page** (`apps/web/app/page.tsx`):
- Basic heading "Fresh Schedules"
- Generic feature cards
- Minimal styling
- Lacks brand personality

**Redesign Goals**:
- ✨ Hero section with brand colors (TS Gold accent)
- 🎨 Use TS Charcoal cards with proper spacing
- 📝 Montserrat headings, Inter body copy
- 🌈 Schedule color palette for feature icons
- 📱 Professional mobile layout
- 🎯 Clear CTA buttons with hover states
- 💫 Subtle animations (fade-in, slide-up)

**Design Sections**:

1. **Hero Section**
   - Large heading in Montserrat
   - Sub-heading in smaller size
   - Two CTAs: "Get Started" (primary gold), "View Demo" (secondary slate)
   - Gradient background (TS Black to TS Charcoal)

2. **Features Section**
   - 3 cards in md:grid-cols-3
   - Each card has colored icon (from schedule palette)
   - Title in Montserrat, description in Inter
   - Subtle hover effects

3. **Benefits Section** (NEW)
   - Why Fresh Schedules is different
   - Use brand colors for emphasis
   - Professional spacing (8px → 32px scale)

4. **CTA Section** (NEW)
   - "Ready to get started?" call-out
   - Primary button
   - "Or view demo" secondary option

5. **Footer** (FUTURE)
   - Links, copyright
   - Brand colors

**Implementation**:
- Will involve UI/UX agent for visual polish
- Use design system color classes
- Ensure accessibility (WCAG AA)
- Test responsive on mobile/tablet

**Files Modified**:
- `apps/web/app/page.tsx` (~150 lines, comprehensive redesign)

---

## 🚀 Execution Order

### Phase 1: Quick Wins (15 min)
1. ✅ Fix CORS warning (Task 1)
2. ✅ Verify Google OAuth works (Task 2)
3. ✅ Document post-signin flow (Task 4)

### Phase 2: Testing (45 min)
4. Enhance e2e tests (Task 3)

### Phase 3: Brand Implementation (45 min)
5. Redesign landing page with brand kit (Task 5)
   - Engage UI/UX agent for visual guidance
   - Iterate on design
   - Test responsiveness

---

## 📋 Validation Checklist

**After CORS Fix**:
- [ ] Dev server warning gone
- [ ] App still runs smoothly

**After Google OAuth Verification**:
- [ ] Google button visible on `/login`
- [ ] Click launches Google popup
- [ ] Successful signin creates session
- [ ] User redirected to dashboard/onboarding

**After E2E Tests**:
- [ ] All new tests pass locally
- [ ] Tests pass in CI pipeline
- [ ] Coverage includes magic link + Google flows

**After Brand Implementation**:
- [ ] Landing page uses TS Gold, TS Charcoal, TS Mist colors
- [ ] Montserrat used for headings, Inter for body
- [ ] Feature icons use schedule color palette
- [ ] Mobile responsive (tested on iPhone, Android, iPad)
- [ ] WCAG 2.1 AA accessible
- [ ] Animations smooth (60 FPS)
- [ ] UI/UX agent reviewed and approved

---

## 🛠️ Tools & Resources

**Brand Kit Reference**:
- `apps/web/app/globals.css` - Color tokens
- `apps/web/tailwind.config.ts` - Tailwind config
- `apps/web/components/ui/*` - Existing components

**Testing Tools**:
- Playwright (E2E)
- Firebase Emulator (Auth testing)
- DevTools (Mobile testing)

**UI/UX Agent**:
- Prompt: `.github/prompts/ui-ux-agent.md`
- Engage for: Design review, accessibility audit, animation polish

---

## 📝 Notes

### Brand Kit Completeness
The brand kit is well-defined with:
- ✅ Color palette (primary/secondary + schedule colors)
- ✅ Typography system (Montserrat + Inter)
- ✅ Spacing system (xs-2xl)
- ✅ Component patterns (cards, buttons, etc.)

### Post-Signin Flow
Users following the route: `/auth/callback` → `/` → `/onboarding` or `/dashboard`

The middleware handles the actual routing based on:
- Session existence
- User's organization status
- First-time user detection

### Google OAuth Status
Google OAuth is preserved in refactored login page and should work without issues. The button is part of a separate FirebaseUI instance (not removed).

---

**Next Step**: Start with Phase 1 (CORS fix + Google verification) then move to comprehensive e2e testing and brand implementation.
