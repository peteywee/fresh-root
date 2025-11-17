# Fresh Schedules - Comprehensive UX Plan

**Version:** 1.0
**Date:** November 6, 2025
**Status:** Planning Phase
**Owner:** Patrick (peteywee)

---

## Executive Summary

This document defines a comprehensive UX strategy for Fresh Schedules, covering all user
touchpoints, interaction patterns, accessibility requirements, and success metrics. The goal
is to achieve the **≤ 5-minute scheduling KPI** while maintaining **Lighthouse accessibility
≥ 95** and delivering an intuitive, efficient experience across all user roles.

---

## 1. UX Principles & Guidelines

### 1.1 Core UX Principles

1. **Efficiency First**: Minimize clicks and cognitive load to achieve sub-5-minute scheduling
1. **Progressive Disclosure**: Show complexity only when needed
1. **Immediate Feedback**: Every action gets instant visual confirmation
1. **Error Prevention**: Validate early, guide proactively, prevent mistakes
1. **Accessibility by Default**: WCAG 2.1 AA compliance minimum, AAA where feasible
1. **Mobile-First**: Design for touch, scale up for desktop power users
1. **Consistency**: Unified patterns across all features and roles
1. **Recoverability**: Clear undo paths, auto-save, non-destructive actions

### 1.2 Design System Principles

- **Component-Driven**: Reusable, composable UI primitives
- **Theme-Aware**: Full dark mode support, customizable brand colors
- **Responsive**: Fluid layouts, mobile → tablet → desktop
- **Performance-Conscious**: Lazy loading, code splitting, virtualization
- **Documentation-First**: Storybook for every component

---

## 2. User Roles & Personas

### 2.1 Primary Roles

#### Manager (Decision Maker)

- **Goals**: Create schedules quickly, balance labor costs, avoid conflicts
- **Pain Points**: Manual conflict detection, budget overruns, last-minute changes
- **Key Flows**: Create schedule → assign shifts → review conflicts → publish
- **Success Metrics**: Time to publish, error rate, schedule revision count

#### Staff (Shift Worker)

- **Goals**: View my shifts, check in/out, request time off, swap shifts
- **Pain Points**: Not knowing schedule in advance, difficulty swapping shifts
- **Key Flows**: View schedule → check in → view hours → request swap
- **Success Metrics**: Check-in success rate, time to view schedule, swap request completion

#### Corporate (HQ/Analytics)

- **Goals**: View cross-venue analytics, export payroll, audit labor costs
- **Pain Points**: Lack of visibility, manual reporting, compliance checks
- **Key Flows**: View analytics → filter by venue → export reports
- **Success Metrics**: Report generation time, data accuracy, export usage

### 2.2 Secondary Roles

#### Scheduler (Assistant Manager)

- **Goals**: Draft schedules, handle shift swaps, manage availability
- **Key Flows**: Similar to Manager but with limited publish rights

#### Org Owner

- **Goals**: Manage organization settings, add venues, manage members
- **Key Flows**: Create org → add venues → invite managers/staff

---

## 3. User Journey Maps

### 3.1 Critical Path: Manager Creates Weekly Schedule (≤ 5 Minutes)

#### Phase 1: Setup (Target: ≤ 60s)

1. Navigate to Schedules → Click "Create Schedule"
1. Select date range (week picker, defaults to next week)
1. Name schedule (optional, defaults to "Week of [date]")
1. Auto-load positions from venue

**UX Optimizations:**

- ✅ Pre-fill defaults (next week, standard naming)
- ✅ Single-click week selection
- ✅ Skip optional fields by default
- ✅ Show progress indicator (1/4 steps)

#### Phase 2: Assign Shifts (Target: ≤ 180s)

1. Drag positions onto Week Grid to create shifts
1. Auto-suggest staff based on availability & skills
1. Bulk operations: Copy shifts across days, apply templates
1. Real-time conflict detection with visual warnings

**UX Optimizations:**

- ✅ Drag-and-drop shift creation (no modal)
- ✅ Smart staff suggestions (ranked by fit)
- ✅ Keyboard shortcuts for power users
- ✅ Shift templates for common patterns
- ✅ Inline editing (click to modify)
- ✅ Budget tracker visible (hours/cost)

#### Phase 3: Review & Resolve (Target: ≤ 60s)

1. Auto-scan for conflicts (overlaps, overtime, understaffing)
1. Show conflict summary panel
1. One-click fixes for common issues
1. Warning badges on problematic shifts

**UX Optimizations:**

- ✅ Proactive conflict detection (not on-demand)
- ✅ Actionable warnings with suggested fixes
- ✅ Filter view to "show conflicts only"
- ✅ Bulk resolution options

#### Phase 4: Publish (Target: ≤ 60s)

1. Preview schedule with budget summary
1. Confirm publish
1. Notify staff via email/push
1. Success confirmation with analytics preview

**UX Optimizations:**

- ✅ Single "Publish" button (no wizard)
- ✅ Instant publish (async notification)
- ✅ Undo option (5-minute grace period)
- ✅ Share link generated automatically

**Success Criteria:**

- 🎯 80th percentile ≤ 5 minutes (target)
- 🎯 95th percentile ≤ 8 minutes (acceptable)
- 🎯 < 5% error rate (conflicts missed, validation failures)

### 3.2 Staff View Schedule Journey

**Entry Points:**

1. Mobile app launch → Dashboard → "My Shifts" widget
1. Email notification → Click "View Schedule" → Deep link to date
1. Direct URL → `/schedules/[id]`

**User Flow:**

1. See current week by default (today highlighted)
1. Swipe/arrow to navigate weeks
1. Tap shift to see details (time, position, location, notes)
1. Quick actions: Check In, Request Swap, Add to Calendar

**UX Optimizations:**

- ✅ Calendar widget on dashboard (no navigation needed)
- ✅ Today indicator, upcoming shift badge
- ✅ Offline access (cached schedules)
- ✅ Push notifications for new/changed shifts
- ✅ One-tap check-in (GPS verified)

### 3.3 Corporate Analytics Journey

**Entry Points:**

1. Dashboard → "Analytics" tab
1. Direct URL → `/dashboard/analytics`

**User Flow:**

1. Land on executive summary (cross-venue overview)
1. Filter by date range, venue, position
1. View labor cost trends, overtime alerts, compliance metrics
1. Export to CSV/PDF for reporting

**UX Optimizations:**

- ✅ Filters persist in URL (shareable links)
- ✅ Real-time updates (no manual refresh)
- ✅ Downloadable charts (PNG, SVG)
- ✅ Scheduled report delivery (email)
- ✅ Comparison views (week-over-week, venue vs venue)

---

## 4. Component Inventory & Design System

### 4.1 Atomic Components (Base Layer)

#### Form Controls

- `Input` - Text, email, password, number
- `Textarea` - Multi-line text
- `Select` - Single/multi-select dropdown
- `Checkbox` - Binary choice
- `Radio` - Single choice from set
- `Switch` - Toggle (on/off)
- `DatePicker` - Calendar date selection
- `TimePicker` - Time selection
- `RangePicker` - Date/time ranges

**Accessibility Requirements:**

- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus indicators (visible, 3:1 contrast)
- ✅ Error messages (live regions)
- ✅ Touch targets ≥ 44x44px

#### Feedback Components

- `Button` - Primary, secondary, tertiary, danger, ghost
- `Badge` - Status indicators (success, warning, error, info)
- `Toast` - Temporary notifications (auto-dismiss)
- `Alert` - Persistent messages (inline)
- `Spinner` - Loading indicator
- `Skeleton` - Loading placeholder
- `ProgressBar` - Determinate progress
- `Tooltip` - Contextual help (hover/focus)

**Accessibility Requirements:**

- ✅ Button states (default, hover, active, disabled, loading)
- ✅ ARIA live regions for toasts/alerts
- ✅ Loading announcements for screen readers
- ✅ Tooltips accessible via keyboard focus

#### Layout Components

- `Card` - Content container
- `Modal` - Dialog overlay
- `Sheet` - Slide-in panel (mobile)
- `Tabs` - Tabbed navigation
- `Accordion` - Collapsible sections
- `Divider` - Visual separator
- `Stack` - Vertical/horizontal layout
- `Grid` - Responsive grid layout

**Accessibility Requirements:**

- ✅ Modal focus trap (Escape to close)
- ✅ Tab navigation (roving tabindex)
- ✅ Accordion expanded state announced
- ✅ Landmark regions (nav, main, aside)

### 4.2 Composite Components (Feature Layer)

#### Scheduler Components

- `WeekGrid` - 7-day shift grid with drag-and-drop
- `MonthView` - Calendar month overview
- `ShiftCard` - Individual shift display/edit
- `PositionBadge` - Position with color coding
- `StaffAvatar` - User photo + name
- `BudgetTracker` - Hours/cost summary
- `ConflictIndicator` - Visual warning for issues
- `ShiftTemplate` - Saved shift pattern selector

#### Dashboard Components

- `StatsCard` - Metric display (number + trend)
- `ChartWidget` - Line, bar, pie charts
- `RecentActivity` - Timeline of events
- `NotificationPanel` - Alerts and updates
- `QuickActions` - Shortcuts to common tasks

#### Navigation Components

- `AppShell` - Top nav + sidebar + main content
- `Sidebar` - Collapsible navigation menu
- `Breadcrumbs` - Page hierarchy
- `UserMenu` - Profile, settings, logout
- `VenueSelector` - Switch active venue

### 4.3 Design Tokens

#### Color Palette

```typescript
// Primary (brand)
primary: { 50: '#E3F2FD', 100: '#BBDEFB', ..., 900: '#0D47A1' }

// Semantic (system)
success: { light: '#4CAF50', main: '#2E7D32', dark: '#1B5E20' }
warning: { light: '#FF9800', main: '#F57C00', dark: '#E65100' }
error: { light: '#F44336', main: '#D32F2F', dark: '#C62828' }
info: { light: '#2196F3', main: '#1976D2', dark: '#0D47A1' }

// Neutral (grayscale)
gray: { 50: '#FAFAFA', 100: '#F5F5F5', ..., 900: '#212121' }

// Dark mode variants
dark: { bg: '#121212', surface: '#1E1E1E', ... }
```

#### Typography Scale

```typescript
// Font families
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['Fira Code', 'monospace'],
}

// Font sizes (rem)
fontSize: {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
}

// Line heights
lineHeight: {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
}
```

#### Spacing Scale

```typescript
spacing: {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
}
```

#### Responsive Breakpoints

```typescript
screens: {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

---

## 5. Interaction Patterns

### 5.1 Drag-and-Drop Patterns

#### Shift Creation (Week Grid)

1. **Grab**: Mouse down on position badge in sidebar
1. **Drag**: Cursor shows shift preview (position + default duration)
1. **Drop**: Release on time slot → shift created with smart defaults
1. **Feedback**: Slot highlights on hover, snaps to 15-min increments

**Accessibility Alternative:**

- Keyboard: Tab to position → Enter → Arrow keys to navigate grid → Enter to place

#### Shift Reassignment

1. **Grab**: Mouse down on existing shift
1. **Drag**: Ghost copy follows cursor, original dims
1. **Drop**: Release on new slot → shift moved, conflicts checked
1. **Feedback**: Drop zones highlight, conflicts show red

**Accessibility Alternative:**

- Keyboard: Focus shift → M (move) → Arrow keys → Enter to place

### 5.2 Bulk Operations

#### Multi-Select Pattern

1. **Enter Selection Mode**: Checkbox appears on shift hover
1. **Select Multiple**: Click checkboxes or Shift+click range
1. **Bulk Actions**: Toolbar appears with Delete, Copy, Move, Assign
1. **Exit**: Deselect all or Escape key

**Keyboard Shortcuts:**

- `Cmd/Ctrl + A` - Select all visible shifts
- `Cmd/Ctrl + Click` - Add to selection
- `Shift + Click` - Select range
- `Delete` - Delete selected

### 5.3 Inline Editing

#### Quick Edit Pattern (Shift Details)

1. **Trigger**: Click on shift card
1. **Inline Form**: Card expands to show editable fields
1. **Save**: Auto-save on blur or Enter
1. **Cancel**: Escape key or click outside

**Fields:**

- Staff (autocomplete dropdown)
- Start/End time (time pickers)
- Position (dropdown)
- Notes (textarea)
- Break minutes (number input)

### 5.4 Conflict Resolution

#### Conflict Detection Flow

1. **Real-Time Check**: Validate on every shift change (debounced 300ms)
1. **Visual Indicator**: Red border + warning icon on conflicting shifts
1. **Summary Panel**: "3 conflicts detected" with expand/collapse
1. **Drill-Down**: Click conflict to see details + suggested fixes

**Conflict Types:**

- **Overlap**: Same person, overlapping times
- **Overtime**: Person exceeds weekly hour limit
- **Understaffing**: Position has no coverage during required hours
- **Overstaffing**: Too many people assigned (budget warning)

**Auto-Fix Options:**

- Split shift to remove overlap
- Reassign to different staff
- Adjust times to eliminate gap
- Accept with override (manager approval)

---

## 6. Accessibility Compliance

### 6.1 WCAG 2.1 Level AA Requirements

#### Perceivable

- ✅ Text contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text)
- ✅ Non-text contrast ≥ 3:1 (UI components, graphics)
- ✅ Alt text for all images and icons
- ✅ Video captions and audio transcripts
- ✅ Content reflow at 400% zoom (no horizontal scroll)
- ✅ Color not sole indicator (use icons + text)

#### Operable

- ✅ All functionality keyboard accessible
- ✅ No keyboard traps (modal focus management)
- ✅ Sufficient time for interactions (no auto-dismiss < 20s)
- ✅ Pause/stop for moving content
- ✅ No flashing content > 3 times/second
- ✅ Skip navigation links
- ✅ Descriptive page titles
- ✅ Logical focus order

#### Understandable

- ✅ Page language declared (`lang` attribute)
- ✅ Predictable navigation (consistent locations)
- ✅ Context-sensitive help available
- ✅ Error identification and suggestions
- ✅ Labels for all form inputs
- ✅ Instructions for complex interactions

#### Robust

- ✅ Valid HTML (no parse errors)
- ✅ ARIA roles, states, properties correct
- ✅ Status messages announced (live regions)
- ✅ Compatible with assistive technologies

### 6.2 Keyboard Navigation Standards

#### Global Shortcuts

- `Tab` / `Shift+Tab` - Navigate focusable elements
- `Enter` / `Space` - Activate buttons, links
- `Escape` - Close modals, cancel operations
- `?` - Show keyboard shortcuts help

#### Week Grid Shortcuts

- `Arrow Keys` - Navigate cells
- `Enter` - Select/edit shift
- `Delete` - Delete selected shift
- `C` - Copy shift
- `V` - Paste shift
- `M` - Move shift (enter move mode)
- `A` - Assign staff to shift
- `N` - Add notes to shift

#### Dashboard Shortcuts

- `G D` - Go to Dashboard
- `G S` - Go to Schedules
- `G A` - Go to Analytics
- `G P` - Go to Profile
- `/` - Focus search

### 6.3 Screen Reader Support

#### Announcements Required

- Page load: "Schedule page loaded, 15 shifts scheduled"
- Action complete: "Shift created for John Doe, Monday 9am-5pm"
- Error: "Conflict detected: John Doe has overlapping shifts"
- Loading: "Loading schedule data" (ARIA live region)
- Success: "Schedule published successfully"

#### Semantic HTML

- `<nav>` for navigation menus
- `<main>` for primary content
- `<aside>` for sidebars
- `<article>` for shift cards
- `<section>` with headings for content groups
- `<table>` with `<caption>`, `<th scope>` for data tables

---

## 7. Performance Budgets

### 7.1 Core Web Vitals Targets

#### Largest Contentful Paint (LCP)

- **Target**: ≤ 2.5 seconds
- **Acceptable**: ≤ 4.0 seconds
- **Measured On**: Dashboard, Week Grid, Month View

**Optimization Strategies:**

- Server-side rendering (SSR) for initial paint
- Preload critical fonts and images
- Lazy load below-the-fold content
- Optimize images (WebP, responsive sizes)

#### First Input Delay (FID)

- **Target**: ≤ 100ms
- **Acceptable**: ≤ 300ms
- **Measured On**: All interactive pages

**Optimization Strategies:**

- Code splitting to reduce main thread work
- Defer non-critical JavaScript
- Use Web Workers for heavy computations
- Debounce expensive event handlers

#### Cumulative Layout Shift (CLS)

- **Target**: ≤ 0.1
- **Acceptable**: ≤ 0.25
- **Measured On**: All pages

**Optimization Strategies:**

- Reserve space for images (width/height attributes)
- Avoid inserting content above existing content
- Use CSS transforms for animations (not layout properties)
- Preload fonts to prevent FOIT/FOUT

### 7.2 Page-Specific Budgets

#### Week Grid Performance

- **Initial Render**: < 200ms (1,000 rows)
- **Scroll FPS**: ≥ 55 FPS (smooth scrolling)
- **Drag-and-Drop Latency**: < 50ms (instant feedback)
- **Conflict Check Latency**: < 300ms (debounced)

**Techniques:**

- Virtual scrolling (react-window or react-virtual)
- Memoization for expensive calculations
- RequestAnimationFrame for smooth drag updates
- Web Workers for conflict detection

#### Dashboard Performance

- **Time to Interactive (TTI)**: < 2.5s on 3G
- **Chart Render**: < 100ms per chart
- **API Response**: < 500ms (p95)

**Techniques:**

- Lazy load charts below fold
- Incremental static regeneration (ISR) for stats
- Redis cache for dashboard data (30s TTL)

### 7.3 Bundle Size Budgets

#### JavaScript Bundles

- **Critical (first load)**: ≤ 200KB gzipped
- **Total**: ≤ 500KB gzipped
- **Route-specific**: ≤ 100KB per route

**Monitoring:**

- Webpack Bundle Analyzer in CI
- Bundle size checks on PR (fail if +10%)

#### CSS Bundles

- **Critical**: ≤ 50KB gzipped
- **Total**: ≤ 100KB gzipped

**Optimization:**

- PurgeCSS to remove unused styles
- Critical CSS inlined in HTML head

#### Images & Assets

- **Hero images**: ≤ 200KB
- **Icons**: SVG or icon font (≤ 50KB)
- **Fonts**: ≤ 100KB (subset, woff2)

---

## 8. Mobile Experience

### 8.1 Mobile-First Design

#### Touch Targets

- **Minimum Size**: 44x44px (iOS), 48x48px (Material)
- **Spacing**: ≥ 8px between targets
- **Hit Area**: Padding extends beyond visible element

#### Gestures

- **Swipe**: Navigate between weeks/months
- **Pinch**: Zoom calendar view
- **Long Press**: Context menu (edit, delete, etc.)
- **Pull to Refresh**: Update schedule data

#### Mobile Navigation

- **Bottom Tab Bar**: 4-5 primary destinations
  - Home (Dashboard)
  - Schedules (My Shifts)
  - Availability
  - Profile
- **Hamburger Menu**: Secondary navigation
  - Settings
  - Help
  - Logout

### 8.2 Progressive Web App (PWA)

#### Installation

- **Prompt**: After 2+ visits or specific action (e.g., view schedule)
- **Benefits**: Faster load, offline access, push notifications
- **Icon**: Branded app icon on home screen

#### Offline Capabilities

- **Cache Strategy**:
  - Static assets: Cache-first
  - API calls: Network-first with cache fallback
  - Mutations: Queue and sync when online
- **Offline Indicator**: Banner at top showing sync status
- **Data Staleness**: Show "last updated" timestamp

#### Push Notifications

- **Opt-In**: Prompt after first schedule published
- **Types**:
  - New schedule published
  - Shift changed/cancelled
  - Shift reminder (1 hour before)
  - Swap request approved/denied
- **Channels**: Control notification types in settings

---

## 9. Error Handling & Edge Cases

### 9.1 User Error Prevention

#### Form Validation

- **Inline Validation**: Show errors as user types (debounced)
- **Field-Level Messages**: Specific, actionable error text
- **Required Fields**: Marked with asterisk, validate on blur
- **Format Hints**: Placeholder text shows expected format

#### Conflict Prevention

- **Real-Time Warnings**: Check conflicts before save
- **Suggested Fixes**: "John is already scheduled 9am-5pm. Assign Sarah instead?"
- **Override Option**: Manager can accept conflict with reason

### 9.2 System Error Handling

#### API Errors

- **Network Error**: "Connection lost. Retrying..."
- **Timeout**: "Request timed out. Try again?"
- **Server Error**: "Something went wrong. Our team has been notified."
- **Validation Error**: "Please check: [field-specific issues]"

#### Error Recovery

- **Auto-Retry**: Failed requests retry with exponential backoff
- **Offline Queue**: Mutations queued when offline, synced when online
- **Undo Option**: For destructive actions (delete, publish)
- **Auto-Save**: Draft schedules saved every 30s

### 9.3 Empty States

#### No Data

- **First Time**: "No schedules yet. Create your first schedule!"
- **After Deletion**: "All schedules deleted. Start fresh?"
- **No Results**: "No shifts match your filters. Try different criteria."

#### Loading States

- **Skeleton Screens**: Show layout with placeholder content
- **Spinners**: For quick operations (< 2s)
- **Progress Bars**: For long operations (file upload, export)

---

## 10. Internationalization (i18n)

### 10.1 Locale Support

#### Phase 1 (Launch)

- English (US) - en-US

#### Phase 2 (Future)

- Spanish (US) - es-US
- French (Canada) - fr-CA

### 10.2 Localization Considerations

#### Text

- **Extractable**: All UI strings in i18n files (no hardcoded text)
- **Pluralization**: Handle singular/plural forms
- **Context**: Different translations for same word based on context

#### Dates & Times

- **Format**: Locale-aware (MM/DD/YYYY vs DD/MM/YYYY)
- **Timezone**: Display in user's local timezone
- **Relative Times**: "2 hours ago" vs "il y a 2 heures"

#### Numbers & Currency

- **Format**: Locale-aware separators (1,000.00 vs 1.000,00)
- **Currency**: $ vs € vs £ (future: multi-currency support)

---

## 11. Analytics & Metrics

### 11.1 User Behavior Tracking

#### Instrumentation Points

- **Page Views**: Track all route changes
- **Feature Usage**: Button clicks, menu selections
- **User Flows**: Schedule creation funnel, check-in completion
- **Errors**: Client-side errors, API failures
- **Performance**: Web Vitals, custom timing marks

#### Privacy Considerations

- **Anonymization**: No PII in analytics (hash user IDs)
- **Consent**: Cookie banner for non-essential tracking
- **Opt-Out**: User setting to disable analytics

### 11.2 Success Metrics (KPIs)

#### Primary KPIs

- **Schedule Creation Time**: 80th percentile ≤ 5 minutes
- **Check-In Success Rate**: ≥ 95%
- **Conflict Resolution Rate**: ≥ 90% resolved before publish
- **User Satisfaction (NPS)**: ≥ 50

#### Secondary KPIs

- **Feature Adoption**: % users using templates, bulk ops, etc.
- **Return Rate**: % users returning within 7 days
- **Error Rate**: < 2% of sessions with errors
- **Performance**: LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1

### 11.3 A/B Testing Framework

#### Test Candidates

- **Onboarding Flow**: Single-page vs multi-step wizard
- **Week Grid Layout**: Horizontal scroll vs pagination
- **Conflict Warnings**: Inline vs summary panel
- **CTA Copy**: "Publish Schedule" vs "Publish & Notify"

#### Testing Infrastructure

- **Tool**: LaunchDarkly, Split.io, or custom feature flags
- **Sample Size**: Calculate for 80% power, 5% significance
- **Duration**: Min 7 days or 1,000 users per variant

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Blocks 3-4, Weeks 1-4)

#### Week 1-2: Design System

- [ ] Define design tokens (colors, typography, spacing)
- [ ] Build atomic components (Button, Input, Card, etc.)
- [ ] Set up Storybook
- [ ] Implement dark mode
- [ ] Accessibility audit (automated + manual)

#### Week 3-4: Core Scheduler UX

- [ ] Week Grid component with virtual scrolling
- [ ] Drag-and-drop shift creation
- [ ] Conflict detection UI
- [ ] Keyboard navigation
- [ ] Mobile touch interactions

### Phase 2: Optimization (Block 4, Weeks 5-6)

#### Week 5: Performance

- [ ] Lighthouse CI setup
- [ ] Bundle size optimization
- [ ] Web Vitals instrumentation
- [ ] Performance benchmarks

#### Week 6: Polish

- [ ] Error handling and edge cases
- [ ] Loading states and skeletons
- [ ] Empty states with CTAs
- [ ] Toast notifications

### Phase 3: Advanced Features (Block 4, Weeks 7-8)

#### Week 7: Power User Features

- [ ] Shift templates
- [ ] Bulk operations
- [ ] Undo/redo
- [ ] Advanced keyboard shortcuts

#### Week 8: Analytics & Feedback

- [ ] UX metrics instrumentation
- [ ] Analytics dashboard
- [ ] User feedback widget
- [ ] A/B testing framework

### Phase 4: Mobile & PWA (Block 4, Weeks 9-10)

#### Week 9: Mobile Experience

- [ ] Mobile-optimized layouts
- [ ] Touch gestures
- [ ] Bottom navigation
- [ ] Mobile performance optimization

#### Week 10: PWA Features

- [ ] Service worker caching
- [ ] Offline support
- [ ] Push notifications
- [ ] Install prompt

---

## 13. Testing Strategy

### 13.1 Automated Testing

#### Unit Tests (Vitest)

- All component props and state logic
- Utility functions (date math, validation)
- Business logic (conflict detection, budget calculation)
- **Coverage Target**: ≥ 80%

#### Integration Tests (Vitest + React Testing Library)

- User interactions (click, type, drag)
- Form submissions
- API mocking (MSW)
- **Coverage Target**: ≥ 70%

#### E2E Tests (Playwright)

- Critical paths: Login → Create Schedule → Publish
- Cross-browser (Chrome, Firefox, Safari)
- Mobile viewport testing
- **Coverage**: Top 10 user journeys

### 13.2 Manual Testing

#### Accessibility Testing

- **Tools**: axe DevTools, WAVE, Lighthouse
- **Screen Readers**: NVDA (Windows), JAWS, VoiceOver (Mac/iOS)
- **Keyboard Only**: Complete workflows without mouse
- **Zoom**: Test at 200%, 400% zoom

#### Usability Testing

- **Method**: Moderated sessions with 5-8 users per role
- **Tasks**: Realistic scenarios (create schedule, check in, etc.)
- **Metrics**: Task completion time, error rate, satisfaction
- **Cadence**: Every 2 sprints

#### Cross-Browser Testing

- **Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Devices**: iOS (iPhone), Android (Pixel), Tablets
- **Tools**: BrowserStack for device lab

---

## 14. Documentation & Training

### 14.1 User Documentation

#### In-App Help

- **Tooltips**: Contextual help on hover/focus
- **Help Icons**: "?" icons next to complex features
- **Onboarding Tour**: First-time user walkthrough
- **Video Tutorials**: 1-2 minute clips for key features

#### Help Center

- **Getting Started**: Setup guide for new orgs
- **Feature Guides**: Detailed articles for each feature
- **FAQs**: Common questions and troubleshooting
- **Video Library**: Comprehensive screencasts

### 14.2 Developer Documentation

#### Component Documentation

- **Storybook**: Interactive component playground
- **API Docs**: Props, events, slots, examples
- **Design Guidelines**: When to use each component

#### UX Patterns

- **Pattern Library**: Reusable interaction patterns
- **Do's and Don'ts**: Best practices and anti-patterns
- **Accessibility Guidelines**: WCAG compliance checklist

---

## 15. Success Criteria & Sign-Off

### 15.1 Launch Readiness Checklist

#### Functional

- [ ] All critical user journeys tested (E2E)
- [ ] All P0 bugs resolved
- [ ] API error handling complete
- [ ] Data validation comprehensive

#### Performance

- [ ] Lighthouse scores: ≥90 overall, ≥95 accessibility
- [ ] Core Web Vitals pass (LCP, FID, CLS)
- [ ] Bundle sizes under budget
- [ ] Performance tests pass in CI

#### Accessibility

- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader testing complete
- [ ] Keyboard navigation verified
- [ ] Color contrast checks pass

#### Documentation

- [ ] User help center published
- [ ] In-app onboarding complete
- [ ] Component library documented (Storybook)
- [ ] Release notes prepared

### 15.2 Post-Launch Monitoring

#### Week 1

- Monitor error rates, crash logs
- Track Core Web Vitals in production
- Watch user feedback channels (email, in-app)
- Review support tickets

#### Week 2-4

- Analyze user behavior metrics
- Identify UX friction points
- A/B test top priority improvements
- Iterate on feedback

#### Month 2+

- Quarterly UX reviews
- Usability testing rounds
- Feature adoption analysis
- Roadmap prioritization

---

## 16. Appendix

### A. UX Research Findings (To Be Conducted)

#### User Interviews

- Target: 10-15 managers, 10-15 staff, 5 corporate users
- Questions: Pain points, current workflows, feature requests
- Output: Persona refinement, priority ranking

#### Competitive Analysis

- **Tools**: When I Work, Deputy, 7shifts, Homebase
- **Focus**: Scheduling UX, mobile experience, pricing
- **Output**: Feature parity matrix, differentiation strategy

### B. Design Inspiration & References

#### Design Systems

- Material Design (Google)
- Fluent UI (Microsoft)
- Carbon Design System (IBM)
- Ant Design
- Chakra UI

#### Scheduling Tools

- Google Calendar (interaction patterns)
- Calendly (booking flow)
- Microsoft Outlook (week view)
- Apple Calendar (mobile UX)

### C. Glossary

- **LCP**: Largest Contentful Paint (Core Web Vital)
- **FID**: First Input Delay (Core Web Vital)
- **CLS**: Cumulative Layout Shift (Core Web Vital)
- **TTI**: Time to Interactive (performance metric)
- **WCAG**: Web Content Accessibility Guidelines
- **NPS**: Net Promoter Score (satisfaction metric)
- **PWA**: Progressive Web App
- **CTA**: Call to Action
- **KPI**: Key Performance Indicator

---

## Document Control

**Version History:**

- v1.0 - 2025-11-06 - Initial comprehensive UX plan

**Review Cycle:**

- Quarterly review and update
- After each major release
- Based on user feedback and analytics

**Stakeholders:**

- Product Owner: Patrick
- UX Lead: [TBD]
- Engineering Lead: [TBD]
- QA Lead: [TBD]

**Next Steps:**

1. Review and approve this UX plan
1. Prioritize Phase 1 tasks in TODO-v13.md
1. Conduct user research interviews
1. Begin design system implementation
1. Set up analytics and monitoring
