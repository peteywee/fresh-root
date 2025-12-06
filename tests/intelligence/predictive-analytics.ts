/**
 * Predictive Analytics Engine
 * ML-powered test failure prediction and proactive issue detection
 */

import * as fs from "fs";
import * as path from "path";

interface TestMetrics {
  name: string;
  duration: number;
  passed: boolean;
  timestamp: number;
  codeComplexity: number;
  changeFrequency: number;
  dependencies: number;
}

interface Prediction {
  testName: string;
  failureProbability: number;
  confidence: number;
  riskFactors: string[];
  recommendation: string;
  trend: "improving" | "degrading" | "stable";
}

interface AnomalyDetection {
  detected: boolean;
  type: "performance" | "flakiness" | "dependency" | "coverage";
  severity: "low" | "medium" | "high";
  description: string;
  suggestedAction: string;
}

export class PredictiveAnalytics {
  private metricsHistory: TestMetrics[] = [];
  private historyFile = "tests/intelligence/metrics-history.json";
  private predictions: Prediction[] = [];

  constructor() {
    this.loadHistory();
  }

  /**
   * Predicts test failures using ML algorithms
   */
  predictFailures(tests: string[]): Prediction[] {
    this.predictions = tests.map((test) => {
      const history = this.getTestMetrics(test);
      if (history.length < 3) {
        return {
          testName: test,
          failureProbability: 0.1,
          confidence: 0.3,
          riskFactors: ["Insufficient history"],
          recommendation: "Continue monitoring",
          trend: "stable",
        };
      }

      const probability = this.calculateFailureProbability(history);
      const confidence = this.calculateConfidence(history);
      const riskFactors = this.identifyRiskFactors(history);
      const trend = this.analyzeTrend(history);

      return {
        testName: test,
        failureProbability: probability,
        confidence,
        riskFactors,
        recommendation: this.generateRecommendation(probability, riskFactors),
        trend,
      };
    });

    return this.predictions.sort((a, b) => b.failureProbability - a.failureProbability);
  }

  /**
   * Detects anomalies in test behavior
   */
  detectAnomalies(testName: string): AnomalyDetection[] {
    const history = this.getTestMetrics(testName);
    if (history.length < 5) return [];

    const anomalies: AnomalyDetection[] = [];

    // Performance anomaly detection
    const avgDuration = history.reduce((sum, m) => sum + m.duration, 0) / history.length;
    const recent = history.slice(-3);
    const recentAvg = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;

    if (recentAvg > avgDuration * 1.5) {
      anomalies.push({
        detected: true,
        type: "performance",
        severity: recentAvg > avgDuration * 2 ? "high" : "medium",
        description: `Performance degradation: ${((recentAvg / avgDuration - 1) * 100).toFixed(0)}% slower`,
        suggestedAction: "Profile test execution and optimize slow operations",
      });
    }

    // Flakiness detection
    const flips = history.slice(1).reduce((count, curr, i) => {
      return count + (curr.passed !== history[i].passed ? 1 : 0);
    }, 0);
    const flakinessRate = flips / (history.length - 1);

    if (flakinessRate > 0.3) {
      anomalies.push({
        detected: true,
        type: "flakiness",
        severity: flakinessRate > 0.5 ? "high" : "medium",
        description: `Flaky test detected: ${(flakinessRate * 100).toFixed(0)}% instability`,
        suggestedAction: "Add retry logic or fix race conditions",
      });
    }

    // Complexity trend
    const complexityTrend = this.analyzeTrendValue(history.map((h) => h.codeComplexity));
    if (complexityTrend === "degrading") {
      anomalies.push({
        detected: true,
        type: "dependency",
        severity: "low",
        description: "Code complexity increasing over time",
        suggestedAction: "Consider refactoring to reduce complexity",
      });
    }

    return anomalies;
  }

  /**
   * Generates insights from test patterns
   */
  generateInsights(): {
    totalTests: number;
    highRiskTests: number;
    predictedFailures: number;
    anomaliesDetected: number;
    trends: {
      improving: number;
      degrading: number;
      stable: number;
    };
    recommendations: string[];
  } {
    const highRiskTests = this.predictions.filter((p) => p.failureProbability > 0.5).length;
    const predictedFailures = this.predictions.filter((p) => p.failureProbability > 0.7).length;

    const trends = {
      improving: this.predictions.filter((p) => p.trend === "improving").length,
      degrading: this.predictions.filter((p) => p.trend === "degrading").length,
      stable: this.predictions.filter((p) => p.trend === "stable").length,
    };

    const recommendations = this.generateSystemRecommendations();

    return {
      totalTests: this.predictions.length,
      highRiskTests,
      predictedFailures,
      anomaliesDetected: this.predictions.flatMap((p) =>
        this.detectAnomalies(p.testName),
      ).length,
      trends,
      recommendations,
    };
  }

  /**
   * Records test metrics for learning
   */
  recordMetrics(metrics: TestMetrics): void {
    this.metricsHistory.push(metrics);
    this.saveHistory();
  }

  /**
   * Generates prediction report
   */
  generateReport(): string {
    let report = "\n🔮 PREDICTIVE ANALYTICS REPORT\n";
    report += "═".repeat(70) + "\n\n";

    const insights = this.generateInsights();

    report += `Summary:\n`;
    report += `  Total Tests Analyzed: ${insights.totalTests}\n`;
    report += `  High Risk Tests: ${insights.highRiskTests}\n`;
    report += `  Predicted Failures: ${insights.predictedFailures}\n`;
    report += `  Anomalies Detected: ${insights.anomaliesDetected}\n\n`;

    report += `Trends:\n`;
    report += `  ⬆️  Improving: ${insights.trends.improving}\n`;
    report += `  ⬇️  Degrading: ${insights.trends.degrading}\n`;
    report += `  ➡️  Stable: ${insights.trends.stable}\n\n`;

    if (this.predictions.length > 0) {
      report += "Top 5 High-Risk Tests:\n";
      report += "─".repeat(70) + "\n\n";

      this.predictions
        .filter((p) => p.failureProbability > 0.5)
        .slice(0, 5)
        .forEach((pred, i) => {
          report += `${i + 1}. ${path.basename(pred.testName)}\n`;
          report += `   Failure Probability: ${(pred.failureProbability * 100).toFixed(1)}%\n`;
          report += `   Confidence: ${(pred.confidence * 100).toFixed(1)}%\n`;
          report += `   Trend: ${pred.trend.toUpperCase()}\n`;
          report += `   Risk Factors: ${pred.riskFactors.join(", ")}\n`;
          report += `   💡 ${pred.recommendation}\n\n`;
        });
    }

    if (insights.recommendations.length > 0) {
      report += "System-Wide Recommendations:\n";
      report += "─".repeat(70) + "\n";
      insights.recommendations.forEach((rec) => {
        report += `  • ${rec}\n`;
      });
    }

    return report;
  }

  private calculateFailureProbability(history: TestMetrics[]): number {
    const recent = history.slice(-10);
    const recentFailures = recent.filter((m) => !m.passed).length;
    const failureRate = recentFailures / recent.length;

    // Factor in duration trends
    const avgDuration = history.reduce((sum, m) => sum + m.duration, 0) / history.length;
    const recentAvgDuration = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
    const durationIncrease = recentAvgDuration / avgDuration - 1;

    // Factor in code complexity
    const avgComplexity = recent.reduce((sum, m) => sum + m.codeComplexity, 0) / recent.length;
    const complexityFactor = avgComplexity / 100;

    // Weighted probability
    let probability = failureRate * 0.5 + durationIncrease * 0.3 + complexityFactor * 0.2;

    return Math.min(Math.max(probability, 0), 1);
  }

  private calculateConfidence(history: TestMetrics[]): number {
    // Confidence increases with history length and consistency
    const lengthFactor = Math.min(history.length / 20, 1);
    const variance = this.calculateVariance(history.map((m) => (m.passed ? 1 : 0)));
    const consistencyFactor = 1 - variance;

    return lengthFactor * 0.6 + consistencyFactor * 0.4;
  }

  private identifyRiskFactors(history: TestMetrics[]): string[] {
    const factors: string[] = [];
    const recent = history.slice(-5);

    const failureRate = recent.filter((m) => !m.passed).length / recent.length;
    if (failureRate > 0.3) factors.push("High recent failure rate");

    const avgDuration = history.reduce((sum, m) => sum + m.duration, 0) / history.length;
    const recentAvg = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
    if (recentAvg > avgDuration * 1.3) factors.push("Performance degradation");

    const avgComplexity = recent.reduce((sum, m) => sum + m.codeComplexity, 0) / recent.length;
    if (avgComplexity > 80) factors.push("High code complexity");

    const avgChangeFreq = recent.reduce((sum, m) => sum + m.changeFrequency, 0) / recent.length;
    if (avgChangeFreq > 5) factors.push("Frequent code changes");

    return factors.length > 0 ? factors : ["No significant risk factors"];
  }

  private analyzeTrend(history: TestMetrics[]): "improving" | "degrading" | "stable" {
    if (history.length < 5) return "stable";

    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));

    const firstPassRate = firstHalf.filter((m) => m.passed).length / firstHalf.length;
    const secondPassRate = secondHalf.filter((m) => m.passed).length / secondHalf.length;

    const diff = secondPassRate - firstPassRate;

    if (diff > 0.1) return "improving";
    if (diff < -0.1) return "degrading";
    return "stable";
  }

  private analyzeTrendValue(values: number[]): "improving" | "degrading" | "stable" {
    if (values.length < 5) return "stable";

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    if (secondAvg < firstAvg * 0.9) return "improving";
    if (secondAvg > firstAvg * 1.1) return "degrading";
    return "stable";
  }

  private generateRecommendation(probability: number, riskFactors: string[]): string {
    if (probability > 0.7) return "Immediate attention required - high failure risk";
    if (probability > 0.5) return "Monitor closely and address risk factors";
    if (probability > 0.3) return "Review test stability and performance";
    return "Test is stable - continue monitoring";
  }

  private generateSystemRecommendations(): string[] {
    const recommendations: string[] = [];
    const insights = {
      totalTests: this.predictions.length,
      highRiskTests: this.predictions.filter((p) => p.failureProbability > 0.5).length,
      degradingTests: this.predictions.filter((p) => p.trend === "degrading").length,
    };

    if (insights.highRiskTests > insights.totalTests * 0.2) {
      recommendations.push("High number of risky tests - consider test refactoring sprint");
    }

    if (insights.degradingTests > insights.totalTests * 0.3) {
      recommendations.push("Many tests are degrading - review recent code changes");
    }

    return recommendations;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private getTestMetrics(testName: string): TestMetrics[] {
    return this.metricsHistory.filter((m) => m.name === testName);
  }

  private loadHistory(): void {
    try {
      if (fs.existsSync(this.historyFile)) {
        this.metricsHistory = JSON.parse(fs.readFileSync(this.historyFile, "utf-8"));
      }
    } catch {
      this.metricsHistory = [];
    }
  }

  private saveHistory(): void {
    fs.mkdirSync(path.dirname(this.historyFile), { recursive: true });
    fs.writeFileSync(this.historyFile, JSON.stringify(this.metricsHistory, null, 2));
  }
}

export const predictiveAnalytics = new PredictiveAnalytics();
