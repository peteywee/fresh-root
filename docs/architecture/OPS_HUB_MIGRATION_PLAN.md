# Ops Hub Implementation & Migration Plan

**Version**: 1.0  
**Created**: December 22, 2025  
**Status**: Ready for Implementation

---

## Executive Summary

Transform the monolithic ops dashboard into a **multi-section observability hub** with:

- **4 Sections**: Overview, Build Performance, Security Scans, Codebase Analytics
- **Firestore-backed metrics** (replacing JSONL files - fixes concurrent write race condition)
- **Trend charts & visualizations** using Recharts
- **Local sidebar navigation** within ops area
- **Admin-gated access** using existing auth pattern

---

## Part 1: Current State Analysis

### Existing Architecture

```
apps/web/app/(app)/ops/
├── page.tsx              # Server component with auth (requireOpsSuperAccess)
└── OpsClient.tsx         # Monolithic client component (418 lines)

apps/web/app/api/ops/
├── analyze/route.ts      # Codebase analysis endpoint
└── build-performance/route.ts  # Reads from JSONL file or GitHub API
```

### Current Issues

| Issue                       | Impact                                | Priority |
| --------------------------- | ------------------------------------- | -------- |
| **Concurrent JSONL writes** | Race condition in CI, data corruption | P0       |
| **No pagination**           | Large datasets crash browser          | P1       |
| **Missing visualizations**  | Raw tables only, no trends            | P2       |
| **Monolithic component**    | 418 lines, hard to maintain           | P2       |
| **No Semgrep display**      | Security results only in GitHub tab   | P2       |

---

## Part 2: Target Architecture

### Navigation Structure (Nested Routes)

```
/ops                  → Overview (current dashboard, refactored)
/ops/builds           → Build Performance (trend charts + table)
/ops/security         → Security Scans (Semgrep results)
/ops/analytics        → Codebase Analytics (file stats, complexity)
```

### File Structure (Final)

```
apps/web/app/(app)/ops/
├── layout.tsx                    # NEW: Ops layout with sidebar
├── OpsSidebar.tsx                # NEW: Local navigation sidebar
├── page.tsx                      # REFACTOR: Overview section
├── builds/
│   └── page.tsx                  # NEW: Build Performance section
├── security/
│   └── page.tsx                  # NEW: Security Scans section
├── analytics/
│   └── page.tsx                  # NEW: Codebase Analytics section
└── components/
    ├── TrendLineChart.tsx        # NEW: Recharts wrapper
    ├── StatSummaryCard.tsx       # NEW: Stats with delta indicator
    ├── StatusBadge.tsx           # EXTRACT: From OpsClient
    ├── MetricCard.tsx            # EXTRACT: From OpsClient
    └── BaselineComparison.tsx    # NEW: Compare to rolling average

apps/web/app/api/ops/
├── build-performance/
│   ├── route.ts                  # MODIFY: Add Firestore, pagination
│   └── summary/route.ts          # NEW: Aggregated stats
├── security-scans/
│   └── route.ts                  # NEW: Semgrep results from GitHub API
└── codebase-analytics/
    └── route.ts                  # NEW: Analytics snapshot endpoint

packages/types/src/
└── ops-metrics.ts                # NEW: Zod schemas for all metrics
```

---

## Part 3: Firestore Schema Design

### Collection: `_metrics/build-performance/entries/{docId}`

```typescript
// Zod Schema
export const BuildPerformanceEntrySchema = z.object({
  // Identity
  id: z.string(), // Auto-generated doc ID
  timestamp: z.string().datetime(), // ISO 8601
  repository: z.string(), // "peteywee/fresh-root"
  ref: z.string(), // "refs/heads/main"
  sha: z.string().length(40), // Full commit SHA
  runId: z.string(), // GitHub Actions run ID
  runAttempt: z.string(), // Attempt number

  // Metrics
  installSeconds: z.number().int().min(0),
  buildSeconds: z.number().int().min(0),
  sdkSeconds: z.number().int().min(0),
  totalSeconds: z.number().int().min(0),
  cacheHit: z.boolean(), // Changed from string

  // Metadata
  createdAt: z.number().int(), // Unix timestamp for TTL
});

export type BuildPerformanceEntry = z.infer<typeof BuildPerformanceEntrySchema>;
```

### Collection: `_metrics/security-scans/entries/{docId}`

```typescript
export const SecurityScanEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  repository: z.string(),
  ref: z.string(),
  sha: z.string(),
  tool: z.enum(["semgrep", "codeql", "snyk"]),

  findings: z.object({
    critical: z.number().int().min(0),
    high: z.number().int().min(0),
    medium: z.number().int().min(0),
    low: z.number().int().min(0),
    informational: z.number().int().min(0),
  }),

  files: z.array(z.string()), // Files with findings
  rules: z.array(z.string()), // Rule IDs triggered
  createdAt: z.number().int(),
});

export type SecurityScanEntry = z.infer<typeof SecurityScanEntrySchema>;
```

### Collection: `_metrics/codebase-analytics/entries/{docId}`

```typescript
export const CodebaseAnalyticsEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  repository: z.string(),

  stats: z.object({
    totalFiles: z.number().int().min(0),
    totalLines: z.number().int().min(0),
    byExtension: z.record(
      z.object({
        files: z.number().int().min(0),
        lines: z.number().int().min(0),
      }),
    ),
  }),

  metrics: z.object({
    apiRoutes: z.number().int().min(0),
    components: z.number().int().min(0),
    schemas: z.number().int().min(0),
    testFiles: z.number().int().min(0),
  }),

  createdAt: z.number().int(),
});

export type CodebaseAnalyticsEntry = z.infer<typeof CodebaseAnalyticsEntrySchema>;
```

### Firestore Security Rules Addition

```javascript
// Add to firestore.rules
match /_metrics/{metricType}/entries/{entryId} {
  // Read: Admin/org_owner only
  allow read: if isSignedIn()
              && hasAnyRole(request.auth.uid, ['admin', 'org_owner']);

  // Write: Only via API (service account)
  allow write: if false;  // All writes via Admin SDK
}
```

---

## Part 4: Migration Execution Plan

### Phase 1: Foundation (Day 1, ~3 hours)

#### Step 1.1: Install Dependencies

```bash
pnpm add recharts --filter @apps/web
pnpm add -D @types/recharts --filter @apps/web
```

#### Step 1.2: Create Zod Schemas

```bash
# Create file
touch packages/types/src/ops-metrics.ts
```

**Content**: All three schemas defined above, exported from `packages/types/src/index.ts`

#### Step 1.3: Create Reusable Chart Components

| Component             | Purpose            | Props                                     |
| --------------------- | ------------------ | ----------------------------------------- |
| `TrendLineChart.tsx`  | Line chart wrapper | `data`, `xKey`, `yKeys`, `colors`         |
| `StatSummaryCard.tsx` | Stat with delta    | `title`, `value`, `delta`, `trend`        |
| `StatusBadge.tsx`     | Status indicator   | `status: 'ok' \| 'warning' \| 'error'`    |
| `MetricCard.tsx`      | Metric display     | `title`, `value`, `description`, `status` |

#### Step 1.4: Create Ops Layout with Sidebar

```tsx
// apps/web/app/(app)/ops/layout.tsx
import OpsSidebar from "./OpsSidebar";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <OpsSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
```

```tsx
// apps/web/app/(app)/ops/OpsSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Shield, Code2, LayoutDashboard } from "lucide-react";

const routes = [
  { href: "/ops", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/ops/builds", label: "Build Performance", icon: BarChart3 },
  { href: "/ops/security", label: "Security Scans", icon: Shield },
  { href: "/ops/analytics", label: "Codebase Analytics", icon: Code2 },
];

export default function OpsSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-56 border-r border-slate-800 bg-slate-950 p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">Ops Hub</h2>
      <nav className="space-y-1">
        {routes.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded px-3 py-2 text-sm ${
              isActive(href, exact)
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

---

### Phase 2: Firestore Migration (Day 1-2, ~3 hours)

#### Step 2.1: Create POST Endpoint for CI Writes

```typescript
// apps/web/app/api/ops/build-performance/route.ts - ADD POST handler

export const POST = createAdminEndpoint({
  input: BuildPerformanceEntrySchema.omit({ id: true, createdAt: true }),
  handler: async ({ input }) => {
    const db = getFirebaseAdminDb();

    const entry = {
      ...input,
      id: `build-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: Date.now(),
    };

    await db
      .collection("_metrics")
      .doc("build-performance")
      .collection("entries")
      .doc(entry.id)
      .set(entry);

    return NextResponse.json({ ok: true, docId: entry.id }, { status: 201 });
  },
});
```

#### Step 2.2: Modify GET Endpoint for Firestore + Pagination

```typescript
// apps/web/app/api/ops/build-performance/route.ts - MODIFY GET handler

export const GET = createAdminEndpoint({
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
    const since = url.searchParams.get("since"); // ISO date string

    const db = getFirebaseAdminDb();
    let query = db
      .collection("_metrics")
      .doc("build-performance")
      .collection("entries")
      .orderBy("createdAt", "desc")
      .limit(limit + 1); // +1 to check hasMore

    if (since) {
      const sinceTs = new Date(since).getTime();
      query = query.where("createdAt", ">=", sinceTs);
    }

    if (offset > 0) {
      // Use cursor-based pagination for efficiency
      // For now, skip is acceptable for small datasets
    }

    const snapshot = await query.get();
    const entries = snapshot.docs.slice(0, limit).map((doc) => doc.data());
    const hasMore = snapshot.docs.length > limit;

    // Count total (expensive, cache this in production)
    const countSnap = await db
      .collection("_metrics")
      .doc("build-performance")
      .collection("entries")
      .count()
      .get();

    return NextResponse.json({
      ok: true,
      source: "firestore",
      entries,
      pagination: {
        limit,
        offset,
        total: countSnap.data().count,
        hasMore,
      },
    });
  },
});
```

#### Step 2.3: Update CI Workflow

```yaml
# .github/workflows/ci.yml - REPLACE file append with API call

- name: 📊 Persist build metrics to Firestore
  if: always() && github.event_name == 'push' && github.ref == 'refs/heads/main'
  env:
    OPS_API_URL: ${{ secrets.APP_URL }}/api/ops/build-performance
    OPS_API_KEY: ${{ secrets.OPS_API_KEY }}
  run: |
    TOTAL_SECONDS=$(( $(date +%s) - ${{ steps.perf-start.outputs.start_time }} ))
    CACHE_HIT="${{ steps.cache-nextjs.outputs.cache-hit }}"

    # Convert cache-hit string to boolean
    if [ "$CACHE_HIT" = "true" ]; then
      CACHE_BOOL=true
    else
      CACHE_BOOL=false
    fi

    curl -X POST "$OPS_API_URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $OPS_API_KEY" \
      -H "x-org-id: system" \
      --fail-with-body \
      -d '{
        "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",
        "repository": "${{ github.repository }}",
        "ref": "${{ github.ref }}",
        "sha": "${{ github.sha }}",
        "runId": "${{ github.run_id }}",
        "runAttempt": "${{ github.run_attempt }}",
        "installSeconds": '${{ steps.install-deps.outputs.duration || 0 }}',
        "buildSeconds": '${{ steps.build-packages.outputs.duration || 0 }}',
        "sdkSeconds": '${{ steps.build-sdk.outputs.duration || 0 }}',
        "totalSeconds": '$TOTAL_SECONDS',
        "cacheHit": '$CACHE_BOOL'
      }' || echo "⚠️ Metrics upload failed (non-blocking)"
```

#### Step 2.4: Create Migration Script

```javascript
// scripts/migrate-metrics-to-firestore.mjs
#!/usr/bin/env node

import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const JSONL_PATH = "docs/metrics/build-performance.log";
const BATCH_SIZE = 500;

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function migrate() {
  console.log("📦 Reading JSONL file...");
  const content = readFileSync(JSONL_PATH, "utf-8");
  const lines = content.split("\n").filter(Boolean);

  console.log(`📊 Found ${lines.length} entries to migrate`);

  const entries = lines
    .map((line, i) => {
      try {
        const parsed = JSON.parse(line);
        return {
          ...parsed,
          id: `migrated-${i}-${parsed.runId}`,
          cacheHit: parsed.cacheHit === "true",
          createdAt: new Date(parsed.timestamp).getTime(),
        };
      } catch {
        console.warn(`⚠️ Skipping invalid line ${i}`);
        return null;
      }
    })
    .filter(Boolean);

  console.log(`✅ Parsed ${entries.length} valid entries`);

  // Batch write
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = entries.slice(i, i + BATCH_SIZE);

    for (const entry of chunk) {
      const ref = db
        .collection("_metrics")
        .doc("build-performance")
        .collection("entries")
        .doc(entry.id);
      batch.set(ref, entry);
    }

    await batch.commit();
    console.log(`✅ Migrated ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length}`);
  }

  console.log("🎉 Migration complete!");
}

migrate().catch(console.error);
```

---

### Phase 3: Build Performance Page (Day 2, ~2 hours)

#### Step 3.1: Create Summary Stats Endpoint

```typescript
// apps/web/app/api/ops/build-performance/summary/route.ts
export const GET = createAdminEndpoint({
  handler: async () => {
    const db = getFirebaseAdminDb();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const snapshot = await db
      .collection("_metrics")
      .doc("build-performance")
      .collection("entries")
      .where("createdAt", ">=", sevenDaysAgo)
      .orderBy("createdAt", "desc")
      .get();

    const entries = snapshot.docs.map((d) => d.data());

    if (entries.length === 0) {
      return NextResponse.json({ ok: true, stats: null });
    }

    const totalSeconds = entries.map((e) => e.totalSeconds);
    const sorted = [...totalSeconds].sort((a, b) => a - b);

    const stats = {
      totalBuilds: entries.length,
      avgTotalSeconds: Math.round(totalSeconds.reduce((a, b) => a + b, 0) / entries.length),
      medianTotalSeconds: sorted[Math.floor(sorted.length / 2)],
      p95TotalSeconds: sorted[Math.floor(sorted.length * 0.95)],
      cacheHitRate: Math.round((entries.filter((e) => e.cacheHit).length / entries.length) * 100),
      avgInstallSeconds: Math.round(
        entries.reduce((a, e) => a + e.installSeconds, 0) / entries.length,
      ),
      avgBuildSeconds: Math.round(entries.reduce((a, e) => a + e.buildSeconds, 0) / entries.length),
      avgSdkSeconds: Math.round(entries.reduce((a, e) => a + e.sdkSeconds, 0) / entries.length),
    };

    // Baseline comparison (current week vs previous week)
    const thisWeek = entries.filter((e) => e.createdAt >= now - 7 * 24 * 60 * 60 * 1000);
    const thisWeekAvg = thisWeek.reduce((a, e) => a + e.totalSeconds, 0) / (thisWeek.length || 1);

    // Previous 7 days before that
    const prevWeekStart = sevenDaysAgo - 7 * 24 * 60 * 60 * 1000;
    const prevWeekSnap = await db
      .collection("_metrics")
      .doc("build-performance")
      .collection("entries")
      .where("createdAt", ">=", prevWeekStart)
      .where("createdAt", "<", sevenDaysAgo)
      .get();

    const prevWeekEntries = prevWeekSnap.docs.map((d) => d.data());
    const prevWeekAvg =
      prevWeekEntries.reduce((a, e) => a + e.totalSeconds, 0) / (prevWeekEntries.length || 1);

    const delta =
      prevWeekAvg > 0 ? Math.round(((thisWeekAvg - prevWeekAvg) / prevWeekAvg) * 100) : 0;

    return NextResponse.json({
      ok: true,
      period: {
        start: new Date(sevenDaysAgo).toISOString(),
        end: new Date(now).toISOString(),
      },
      stats,
      comparison: {
        baseline7Day: Math.round(prevWeekAvg),
        current7Day: Math.round(thisWeekAvg),
        delta,
        trend: delta < -5 ? "improving" : delta > 5 ? "degrading" : "stable",
      },
    });
  },
});
```

#### Step 3.2: Create Build Performance Page

See implementation in Wave 3 of the implementation order below.

---

### Phase 4: Security Scans Page (Day 3, ~2 hours)

#### Step 4.1: Create Security Scans API Endpoint

Fetches Semgrep results from GitHub Code Scanning API and caches in Firestore.

#### Step 4.2: Create Security Scans Page

Displays severity distribution, findings table, and timeline.

---

### Phase 5: Codebase Analytics Page (Day 3, ~1.5 hours)

Refactor existing `/api/ops/analyze` endpoint output into the new page format.

---

## Part 5: Implementation Order (Parallel Batches)

### Batch 1 (Parallel) - Foundation

- [ ] Install Recharts dependency
- [ ] Create `packages/types/src/ops-metrics.ts` with all Zod schemas
- [ ] Create `OpsSidebar.tsx` navigation component
- [ ] Create `ops/layout.tsx` with sidebar

### Batch 2 (Parallel) - Chart Components

- [ ] Create `TrendLineChart.tsx`
- [ ] Create `StatSummaryCard.tsx`
- [ ] Extract `StatusBadge.tsx` from OpsClient
- [ ] Extract `MetricCard.tsx` from OpsClient

### Batch 3 (Sequential) - Firestore Migration

- [ ] Add POST handler to build-performance route
- [ ] Modify GET handler for Firestore + pagination
- [ ] Update CI workflow to POST metrics
- [ ] Create and run migration script
- [ ] Verify data in Firestore console

### Batch 4 (Parallel) - Pages

- [ ] Create `ops/builds/page.tsx` (Build Performance)
- [ ] Create `ops/security/page.tsx` (Security Scans)
- [ ] Create `ops/analytics/page.tsx` (Codebase Analytics)
- [ ] Refactor `ops/page.tsx` (Overview)

### Batch 5 (Sequential) - API Endpoints

- [ ] Create `build-performance/summary/route.ts`
- [ ] Create `security-scans/route.ts`
- [ ] Create `codebase-analytics/route.ts`

### Batch 6 - Testing & Cleanup

- [ ] Add unit tests for all new endpoints
- [ ] Remove old JSONL persistence code from CI
- [ ] Update Firestore security rules
- [ ] Run full test suite

---

## Part 6: Rollback Plan

If migration fails:

1. **Revert CI workflow** to JSONL file append (keep as commented code)
2. **Restore GET endpoint** to read from GitHub API/file
3. **Delete Firestore data** if corrupted: `db.recursiveDelete(db.collection('_metrics'))`

---

## Part 7: Success Metrics

| Metric                     | Target                     | Measurement                          |
| -------------------------- | -------------------------- | ------------------------------------ |
| Build metrics persisted    | 100% of main branch builds | Check Firestore count vs GitHub runs |
| Page load time             | < 2 seconds                | Lighthouse performance score         |
| Chart render time          | < 500ms                    | React DevTools profiler              |
| No concurrent write errors | 0 in 30 days               | Monitor logs for duplicate keys      |

---

## Appendix: Environment Variables Required

```bash
# For CI → Firestore writes
OPS_API_KEY=<generate-secure-token>

# For Firestore Admin access (already configured)
GOOGLE_APPLICATION_CREDENTIALS_JSON=<service-account-json>
FIREBASE_PROJECT_ID=fresh-schedules
```

Generate OPS_API_KEY:

```bash
openssl rand -base64 32
```

Store in GitHub Secrets as `OPS_API_KEY`.
