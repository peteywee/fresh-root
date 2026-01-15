# Landing Page Redesign Brief for UI/UX Agent

**Target File**: `apps/web/app/page.tsx` (currently ~100 lines)  
**Current State**: Basic landing page with minimal styling  
**Goal**: Professionally designed, brand-aligned landing page using Fresh Schedules brand kit

---

## Brand Kit Reference

### Color Palette
```css
/* Top Shelf (TS) Brand Colors */
--background: 240 16% 2%;           /* TS Black - primary background */
--foreground: 220 13% 96%;          /* TS Mist - primary text */
--card: 223 13% 11%;                /* TS Charcoal - card/surface background */
--primary: 47 64% 52%;              /* TS Gold (#F4A835) - CTAs, accents */
--secondary: 216 10% 19%;           /* TS Slate - secondary actions */

/* Schedule/Data Colors (use for feature icons) */
--schedule-blue: 217 91% 60%;       /* Morning/Opening shifts */
--schedule-amber: 32 95% 55%;       /* Mid-day/Peak hours */
--schedule-purple: 270 95% 65%;     /* Evening/Closing shifts */
--schedule-green: Data positives    /* Success states */
--schedule-rose: Data negatives     /* Alert states */
```

### Typography
```
Headings: Montserrat (weights 600/700/800)
  - H1: text-4xl font-semibold tracking-tight
  - H2: text-3xl font-bold
  - H3: text-xl font-semibold
  
Body: Inter
  - Default: base font-normal
  - Muted: text-muted-foreground
  - Small: text-sm

Styling: Bold headings, tight letter-spacing (-0.025em)
```

### Spacing System
- xs: 2px (2)
- sm: 4px (4)
- md: 8px (8)
- lg: 16px (4)
- xl: 24px (6)
- 2xl: 32px (8)

---

## Current Landing Page Content

```tsx
<h1>Fresh Schedules</h1>
<p>Build a full schedule fast, stay inside labor targets, and keep teams aligned.</p>

Buttons:
- "Get started" (arrow icon)
- "View demo"

Features (3-card grid):
- Clock icon: "Speed" - Create a workable schedule in minutes, not hours.
- ShieldCheck icon: "Control" - Guardrails that keep labor planning and compliance from drifting.
- Users icon: "Team-ready" - Clear assignments and visibility for managers and staff.
```

---

## Redesign Requirements

### Hero Section
**Layout**:
- Full-width gradient background: from-background via-card to-surface-accent
- Container with max-w-6xl, centered text
- Hero heading, subheading, two CTAs side-by-side

**Styling**:
- H1: "Fresh Schedules" in Montserrat, bold, 4xl-5xl size
- Subheading: Soft TS Mist color, 1.5x normal size, text-balance
- CTA Group:
  - Primary: "Get Started" with TS Gold background, white text
  - Secondary: "View Demo" with TS Slate border, TS Mist text
  - Both buttons: hover effects (scale, shadow), rounded-lg, proper spacing
- Optional: Add animated gradient or subtle movement to hero

**Icon/Visual**:
- Optional: Small illustrated icon or badge near heading (e.g., "Top Shelf Service" tagline)

### Features Section (3-Column Grid)
**Layout**:
- md:grid-cols-3 on desktop, single column on mobile
- Consistent gap: gap-6 (24px)
- Cards within max-w-6xl container

**Cards**:
- Each card: Card component from UI library (TS Charcoal background)
- Header: Icon + Title (Montserrat, semibold)
- Body: Description (Inter, muted text, line-height 1.6)
- Hover: Subtle shadow increase, border highlight
- Icon colors: Use schedule palette
  - Speed (Clock): schedule-amber
  - Control (ShieldCheck): schedule-blue  
  - Team-ready (Users): schedule-purple

**Example Card Structure**:
```
┌─────────────────────────┐
│ [icon] SPEED            │ ← Montserrat, bold
│                         │
│ Create a workable       │ ← Inter, muted, wrapped
│ schedule in minutes,    │
│ not hours.              │
└─────────────────────────┘
```

### Benefits/USP Section (NEW)
**Purpose**: Deeper value proposition, why Fresh Schedules is different

**Content** (suggest 3-4 benefit statements):
- "Automated. Intelligent. Fair." → Describe scheduling smarts
- "Labor compliance built-in" → Regulatory & cost control
- "Real-time team visibility" → Communication & alignment
- "Designed for high-performance teams" → Quality/professional focus

**Styling**:
- Alternating layout: text-left, text-right, text-left (desktop)
- Full-width sections with background color alternation (background → card alternation)
- Large text for benefits (text-2xl or text-3xl)
- Accent color (TS Gold) for key words/phrases
- Proper v-spacing between sections (py-16, py-20)

### CTA Section (NEW)
**Purpose**: Final conversion push

**Content**:
- Heading: "Ready to transform your scheduling?"
- Description: "Join teams using Fresh Schedules to build better schedules, faster."
- CTA: Large primary button "Start Free Trial" or "Get Started"
- Secondary: "See pricing" or "View demo"

**Styling**:
- Centered layout
- Gradient background (same as hero or complementary)
- TS Gold primary button with large padding
- Proper spacing and visual hierarchy

### Visual Polish
**Animations** (subtle, not distracting):
- Hero section: Fade-in-up on page load
- Feature cards: Stagger fade-in on scroll (Intersection Observer)
- Buttons: Scale/glow on hover
- Gradients: Optional animated gradient in hero

**Responsiveness**:
- Desktop: 1200px+
- Tablet: 768px-1199px
- Mobile: <768px
- Touch targets: ≥44px
- Proper padding: px-4 (mobile), px-6 (tablet), px-8+ (desktop)

**Accessibility**:
- Proper heading hierarchy (H1 → H2 → H3)
- Color contrast: WCAG AA minimum (Gold on Black background ✓)
- Semantic HTML: Use <section>, <article>, proper button/link elements
- Focus indicators: Visible outline on keyboard nav
- Alt text for icons (or aria-label if decorative)
- Skip to main content link (optional but recommended)

---

## Mockup Structure

```
┌──────────────────────────────────────┐
│  HERO SECTION (gradient bg)          │
│  ┌────────────────────────────────┐  │
│  │ Fresh Schedules                │  │
│  │ Build schedules fast...        │  │
│  │                                │  │
│  │ [Get Started] [View Demo]      │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  FEATURES (3 cards, gap-6)           │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ 🎯   │ │ 🛡️   │ │ 👥   │         │
│  │ Speed│ │Contro│ │ Team │         │
│  │      │ │      │ │      │         │
│  └──────┘ └──────┘ └──────┘         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  BENEFITS SECTION (alternating)      │
│  [Alt layouts with text/icon]        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  CTA SECTION (gradient bg)           │
│  "Ready to start?"                   │
│  [Large Primary Button]              │
└──────────────────────────────────────┘
```

---

## Success Criteria

**Visual Quality**:
- ✅ Uses brand colors throughout (Gold, Mist, Charcoal, Slate)
- ✅ Montserrat headings with proper sizing and spacing
- ✅ Professional, polished appearance
- ✅ Consistent spacing (using design system)
- ✅ Smooth hover/focus states

**Functionality**:
- ✅ "Get Started" button navigates to /login
- ✅ "View Demo" button navigates to /demo
- ✅ All links/buttons working
- ✅ Form submission (if applicable)

**Responsive**:
- ✅ Mobile (375px): Single column, proper touch targets
- ✅ Tablet (768px): 2-column where appropriate
- ✅ Desktop (1200px+): Full 3-column features, nice spacing

**Accessibility**:
- ✅ WCAG 2.1 AA minimum (AAA preferred)
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ Focus indicators visible
- ✅ Color contrast acceptable

**Performance**:
- ✅ No layout shifts (CLS)
- ✅ Animations smooth (60 FPS)
- ✅ Images optimized (using Next Image)
- ✅ Fast page load

---

## Additional Notes

### Tone
- Professional but approachable
- Emphasize "built for teams that care about quality"
- Modern, sleek, confident
- Not corporate jargon-heavy

### Optional Enhancements
- Hero illustration or icon (keep it simple, SVG preferred)
- Social proof: "Trusted by..." or testimonials
- Pricing table comparison
- FAQ section
- Blog/resources link

### Brand Voice
- "Fresh Schedules: The hardest part is done for you."
- "Automated scheduling for high-performance teams."
- Positioning: Premium (not budget), reliable, modern

---

## Implementation Checklist

**Phase 1: Structure & Layout**
- [ ] Create hero section with proper spacing
- [ ] Implement 3-card features grid
- [ ] Add benefits section with alternating layout
- [ ] Add final CTA section
- [ ] Ensure mobile responsive

**Phase 2: Styling & Brand**
- [ ] Apply TS Gold to primary CTAs
- [ ] Apply TS Charcoal to cards and backgrounds
- [ ] Use Montserrat for all headings
- [ ] Use Inter for body text
- [ ] Apply brand colors to icons (schedule palette)

**Phase 3: Polish & Animations**
- [ ] Add subtle fade-in animations
- [ ] Implement hover states (buttons, cards)
- [ ] Add focus indicators for accessibility
- [ ] Test color contrast (WCAG AA)
- [ ] Verify spacing consistency

**Phase 4: Testing & Optimization**
- [ ] Test on iPhone, Android, iPad
- [ ] Test keyboard navigation
- [ ] Run accessibility audit (WAVE, Lighthouse)
- [ ] Optimize images
- [ ] Final visual review

---

## Questions for UI/UX Agent

1. Should we add an illustration/hero visual element, or keep text-focused?
2. Do you want the features cards to have icons (currently have them), or full illustrations?
3. Should benefit section include images/icons, or pure text?
4. Any animation preferences (fade, slide, scale)?
5. Should we include a testimonial/social proof section?
6. Preferred button styling (filled, outlined, ghost)?
7. Should footer be included in this redesign?

---

**Status**: Ready for UI/UX Agent Implementation  
**Priority**: High - This is the first impression users get  
**Timeline**: 1-2 hours for full implementation + testing
