/**
 * AI Test Prioritization Engine
 * ML-powered test ordering based on failure history, code changes, and risk analysis
 */

import * as fs from "fs";
import * as path from "path";
import { getGitDiff } from "./platform";

interface TestExecution {
  name: string;
  duration: number;
  passed: boolean;
  timestamp: number;
  fileChanged: string[];
}

interface TestPriority {
  name: string;
  priority: number;
  reasoning: string[];
  estimatedDuration: number;
  failureProbability: number;
}

export class AITestPrioritizer {
  private history: TestExecution[] = [];
  private historyFile = "tests/intelligence/test-execution-history.json";

  constructor() {
    this.loadHistory();
  }

  /**
   * Prioritizes tests using ML-based scoring
   */
  prioritizeTests(testFiles: string[], changedFiles: string[] = []): TestPriority[] {
    const priorities: TestPriority[] = testFiles.map((test) => {
      const score = this.calculatePriorityScore(test, changedFiles);
      const history = this.getTestHistory(test);
      const avgDuration = history.reduce((sum, h) => sum + h.duration, 0) / (history.length || 1);
      const failureRate = history.filter((h) => !h.passed).length / (history.length || 1);

      const reasoning: string[] = [];
      if (score.recentFailure) reasoning.push("Recently failed");
      if (score.affectedByChanges) reasoning.push("Affected by code changes");
      if (score.criticalPath) reasoning.push("Critical path test");
      if (score.flakyScore > 0.3) reasoning.push("Flaky test detected");

      return {
        name: test,
        priority: score.total,
        reasoning,
        estimatedDuration: Math.round(avgDuration),
        failureProbability: failureRate,
      };
    });

    // Sort by priority (highest first)
    return priorities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculates multi-factor priority score
   */
  private calculatePriorityScore(
    test: string,
    changedFiles: string[],
  ): {
    total: number;
    recentFailure: boolean;
    affectedByChanges: boolean;
    criticalPath: boolean;
    flakyScore: number;
  } {
    let score = 50; // Base score
    let recentFailure = false;
    let affectedByChanges = false;
    let criticalPath = false;
    let flakyScore = 0;

    const history = this.getTestHistory(test);

    // Factor 1: Recent failures (highest priority)
    const recentRuns = history.slice(-5);
    const recentFailures = recentRuns.filter((h) => !h.passed).length;
    if (recentFailures > 0) {
      score += recentFailures * 20;
      recentFailure = true;
    }

    // Factor 2: Affected by recent code changes
    if (changedFiles.length > 0) {
      const testPath = test.replace(/\.test\.ts$/, "");
      const isAffected = changedFiles.some(
        (file) =>
          file.includes(path.dirname(testPath)) ||
          test.includes(path.basename(file).replace(/\.ts$/, "")),
      );
      if (isAffected) {
        score += 30;
        affectedByChanges = true;
      }
    }

    // Factor 3: Critical path tests (auth, payment, core features)
    const criticalPaths = ["/auth/", "/payment/", "/api/", "/core/"];
    if (criticalPaths.some((cp) => test.includes(cp))) {
      score += 15;
      criticalPath = true;
    }

    // Factor 4: Flakiness detection
    if (history.length >= 5) {
      const flips = history.slice(1).reduce((count, curr, i) => {
        return count + (curr.passed !== history[i].passed ? 1 : 0);
      }, 0);
      flakyScore = flips / (history.length - 1);
      score += Math.round(flakyScore * 25); // Prioritize flaky tests
    }

    // Factor 5: Time since last run
    if (history.length > 0) {
      const lastRun = Math.max(...history.map((h) => h.timestamp));
      const daysSinceRun = (Date.now() - lastRun) / (1000 * 60 * 60 * 24);
      if (daysSinceRun > 7) score += 10; // Run stale tests
    }

    return { total: score, recentFailure, affectedByChanges, criticalPath, flakyScore };
  }

  /**
   * Records test execution for learning
   */
  recordExecution(execution: TestExecution): void {
    this.history.push(execution);
    this.saveHistory();
  }

  /**
   * Gets changed files from git (async, cross-platform)
   */
  async getChangedFiles(): Promise<string[]> {
    return await getGitDiff();
  }

  /**
   * Gets changed files from git (sync version for backwards compat)
   */
  getChangedFilesSync(): string[] {
    // Fallback for sync callers - returns empty array
    // Users should migrate to async getChangedFiles()
    return [];
  }

  /**
   * Generates execution plan with estimated time
   */
  generateExecutionPlan(priorities: TestPriority[]): {
    plan: TestPriority[];
    estimatedDuration: number;
    highRiskTests: number;
  } {
    const highRiskTests = priorities.filter((p) => p.failureProbability > 0.3).length;
    const estimatedDuration = priorities.reduce((sum, p) => sum + p.estimatedDuration, 0);

    return {
      plan: priorities,
      estimatedDuration,
      highRiskTests,
    };
  }

  /**
   * Generates prioritization report
   */
  generateReport(priorities: TestPriority[]): string {
    let report = "\n🧠 AI TEST PRIORITIZATION REPORT\n";
    report += "═".repeat(70) + "\n\n";

    report += `Total Tests: ${priorities.length}\n`;
    report += `Estimated Duration: ${(priorities.reduce((s, p) => s + p.estimatedDuration, 0) / 1000).toFixed(1)}s\n`;
    report += `High Risk Tests: ${priorities.filter((p) => p.failureProbability > 0.3).length}\n\n`;

    report += "Top 10 Priority Tests:\n";
    report += "─".repeat(70) + "\n\n";

    priorities.slice(0, 10).forEach((p, i) => {
      report += `${i + 1}. ${path.basename(p.name)}\n`;
      report += `   Priority Score: ${p.priority.toFixed(0)}\n`;
      report += `   Failure Probability: ${(p.failureProbability * 100).toFixed(1)}%\n`;
      report += `   Estimated Duration: ${p.estimatedDuration}ms\n`;
      if (p.reasoning.length > 0) {
        report += `   Reasoning: ${p.reasoning.join(", ")}\n`;
      }
      report += "\n";
    });

    return report;
  }

  private getTestHistory(test: string): TestExecution[] {
    return this.history.filter((h) => h.name === test);
  }

  private loadHistory(): void {
    try {
      if (fs.existsSync(this.historyFile)) {
        this.history = JSON.parse(fs.readFileSync(this.historyFile, "utf-8"));
      }
    } catch {
      this.history = [];
    }
  }

  private saveHistory(): void {
    fs.mkdirSync(path.dirname(this.historyFile), { recursive: true });
    fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
  }
}

export const aiPrioritizer = new AITestPrioritizer();
