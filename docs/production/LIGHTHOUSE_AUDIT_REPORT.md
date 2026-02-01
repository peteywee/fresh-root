---

title: "Lighthouse Audit Report"
description: "Lighthouse performance, SEO, and accessibility audit results"
keywords:
  - lighthouse
  - audit
  - performance
  - seo
  - accessibility
category: "report"
status: "active"
audience:
  - developers
  - operators
  - stakeholders
related-docs:
  - ../archived/deprecated/production/FINAL\_SIGN\_OFF.md
  - ../guides/PERFORMANCE\_PROFILING.md
createdAt: "2026-01-31T07:42:51Z"
lastUpdated: "2026-01-31T07:42:51Z"

---

# Lighthouse Audit Report - Fresh Schedules v1.5.0

**Date**: December 24, 2024\
**Version**: 1.5.0\
**Environment**: Production Build\
**Auditor**: GitHub Copilot Agent

## Executive Summary

This document describes the Lighthouse audit process for Fresh Schedules v1.5.0 and documents
expected performance characteristics based on the application architecture.

## Build Characteristics

### Application Architecture

- **Framework**: Next.js 16.1.0 (App Router)
- **Rendering**: Server-side rendering (SSR) with dynamic routes
- **Bundle Size**: 711MB production build
- **Routes**: 66 total (42 static, 24 dynamic)
- **Optimization**:
  - Image optimization enabled (AVIF, WebP)
  - Modular imports for lucide-react, date-fns
  - Console logs removed in production
  - Compression enabled

### Expected Performance Profile

#### ✅ Strengths

1. **Server Components**: Most UI is server-rendered, reducing client-side JS
2. **Static Routes**: 42 static routes benefit from pre-rendering
3. **Image Optimization**: Next.js Image component with modern formats
4. **Security Headers**: Comprehensive CSP and security headers configured
5. **Font Strategy**: System font fallback (no external font loading)

#### ⚠️ Potential Challenges

1. **Dynamic Routes**: 24 routes use cookies/session (can't be statically rendered)
2. **Firebase**: Client-side Firebase SDK adds bundle size
3. **Recharts**: Heavy charting library may impact initial load
4. **OpenTelemetry**: Observability instrumentation adds overhead

## Lighthouse Audit Script

### Installation

```bash
# Already included in devDependencies
pnpm install
```

### Running Audits

#### Local Testing

```bash
# 1. Build production version
pnpm --filter web build

# 2. Start production server
pnpm --filter web start

# 3. Run Lighthouse audits (in separate terminal)
node scripts/audit/lighthouse-audit.mjs
```

#### Custom URL

```bash
LIGHTHOUSE_URL=https://staging.fresh-schedules.com node scripts/audit/lighthouse-audit.mjs
```

### Pages Audited

| Page       | Path                 | Description      | Priority |
| ---------- | -------------------- | ---------------- | -------- |
| Homepage   | `/`                  | Landing page     | High     |
| Login      | `/login`             | Authentication   | High     |
| Onboarding | `/onboarding`        | User onboarding  | High     |
| Dashboard  | `/dashboard`         | Main dashboard   | Critical |
| Schedules  | `/schedules/builder` | Schedule builder | Critical |

### Target Scores

| Category       | Threshold | Rationale                                |
| -------------- | --------- | ---------------------------------------- |
| Performance    | ≥85       | Good user experience, acceptable for SPA |
| Accessibility  | ≥85       | WCAG 2.1 AA compliance                   |
| Best Practices | ≥90       | Production-ready code quality            |
| SEO            | ≥90       | Good discoverability                     |

## Expected Results Analysis

### Performance (Target: ≥85)

**Likely Score**: 75-90

**Key Metrics**:

- **First Contentful Paint (FCP)**: ~1.5-2.5s (Target: <1.8s)
- **Largest Contentful Paint (LCP)**: ~2.5-4.0s (Target: <2.5s)
- **Total Blocking Time (TBT)**: ~200-500ms (Target: <200ms)
- **Cumulative Layout Shift (CLS)**: <0.1 (Target: <0.1)
- **Speed Index**: ~2.0-3.5s (Target: <3.4s)

**Optimization Opportunities**:

1. **Code Splitting**: Further split large dependencies (Recharts, Firebase)
2. **Tree Shaking**: Ensure unused code is eliminated
3. **Dynamic Imports**: Lazy load non-critical components
4. **CDN**: Serve static assets from CDN in production

### Accessibility (Target: ≥85)

**Likely Score**: 85-95

**Strong Points**:

- Semantic HTML structure
- Next.js Link components for navigation
- Image alt text support

**Common Issues to Check**:

1. Form labels (ensure all inputs have labels)
2. Color contrast (verify text meets WCAG AA standards)
3. Keyboard navigation (test all interactive elements)
4. ARIA attributes (check dynamic content)

### Best Practices (Target: ≥90)

**Likely Score**: 85-95

**Strong Points**:

- HTTPS enforced
- Security headers configured
- Console logs removed in production
- No deprecated APIs

**Potential Issues**:

1. Third-party scripts (Firebase, analytics)
2. Mixed content (ensure all resources are HTTPS)
3. Vulnerable dependencies (run `pnpm audit`)

### SEO (Target: ≥90)

**Likely Score**: 80-95

**Strong Points**:

- Server-side rendering (SSR)
- Semantic HTML
- Meta tags support

**Improvements Needed**:

1. Add meta descriptions to all pages
2. Add structured data (JSON-LD)
3. Improve page titles
4. Add sitemap.xml
5. Add robots.txt

## Manual Testing Required

Since the CI environment doesn't have network access, the following must be tested manually:

### 1. Start Production Server

```bash
pnpm --filter web build
pnpm --filter web start
```

### 2. Run Lighthouse Audit

```bash
node scripts/audit/lighthouse-audit.mjs
```

### 3. Review Reports

- Open `lighthouse-reports/*.html` in browser
- Check `lighthouse-reports/summary.json` for scores
- Identify and fix issues below threshold

### 4. Accessibility Testing

```bash
# Install axe-core DevTools extension
# Or use CLI tool:
npm install -g @axe-core/cli
axe http://localhost:3000 --tags wcag2a,wcag2aa
```

## Acceptance Criteria

### Required for Production

- \[ ] All pages meet Performance ≥85
- \[ ] All pages meet Accessibility ≥85
- \[ ] All pages meet Best Practices ≥90
- \[ ] All pages meet SEO ≥90
- \[ ] No critical accessibility violations
- \[ ] No serious accessibility violations

### Nice to Have

- \[ ] Performance ≥90 on all pages
- \[ ] Accessibility ≥95 on all pages
- \[ ] All minor accessibility issues documented

## Post-Deployment Monitoring

### Tools to Enable

1. **Google Lighthouse CI**: Automated audits on every deploy
2. **Web Vitals**: Real user monitoring (RUM)
3. **Sentry Performance**: Track performance in production
4. **Firebase Performance**: Monitor app performance

### Metrics to Track

- Core Web Vitals (FCP, LCP, CLS)
- Time to Interactive (TTI)
- First Input Delay (FID)
- Page load times by route

## Next Steps

1. ✅ Production build completed
2. ⏳ Manual Lighthouse audit required (when environment has network access)
3. ⏳ Fix performance issues if scores below threshold
4. ⏳ Run accessibility audit
5. ⏳ Deploy to staging for real-world testing

## References

- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Note**: This report documents the expected audit process. Actual Lighthouse scores must be
obtained in an environment with:

- Production build running on localhost:3000
- Network access for Lighthouse CLI
- Chrome browser available

Once environment constraints are resolved, run the audit script and update this report with actual
scores.
