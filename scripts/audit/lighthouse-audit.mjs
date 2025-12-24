#!/usr/bin/env node
// [P0][AUDIT][SCRIPT] Lighthouse Performance Audit
// Tags: P0, AUDIT, SCRIPT, LIGHTHOUSE

/**
 * Lighthouse Performance Audit Script
 * 
 * Runs Lighthouse audits against key pages in production build.
 * Generates detailed reports in JSON and HTML formats.
 * 
 * Usage:
 *   node scripts/audit/lighthouse-audit.mjs [--url=http://localhost:3000]
 * 
 * Requirements:
 *   - Production build must be running (pnpm --filter web start)
 *   - Lighthouse CLI installed (already in devDependencies)
 * 
 * Output:
 *   - lighthouse-reports/*.json - Machine-readable results
 *   - lighthouse-reports/*.html - Human-readable reports
 *   - lighthouse-reports/summary.json - Aggregated scores
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Configuration
const BASE_URL = process.env.LIGHTHOUSE_URL || "http://localhost:3000";
const OUTPUT_DIR = "lighthouse-reports";
const THRESHOLDS = {
  performance: 85,
  accessibility: 85,
  bestPractices: 90,
  seo: 90,
};

// Pages to audit
const PAGES = [
  { name: "homepage", path: "/", description: "Landing page" },
  { name: "login", path: "/login", description: "Authentication page" },
  { name: "onboarding", path: "/onboarding", description: "User onboarding" },
  { name: "dashboard", path: "/dashboard", description: "Main dashboard" },
  { name: "schedules", path: "/schedules/builder", description: "Schedule builder" },
];

/**
 * Run Lighthouse audit for a single page
 */
function runLighthouse(page) {
  const url = `${BASE_URL}${page.path}`;
  const outputPath = join(OUTPUT_DIR, `${page.name}.json`);
  const htmlPath = join(OUTPUT_DIR, `${page.name}.html`);

  console.log(`\n🔍 Auditing: ${page.description} (${url})`);

  try {
    // Run Lighthouse with recommended settings
    const command = [
      "pnpm exec lighthouse",
      url,
      "--output=json",
      "--output=html",
      `--output-path=${join(OUTPUT_DIR, page.name)}`,
      "--chrome-flags='--headless --no-sandbox --disable-gpu'",
      "--quiet",
      "--only-categories=performance,accessibility,best-practices,seo",
    ].join(" ");

    execSync(command, { stdio: "inherit" });

    console.log(`✅ Audit complete: ${page.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Audit failed for ${page.name}:`, error.message);
    return false;
  }
}

/**
 * Parse Lighthouse results and extract scores
 */
function parseResults(page) {
  const jsonPath = join(OUTPUT_DIR, `${page.name}.json`);

  if (!existsSync(jsonPath)) {
    console.warn(`⚠️  No results found for ${page.name}`);
    return null;
  }

  try {
    const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
    const categories = data.categories;

    return {
      page: page.name,
      url: data.finalUrl,
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories["best-practices"].score * 100),
        seo: Math.round(categories.seo.score * 100),
      },
      metrics: {
        fcp: data.audits["first-contentful-paint"].numericValue,
        lcp: data.audits["largest-contentful-paint"].numericValue,
        tbt: data.audits["total-blocking-time"].numericValue,
        cls: data.audits["cumulative-layout-shift"].numericValue,
        si: data.audits["speed-index"].numericValue,
      },
    };
  } catch (error) {
    console.error(`Failed to parse results for ${page.name}:`, error.message);
    return null;
  }
}

/**
 * Generate summary report
 */
function generateSummary(results) {
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    thresholds: THRESHOLDS,
    results,
    overall: {
      passed: 0,
      failed: 0,
      total: results.length,
    },
  };

  // Check each page against thresholds
  results.forEach((result) => {
    if (!result) return;

    const scores = result.scores;
    const meetsThresholds =
      scores.performance >= THRESHOLDS.performance &&
      scores.accessibility >= THRESHOLDS.accessibility &&
      scores.bestPractices >= THRESHOLDS.bestPractices &&
      scores.seo >= THRESHOLDS.seo;

    if (meetsThresholds) {
      summary.overall.passed++;
    } else {
      summary.overall.failed++;
    }
  });

  return summary;
}

/**
 * Print summary to console
 */
function printSummary(summary) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 LIGHTHOUSE AUDIT SUMMARY");
  console.log("=".repeat(80));

  console.log(`\n🌐 Base URL: ${summary.baseUrl}`);
  console.log(`📅 Timestamp: ${summary.timestamp}`);

  console.log("\n📈 Thresholds:");
  console.log(`  Performance:     ≥${summary.thresholds.performance}`);
  console.log(`  Accessibility:   ≥${summary.thresholds.accessibility}`);
  console.log(`  Best Practices:  ≥${summary.thresholds.bestPractices}`);
  console.log(`  SEO:             ≥${summary.thresholds.seo}`);

  console.log("\n📊 Results:");
  summary.results.forEach((result) => {
    if (!result) return;

    const { page, scores } = result;
    const pass = (score, threshold) => (score >= threshold ? "✅" : "❌");

    console.log(`\n  ${page.toUpperCase()}`);
    console.log(
      `    Performance:    ${pass(scores.performance, THRESHOLDS.performance)} ${scores.performance}`
    );
    console.log(
      `    Accessibility:  ${pass(scores.accessibility, THRESHOLDS.accessibility)} ${scores.accessibility}`
    );
    console.log(
      `    Best Practices: ${pass(scores.bestPractices, THRESHOLDS.bestPractices)} ${scores.bestPractices}`
    );
    console.log(`    SEO:            ${pass(scores.seo, THRESHOLDS.seo)} ${scores.seo}`);
  });

  console.log("\n🎯 Overall:");
  console.log(`  Passed: ${summary.overall.passed}/${summary.overall.total}`);
  console.log(`  Failed: ${summary.overall.failed}/${summary.overall.total}`);

  if (summary.overall.failed > 0) {
    console.log("\n❌ Some pages did not meet the thresholds.");
    console.log("   Review the detailed HTML reports in lighthouse-reports/");
  } else {
    console.log("\n✅ All pages passed the thresholds!");
  }

  console.log("\n" + "=".repeat(80));
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Starting Lighthouse audits...");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Output: ${OUTPUT_DIR}/`);

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Run audits for all pages
  const auditResults = [];
  for (const page of PAGES) {
    const success = runLighthouse(page);
    if (success) {
      const result = parseResults(page);
      if (result) {
        auditResults.push(result);
      }
    }
  }

  // Generate and save summary
  const summary = generateSummary(auditResults);
  const summaryPath = join(OUTPUT_DIR, "summary.json");
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Print summary
  printSummary(summary);

  // Exit with appropriate code
  process.exit(summary.overall.failed > 0 ? 1 : 0);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}
