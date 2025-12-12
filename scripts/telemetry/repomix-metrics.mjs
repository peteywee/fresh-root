#!/usr/bin/env node
// [P1][DOCS][CODE] Track Repomix metrics over time
// Tags: P1, DOCS, CODE, TELEMETRY, AUTOMATION

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const metricsDir = path.resolve(__dirname, "../docs/metrics");
const metricsLog = path.resolve(metricsDir, "repomix-metrics.log");

// Ensure directory exists
if (!fs.existsSync(metricsDir)) {
  fs.mkdirSync(metricsDir, { recursive: true });
}

// Read JSON report if available
const reportPath = path.resolve(__dirname, "../docs/architecture/repomix-ci.json");

if (!fs.existsSync(reportPath)) {
  console.warn("⚠️ No Repomix JSON report found. Skipping metrics collection.");
  process.exit(0);
}

try {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  const metrics = {
    timestamp: new Date().toISOString(),
    fileCount: report.files?.length || 0,
    totalLines: (report.files || []).reduce(
      (a, f) => a + (f.content?.split("\n").length || 0),
      0
    ),
    codebaseSize: report.statistics?.codebaseSize || 0,
    largestFiles: (report.files || [])
      .sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))
      .slice(0, 5)
      .map((f) => ({
        path: f.path,
        lines: f.content?.split("\n").length || 0,
      })),
  };

  // Append to metrics log
  fs.appendFileSync(metricsLog, JSON.stringify(metrics) + "\n");

  console.log("✅ Metrics recorded:");
  console.log(`   Files: ${metrics.fileCount}`);
  console.log(`   Lines: ${metrics.totalLines}`);
  console.log(`   Codebase Size: ${metrics.codebaseSize} bytes`);
} catch (error) {
  console.error("❌ Failed to record metrics:", error.message);
  process.exit(1);
}
