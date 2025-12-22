// [P1][OPS][SCHEMA] Ops metrics schemas for observability hub
// Tags: P1, OPS, SCHEMA, metrics, build-performance, security

import { z } from "zod";

// ============================================================================
// Build Performance Metrics
// ============================================================================

export const BuildPerformanceEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  repository: z.string(),
  ref: z.string(),
  sha: z.string().length(40),
  runId: z.string(),
  runAttempt: z.string(),
  installSeconds: z.number().int().min(0),
  buildSeconds: z.number().int().min(0),
  sdkSeconds: z.number().int().min(0),
  totalSeconds: z.number().int().min(0),
  cacheHit: z.boolean(),
  createdAt: z.number().int(),
});

export type BuildPerformanceEntry = z.infer<typeof BuildPerformanceEntrySchema>;

export const CreateBuildPerformanceSchema = BuildPerformanceEntrySchema.omit({
  id: true,
  createdAt: true,
});

export type CreateBuildPerformance = z.infer<typeof CreateBuildPerformanceSchema>;

export const BuildPerformanceSummarySchema = z.object({
  period: z.enum(["24h", "7d", "30d"]),
  entries: z.number().int(),
  avgTotalSeconds: z.number(),
  avgInstallSeconds: z.number(),
  avgBuildSeconds: z.number(),
  avgSdkSeconds: z.number(),
  cacheHitRate: z.number().min(0).max(1),
  p50TotalSeconds: z.number(),
  p95TotalSeconds: z.number(),
  trend: z.enum(["improving", "stable", "degrading"]),
  trendPercent: z.number(),
});

export type BuildPerformanceSummary = z.infer<typeof BuildPerformanceSummarySchema>;

// ============================================================================
// Security Scan Metrics
// ============================================================================

export const SecurityFindingsSchema = z.object({
  critical: z.number().int().min(0),
  high: z.number().int().min(0),
  medium: z.number().int().min(0),
  low: z.number().int().min(0),
  informational: z.number().int().min(0),
});

export type SecurityFindings = z.infer<typeof SecurityFindingsSchema>;

export const SecurityScanEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  repository: z.string(),
  ref: z.string(),
  sha: z.string(),
  tool: z.enum(["semgrep", "codeql", "snyk"]),
  findings: SecurityFindingsSchema,
  files: z.array(z.string()),
  rules: z.array(z.string()),
  createdAt: z.number().int(),
});

export type SecurityScanEntry = z.infer<typeof SecurityScanEntrySchema>;

export const CreateSecurityScanSchema = SecurityScanEntrySchema.omit({
  id: true,
  createdAt: true,
});

export type CreateSecurityScan = z.infer<typeof CreateSecurityScanSchema>;

// ============================================================================
// Codebase Analytics Metrics
// ============================================================================

export const CodebaseStatsSchema = z.object({
  totalFiles: z.number().int().min(0),
  totalLines: z.number().int().min(0),
  byExtension: z.record(
    z.string(),
    z.object({ files: z.number().int(), lines: z.number().int() })
  ),
});

export type CodebaseStats = z.infer<typeof CodebaseStatsSchema>;

export const CodebaseHealthSchema = z.object({
  hasTests: z.boolean(),
  hasCI: z.boolean(),
  hasTypeScript: z.boolean(),
  hasLinting: z.boolean(),
  hasSecurity: z.boolean(),
});

export type CodebaseHealth = z.infer<typeof CodebaseHealthSchema>;

export const CodebaseMetricsSchema = z.object({
  apiRoutes: z.number().int().min(0),
  components: z.number().int().min(0),
  schemas: z.number().int().min(0),
  testFiles: z.number().int().min(0),
});

export type CodebaseMetrics = z.infer<typeof CodebaseMetricsSchema>;

export const CodebaseAnalyticsEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  repository: z.string(),
  stats: CodebaseStatsSchema,
  health: CodebaseHealthSchema,
  metrics: CodebaseMetricsSchema,
  createdAt: z.number().int(),
});

export type CodebaseAnalyticsEntry = z.infer<typeof CodebaseAnalyticsEntrySchema>;

// ============================================================================
// API Response Types
// ============================================================================

export const OpsMetricsListResponseSchema = z.object({
  data: z.array(BuildPerformanceEntrySchema),
  meta: z.object({
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
    hasMore: z.boolean(),
  }),
});

export type OpsMetricsListResponse = z.infer<typeof OpsMetricsListResponseSchema>;
