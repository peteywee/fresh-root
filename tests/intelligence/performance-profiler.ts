/**
 * Performance Profiling and Benchmarking System
 * Real-time performance analysis with regression detection
 */

import { performance } from "perf_hooks";
import * as fs from "fs";
import * as path from "path";

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  timestamp: number;
  duration: number;
  memoryUsed: number;
  cpuTime: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
}

interface PerformanceBenchmark {
  endpoint: string;
  method: string;
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  samples: number;
  throughput: number; // requests per second
}

interface PerformanceReport {
  timestamp: number;
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    slowestEndpoint: string;
    fastestEndpoint: string;
  };
  benchmarks: PerformanceBenchmark[];
  regressions: PerformanceRegression[];
  recommendations: string[];
}

interface PerformanceRegression {
  endpoint: string;
  metric: string;
  baseline: number;
  current: number;
  degradation: number; // percentage
  severity: "critical" | "warning" | "info";
}

export class PerformanceProfiler {
  private metrics: PerformanceMetrics[] = [];
  private baselines: Map<string, PerformanceBenchmark> = new Map();
  private metricsFile: string;

  constructor(metricsFile: string = "tests/intelligence/performance-metrics.json") {
    this.metricsFile = metricsFile;
    this.loadBaselines();
  }

  /**
   * Wraps an API request with performance tracking
   */
  async profile<T>(
    endpoint: string,
    method: string,
    request: () => Promise<Response>,
  ): Promise<{ response: Response; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const startCpu = process.cpuUsage();

    let response: Response;
    let statusCode: number = 0;
    let responseSize: number = 0;

    try {
      response = await request();
      statusCode = response.status;

      // Clone response to measure size
      const responseText = await response.clone().text();
      responseSize = Buffer.byteLength(responseText, "utf8");

      return {
        response,
        metrics: this.recordMetrics(
          endpoint,
          method,
          startTime,
          startMemory,
          startCpu,
          statusCode,
          0,
          responseSize,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Records performance metrics for a request
   */
  private recordMetrics(
    endpoint: string,
    method: string,
    startTime: number,
    startMemory: number,
    startCpu: NodeJS.CpuUsage,
    statusCode: number,
    requestSize: number,
    responseSize: number,
  ): PerformanceMetrics {
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;
    const endCpu = process.cpuUsage(startCpu);

    const metrics: PerformanceMetrics = {
      endpoint,
      method,
      timestamp: Date.now(),
      duration: endTime - startTime,
      memoryUsed: endMemory - startMemory,
      cpuTime: (endCpu.user + endCpu.system) / 1000, // Convert to ms
      statusCode,
      requestSize,
      responseSize,
    };

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * Calculates percentile from sorted array
   */
  private percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((sortedValues.length * p) / 100) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Calculates standard deviation
   */
  private stdDev(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Generates benchmarks for each endpoint
   */
  generateBenchmarks(): PerformanceBenchmark[] {
    const endpointMetrics = new Map<string, PerformanceMetrics[]>();

    // Group metrics by endpoint
    this.metrics.forEach((metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointMetrics.has(key)) {
        endpointMetrics.set(key, []);
      }
      endpointMetrics.get(key)!.push(metric);
    });

    // Calculate benchmarks for each endpoint
    const benchmarks: PerformanceBenchmark[] = [];

    endpointMetrics.forEach((metrics, key) => {
      const [method, endpoint] = key.split(" ", 2);
      const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);

      const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const stdDeviation = this.stdDev(durations, mean);

      // Calculate throughput (requests per second)
      const timespan = (metrics[metrics.length - 1].timestamp - metrics[0].timestamp) / 1000;
      const throughput = timespan > 0 ? metrics.length / timespan : 0;

      benchmarks.push({
        endpoint,
        method,
        p50: this.percentile(durations, 50),
        p95: this.percentile(durations, 95),
        p99: this.percentile(durations, 99),
        mean,
        min: durations[0],
        max: durations[durations.length - 1],
        stdDev: stdDeviation,
        samples: durations.length,
        throughput,
      });
    });

    return benchmarks;
  }

  /**
   * Detects performance regressions compared to baseline
   */
  detectRegressions(currentBenchmarks: PerformanceBenchmark[]): PerformanceRegression[] {
    const regressions: PerformanceRegression[] = [];

    currentBenchmarks.forEach((current) => {
      const key = `${current.method} ${current.endpoint}`;
      const baseline = this.baselines.get(key);

      if (!baseline) return; // No baseline to compare

      // Check P95 regression
      if (current.p95 > baseline.p95 * 1.2) {
        // 20% degradation
        const degradation = ((current.p95 - baseline.p95) / baseline.p95) * 100;
        regressions.push({
          endpoint: `${current.method} ${current.endpoint}`,
          metric: "P95 latency",
          baseline: baseline.p95,
          current: current.p95,
          degradation,
          severity: degradation > 50 ? "critical" : degradation > 30 ? "warning" : "info",
        });
      }

      // Check throughput regression
      if (current.throughput < baseline.throughput * 0.8) {
        // 20% degradation
        const degradation =
          ((baseline.throughput - current.throughput) / baseline.throughput) * 100;
        regressions.push({
          endpoint: `${current.method} ${current.endpoint}`,
          metric: "Throughput",
          baseline: baseline.throughput,
          current: current.throughput,
          degradation,
          severity: degradation > 40 ? "critical" : degradation > 25 ? "warning" : "info",
        });
      }
    });

    return regressions;
  }

  /**
   * Generates performance optimization recommendations
   */
  generateRecommendations(benchmarks: PerformanceBenchmark[]): string[] {
    const recommendations: string[] = [];

    benchmarks.forEach((benchmark) => {
      const endpoint = `${benchmark.method} ${benchmark.endpoint}`;

      // Slow endpoints (P95 > 1000ms)
      if (benchmark.p95 > 1000) {
        recommendations.push(
          `⚠️  ${endpoint} has slow P95 latency (${benchmark.p95.toFixed(2)}ms). Consider:
   - Adding database indexes
   - Implementing caching
   - Optimizing database queries
   - Using pagination for large datasets`,
        );
      }

      // High variance (stdDev > 30% of mean)
      if (benchmark.stdDev > benchmark.mean * 0.3) {
        recommendations.push(
          `📊 ${endpoint} has high latency variance (stdDev: ${benchmark.stdDev.toFixed(2)}ms). Consider:
   - Investigating intermittent performance issues
   - Adding request queuing
   - Optimizing cold start performance`,
        );
      }

      // Low throughput (< 10 req/s)
      if (benchmark.throughput < 10 && benchmark.samples > 10) {
        recommendations.push(
          `🐌 ${endpoint} has low throughput (${benchmark.throughput.toFixed(2)} req/s). Consider:
   - Connection pooling
   - Async processing for heavy operations
   - Load balancing`,
        );
      }

      // Large response size (> 100KB)
      const avgResponseSize =
        this.metrics
          .filter((m) => m.endpoint === benchmark.endpoint && m.method === benchmark.method)
          .reduce((sum, m) => sum + m.responseSize, 0) / benchmark.samples;

      if (avgResponseSize > 100000) {
        recommendations.push(
          `📦 ${endpoint} has large response size (${(avgResponseSize / 1024).toFixed(2)}KB). Consider:
   - Implementing pagination
   - Using field filtering
   - Response compression
   - GraphQL for selective data fetching`,
        );
      }
    });

    return recommendations;
  }

  /**
   * Generates comprehensive performance report
   */
  generateReport(): PerformanceReport {
    const benchmarks = this.generateBenchmarks();
    const regressions = this.detectRegressions(benchmarks);
    const recommendations = this.generateRecommendations(benchmarks);

    // Find slowest and fastest endpoints
    const sortedByP95 = [...benchmarks].sort((a, b) => b.p95 - a.p95);
    const slowestEndpoint = sortedByP95[0]
      ? `${sortedByP95[0].method} ${sortedByP95[0].endpoint}`
      : "N/A";
    const fastestEndpoint = sortedByP95[sortedByP95.length - 1]
      ? `${sortedByP95[sortedByP95.length - 1].method} ${sortedByP95[sortedByP95.length - 1].endpoint}`
      : "N/A";

    const averageResponseTime =
      benchmarks.reduce((sum, b) => sum + b.mean, 0) / benchmarks.length || 0;

    return {
      timestamp: Date.now(),
      summary: {
        totalRequests: this.metrics.length,
        averageResponseTime,
        slowestEndpoint,
        fastestEndpoint,
      },
      benchmarks,
      regressions,
      recommendations,
    };
  }

  /**
   * Saves current benchmarks as baselines
   */
  saveBaselines(): void {
    const benchmarks = this.generateBenchmarks();
    const baselineData: Record<string, PerformanceBenchmark> = {};

    benchmarks.forEach((benchmark) => {
      const key = `${benchmark.method} ${benchmark.endpoint}`;
      baselineData[key] = benchmark;
    });

    const baselineFile = this.metricsFile.replace(".json", "-baseline.json");
    fs.mkdirSync(path.dirname(baselineFile), { recursive: true });
    fs.writeFileSync(baselineFile, JSON.stringify(baselineData, null, 2));

    console.log(`✅ Saved performance baselines to ${baselineFile}`);
  }

  /**
   * Loads baselines from file
   */
  private loadBaselines(): void {
    const baselineFile = this.metricsFile.replace(".json", "-baseline.json");

    if (fs.existsSync(baselineFile)) {
      const data = JSON.parse(fs.readFileSync(baselineFile, "utf-8"));
      Object.entries(data).forEach(([key, benchmark]) => {
        this.baselines.set(key, benchmark as PerformanceBenchmark);
      });
      console.log(`📊 Loaded ${this.baselines.size} performance baselines`);
    }
  }

  /**
   * Saves metrics to file
   */
  saveMetrics(): void {
    fs.mkdirSync(path.dirname(this.metricsFile), { recursive: true });
    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  /**
   * Generates a beautiful HTML report
   */
  generateHTMLReport(report: PerformanceReport): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Performance Report - ${new Date(report.timestamp).toISOString()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
    .metric-label { font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
    .metric-value { font-size: 28px; font-weight: bold; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #dee2e6; }
    td { padding: 12px; border-bottom: 1px solid #dee2e6; }
    tr:hover { background: #f8f9fa; }
    .critical { color: #dc3545; font-weight: bold; }
    .warning { color: #ffc107; font-weight: bold; }
    .info { color: #17a2b8; }
    .recommendation { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 12px; margin: 10px 0; border-radius: 4px; }
    .chart { height: 300px; margin: 20px 0; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>🚀 Performance Report</h1>
    <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>

    <div class="summary">
      <div class="metric">
        <div class="metric-label">Total Requests</div>
        <div class="metric-value">${report.summary.totalRequests}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Avg Response Time</div>
        <div class="metric-value">${report.summary.averageResponseTime.toFixed(2)}ms</div>
      </div>
      <div class="metric">
        <div class="metric-label">Slowest Endpoint</div>
        <div class="metric-value" style="font-size: 14px;">${report.summary.slowestEndpoint}</div>
      </div>
    </div>

    ${
      report.regressions.length > 0
        ? `
    <h2>⚠️ Performance Regressions</h2>
    <table>
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>Metric</th>
          <th>Baseline</th>
          <th>Current</th>
          <th>Degradation</th>
          <th>Severity</th>
        </tr>
      </thead>
      <tbody>
        ${report.regressions
          .map(
            (r) => `
        <tr>
          <td>${r.endpoint}</td>
          <td>${r.metric}</td>
          <td>${r.baseline.toFixed(2)}</td>
          <td>${r.current.toFixed(2)}</td>
          <td>${r.degradation.toFixed(1)}%</td>
          <td class="${r.severity}">${r.severity.toUpperCase()}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    `
        : ""
    }

    <h2>📊 Benchmarks</h2>
    <table>
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>P50</th>
          <th>P95</th>
          <th>P99</th>
          <th>Mean</th>
          <th>Throughput</th>
          <th>Samples</th>
        </tr>
      </thead>
      <tbody>
        ${report.benchmarks
          .map(
            (b) => `
        <tr>
          <td>${b.method} ${b.endpoint}</td>
          <td>${b.p50.toFixed(2)}ms</td>
          <td>${b.p95.toFixed(2)}ms</td>
          <td>${b.p99.toFixed(2)}ms</td>
          <td>${b.mean.toFixed(2)}ms</td>
          <td>${b.throughput.toFixed(2)} req/s</td>
          <td>${b.samples}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    ${
      report.recommendations.length > 0
        ? `
    <h2>💡 Recommendations</h2>
    ${report.recommendations
      .map(
        (r) => `
    <div class="recommendation">${r}</div>
    `,
      )
      .join("")}
    `
        : ""
    }
  </div>
</body>
</html>`;
  }
}

// Export singleton instance
export const performanceProfiler = new PerformanceProfiler();
