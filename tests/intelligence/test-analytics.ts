/**
 * Test Analytics Dashboard
 * Real-time test insights, coverage heatmaps, and trend analysis
 */

import * as fs from "fs";
import * as path from "path";

interface TestExecution {
  testFile: string;
  testName: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  timestamp: number;
  retries: number;
}

interface CoverageData {
  file: string;
  lines: { covered: number; total: number };
  functions: { covered: number; total: number };
  branches: { covered: number; total: number };
  statements: { covered: number; total: number };
}

interface TestAnalytics {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    averageDuration: number;
    totalDuration: number;
  };
  trends: {
    passRateTrend: number[]; // Last 10 runs
    durationTrend: number[]; // Last 10 runs
  };
  slowestTests: Array<{ name: string; duration: number }>;
  flakyTests: Array<{ name: string; failureRate: number }>;
  coverageHeatmap: CoverageData[];
  recommendations: string[];
}

export class TestAnalyticsDashboard {
  private executions: TestExecution[] = [];
  private coverageHistory: CoverageData[][] = [];
  private flakinessTracker: Map<string, { runs: number; failures: number }> = new Map();

  /**
   * Records a test execution
   */
  recordExecution(execution: TestExecution): void {
    this.executions.push(execution);

    // Track flakiness
    const key = `${execution.testFile}:${execution.testName}`;
    const flakiness = this.flakinessTracker.get(key) || { runs: 0, failures: 0 };

    flakiness.runs++;
    if (execution.status === "failed") {
      flakiness.failures++;
    }

    this.flakinessTracker.set(key, flakiness);
  }

  /**
   * Records coverage data
   */
  recordCoverage(coverage: CoverageData[]): void {
    this.coverageHistory.push(coverage);

    // Keep only last 10 runs
    if (this.coverageHistory.length > 10) {
      this.coverageHistory.shift();
    }
  }

  /**
   * Generates comprehensive analytics
   */
  generateAnalytics(): TestAnalytics {
    const summary = this.generateSummary();
    const trends = this.analyzeTrends();
    const slowestTests = this.findSlowestTests();
    const flakyTests = this.findFlakyTests();
    const coverageHeatmap = this.generateCoverageHeatmap();
    const recommendations = this.generateRecommendations(summary, flakyTests, slowestTests);

    return {
      summary,
      trends,
      slowestTests,
      flakyTests,
      coverageHeatmap,
      recommendations,
    };
  }

  /**
   * Generates test summary
   */
  private generateSummary() {
    const totalTests = this.executions.length;
    const passed = this.executions.filter((e) => e.status === "passed").length;
    const failed = this.executions.filter((e) => e.status === "failed").length;
    const skipped = this.executions.filter((e) => e.status === "skipped").length;

    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;

    const totalDuration = this.executions.reduce((sum, e) => sum + e.duration, 0);
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    return {
      totalTests,
      passed,
      failed,
      skipped,
      passRate,
      averageDuration,
      totalDuration,
    };
  }

  /**
   * Analyzes trends over time
   */
  private analyzeTrends() {
    // Group executions by runs (assuming chronological order)
    const runsSize = Math.ceil(this.executions.length / 10);
    const runs: TestExecution[][] = [];

    for (let i = 0; i < this.executions.length; i += runsSize) {
      runs.push(this.executions.slice(i, i + runsSize));
    }

    const passRateTrend = runs.map((run) => {
      const passed = run.filter((e) => e.status === "passed").length;
      return (passed / run.length) * 100;
    });

    const durationTrend = runs.map((run) => {
      const total = run.reduce((sum, e) => sum + e.duration, 0);
      return total / run.length;
    });

    return {
      passRateTrend,
      durationTrend,
    };
  }

  /**
   * Finds slowest tests
   */
  private findSlowestTests(): Array<{ name: string; duration: number }> {
    const testDurations = new Map<string, number[]>();

    this.executions.forEach((exec) => {
      const key = `${exec.testFile}:${exec.testName}`;
      const durations = testDurations.get(key) || [];
      durations.push(exec.duration);
      testDurations.set(key, durations);
    });

    const averages = Array.from(testDurations.entries()).map(([name, durations]) => ({
      name,
      duration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    }));

    return averages.sort((a, b) => b.duration - a.duration).slice(0, 10);
  }

  /**
   * Identifies flaky tests
   */
  private findFlakyTests(): Array<{ name: string; failureRate: number }> {
    const flakyTests: Array<{ name: string; failureRate: number }> = [];

    this.flakinessTracker.forEach((stats, name) => {
      // Consider a test flaky if it has > 5 runs and 10-90% failure rate
      if (stats.runs >= 5) {
        const failureRate = (stats.failures / stats.runs) * 100;
        if (failureRate > 10 && failureRate < 90) {
          flakyTests.push({ name, failureRate });
        }
      }
    });

    return flakyTests.sort((a, b) => b.failureRate - a.failureRate);
  }

  /**
   * Generates coverage heatmap
   */
  private generateCoverageHeatmap(): CoverageData[] {
    if (this.coverageHistory.length === 0) return [];

    // Use latest coverage data
    return this.coverageHistory[this.coverageHistory.length - 1];
  }

  /**
   * Generates recommendations
   */
  private generateRecommendations(summary: any, flakyTests: any[], slowestTests: any[]): string[] {
    const recommendations: string[] = [];

    // Pass rate recommendations
    if (summary.passRate < 90) {
      recommendations.push("⚠️  Test pass rate is below 90% - focus on fixing failing tests");
    } else if (summary.passRate >= 95) {
      recommendations.push("✅ Excellent test pass rate! Keep up the good work");
    }

    // Flaky test recommendations
    if (flakyTests.length > 0) {
      recommendations.push(`⚠️  Found ${flakyTests.length} flaky tests - these need investigation`);
      flakyTests.slice(0, 3).forEach((test) => {
        recommendations.push(`   - ${test.name} (${test.failureRate.toFixed(1)}% failure rate)`);
      });
    }

    // Performance recommendations
    if (slowestTests.length > 0 && slowestTests[0].duration > 5000) {
      recommendations.push("🐌 Slowest tests exceed 5 seconds - consider optimization");
      slowestTests.slice(0, 3).forEach((test) => {
        recommendations.push(`   - ${test.name} (${test.duration.toFixed(0)}ms)`);
      });
    }

    // Test suite size recommendations
    if (summary.totalTests < 100) {
      recommendations.push("📈 Test coverage could be improved - aim for 100+ tests");
    } else if (summary.totalTests > 500) {
      recommendations.push("💡 Large test suite - consider parallelization for faster execution");
    }

    return recommendations;
  }

  /**
   * Generates HTML dashboard
   */
  generateHTMLDashboard(analytics: TestAnalytics): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Test Analytics Dashboard</title>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 32px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 16px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.15);
    }
    .metric-label {
      font-size: 13px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 36px;
      font-weight: bold;
    }
    .metric-subtext {
      font-size: 12px;
      opacity: 0.8;
      margin-top: 4px;
    }
    .section {
      margin: 40px 0;
    }
    .section-title {
      font-size: 20px;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .heatmap {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
      margin: 20px 0;
    }
    .heatmap-cell {
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      font-size: 12px;
      color: white;
      font-weight: 600;
    }
    .coverage-high { background: #28a745; }
    .coverage-medium { background: #ffc107; color: #333; }
    .coverage-low { background: #dc3545; }
    .recommendations {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
    }
    .recommendation {
      margin: 10px 0;
      padding: 8px 0;
      font-size: 14px;
    }
    .chart {
      height: 300px;
      margin: 20px 0;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    .pass-rate-${analytics.summary.passRate >= 90 ? "good" : "bad"} {
      background: ${analytics.summary.passRate >= 90 ? "#28a745" : "#dc3545"} !important;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>📊 Test Analytics Dashboard</h1>
    <p class="subtitle">Generated: ${new Date().toLocaleString()}</p>

    <div class="metrics">
      <div class="metric-card pass-rate-${analytics.summary.passRate >= 90 ? "good" : "bad"}">
        <div class="metric-label">Pass Rate</div>
        <div class="metric-value">${analytics.summary.passRate.toFixed(1)}%</div>
        <div class="metric-subtext">${analytics.summary.passed}/${analytics.summary.totalTests} passed</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Total Tests</div>
        <div class="metric-value">${analytics.summary.totalTests}</div>
        <div class="metric-subtext">${analytics.summary.failed} failed, ${analytics.summary.skipped} skipped</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Avg Duration</div>
        <div class="metric-value">${analytics.summary.averageDuration.toFixed(0)}ms</div>
        <div class="metric-subtext">Total: ${(analytics.summary.totalDuration / 1000).toFixed(1)}s</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Flaky Tests</div>
        <div class="metric-value">${analytics.flakyTests.length}</div>
        <div class="metric-subtext">${analytics.flakyTests.length === 0 ? "✨ Perfect!" : "⚠️ Needs attention"}</div>
      </div>
    </div>

    ${
      analytics.slowestTests.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">🐌 Slowest Tests</h2>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${analytics.slowestTests
            .map(
              (test) => `
          <tr>
            <td>${test.name}</td>
            <td>${test.duration.toFixed(0)}ms</td>
          </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    ${
      analytics.flakyTests.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">⚠️ Flaky Tests</h2>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Failure Rate</th>
          </tr>
        </thead>
        <tbody>
          ${analytics.flakyTests
            .map(
              (test) => `
          <tr>
            <td>${test.name}</td>
            <td>${test.failureRate.toFixed(1)}%</td>
          </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    ${
      analytics.coverageHeatmap.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">🔥 Coverage Heatmap</h2>
      <div class="heatmap">
        ${analytics.coverageHeatmap
          .slice(0, 20)
          .map((coverage) => {
            const linesCoverage = (coverage.lines.covered / coverage.lines.total) * 100;
            const className =
              linesCoverage >= 80
                ? "coverage-high"
                : linesCoverage >= 60
                  ? "coverage-medium"
                  : "coverage-low";
            return `
          <div class="heatmap-cell ${className}">
            <div>${path.basename(coverage.file)}</div>
            <div style="font-size: 18px; margin-top: 8px;">${linesCoverage.toFixed(0)}%</div>
          </div>
          `;
          })
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    ${
      analytics.trends.passRateTrend.length > 0
        ? `
    <div class="section">
      <h2 class="section-title">📈 Pass Rate Trend</h2>
      <canvas id="passRateChart"></canvas>
    </div>
    <script>
      new Chart(document.getElementById('passRateChart'), {
        type: 'line',
        data: {
          labels: ${JSON.stringify(analytics.trends.passRateTrend.map((_, i) => `Run ${i + 1}`))},
          datasets: [{
            label: 'Pass Rate (%)',
            data: ${JSON.stringify(analytics.trends.passRateTrend)},
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            }
          }
        }
      });
    </script>
    `
        : ""
    }

    <div class="section">
      <h2 class="section-title">💡 Recommendations</h2>
      <div class="recommendations">
        ${analytics.recommendations
          .map(
            (rec) => `
        <div class="recommendation">${rec}</div>
        `,
          )
          .join("")}
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Saves analytics to file
   */
  saveAnalytics(
    analytics: TestAnalytics,
    outputPath: string = "tests/intelligence/analytics.json",
  ): void {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(analytics, null, 2));
  }

  /**
   * Saves HTML dashboard
   */
  saveDashboard(
    analytics: TestAnalytics,
    outputPath: string = "tests/intelligence/dashboard.html",
  ): void {
    const html = this.generateHTMLDashboard(analytics);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Test analytics dashboard saved to ${outputPath}`);
  }
}

// Export singleton
export const testAnalytics = new TestAnalyticsDashboard();
