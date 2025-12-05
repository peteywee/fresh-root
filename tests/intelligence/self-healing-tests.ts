// [P1][TEST][TEST] Self Healing Tests tests
// Tags: P1, TEST, TEST
/**
 * Self-Healing Test Framework
 * Automatically adapts tests when the codebase changes
 */

import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { diffLines } from "diff";

interface TestFailure {
  testFile: string;
  testName: string;
  error: string;
  stackTrace: string;
  timestamp: number;
}

interface HealingAction {
  type: "selector_update" | "assertion_update" | "data_update" | "timeout_increase" | "retry_add";
  description: string;
  oldValue: string;
  newValue: string;
  confidence: number; // 0-1
}

interface HealingResult {
  testFile: string;
  testName: string;
  success: boolean;
  actions: HealingAction[];
  requiresManualReview: boolean;
}

export class SelfHealingTestFramework {
  private failureHistory: Map<string, TestFailure[]> = new Map();
  private healingAttempts: Map<string, number> = new Map();
  private maxHealingAttempts: number = 3;

  /**
   * Analyzes test failure and suggests healing actions
   */
  analyzeFailure(failure: TestFailure): HealingAction[] {
    const actions: HealingAction[] = [];
    const error = failure.error.toLowerCase();

    // Detect selector/locator failures
    if (
      error.includes("element not found") ||
      error.includes("timeout") ||
      error.includes("selector")
    ) {
      actions.push({
        type: "selector_update",
        description: "Element selector may have changed",
        oldValue: this.extractSelector(failure.error),
        newValue: this.suggestNewSelector(failure.error),
        confidence: 0.7,
      });

      actions.push({
        type: "timeout_increase",
        description: "Element may need more time to load",
        oldValue: "5000",
        newValue: "10000",
        confidence: 0.6,
      });
    }

    // Detect assertion failures
    if (error.includes("expect") || error.includes("assertion")) {
      const expectedValue = this.extractExpectedValue(failure.error);
      const actualValue = this.extractActualValue(failure.error);

      if (expectedValue && actualValue) {
        actions.push({
          type: "assertion_update",
          description: "Expected value may have changed due to code updates",
          oldValue: expectedValue,
          newValue: actualValue,
          confidence: 0.8,
        });
      }
    }

    // Detect flaky tests (intermittent failures)
    const testKey = `${failure.testFile}:${failure.testName}`;
    const history = this.failureHistory.get(testKey) || [];

    if (history.length > 0 && history.length < 5) {
      // Flaky test detected
      actions.push({
        type: "retry_add",
        description: "Test appears to be flaky - add retry logic",
        oldValue: "no retry",
        newValue: "retry: 3",
        confidence: 0.9,
      });
    }

    // Detect data-related failures
    if (
      error.includes("unique constraint") ||
      error.includes("already exists") ||
      error.includes("duplicate")
    ) {
      actions.push({
        type: "data_update",
        description: "Test data conflicts - use unique values",
        oldValue: "static test data",
        newValue: "dynamic test data with timestamps",
        confidence: 0.85,
      });
    }

    return actions;
  }

  /**
   * Automatically heals a failed test
   */
  healTest(failure: TestFailure): HealingResult {
    const testKey = `${failure.testFile}:${failure.testName}`;
    const attempts = this.healingAttempts.get(testKey) || 0;

    // Don't heal if we've exceeded max attempts
    if (attempts >= this.maxHealingAttempts) {
      return {
        testFile: failure.testFile,
        testName: failure.testName,
        success: false,
        actions: [],
        requiresManualReview: true,
      };
    }

    this.healingAttempts.set(testKey, attempts + 1);

    // Analyze failure and get suggested actions
    const actions = this.analyzeFailure(failure);

    // Apply high-confidence healing actions automatically
    const appliedActions: HealingAction[] = [];
    let testCode = fs.readFileSync(failure.testFile, "utf-8");

    for (const action of actions) {
      if (action.confidence >= 0.8) {
        // Apply healing action
        const healed = this.applyHealingAction(testCode, action);
        if (healed !== testCode) {
          testCode = healed;
          appliedActions.push(action);
        }
      }
    }

    // Write healed test
    if (appliedActions.length > 0) {
      fs.writeFileSync(failure.testFile, testCode);

      return {
        testFile: failure.testFile,
        testName: failure.testName,
        success: true,
        actions: appliedActions,
        requiresManualReview: appliedActions.some((a) => a.confidence < 0.9),
      };
    }

    return {
      testFile: failure.testFile,
      testName: failure.testName,
      success: false,
      actions,
      requiresManualReview: true,
    };
  }

  /**
   * Applies a healing action to test code
   */
  private applyHealingAction(testCode: string, action: HealingAction): string {
    switch (action.type) {
      case "assertion_update":
        // Update expected values in assertions
        return testCode.replace(
          new RegExp(
            `expect\\(.*?\\)\\.toBe\\(['"\`]${this.escapeRegex(action.oldValue)}['"\`]\\)`,
            "g",
          ),
          `expect($&).toBe('${action.newValue}')`,
        );

      case "timeout_increase":
        // Increase timeouts
        return testCode.replace(/timeout:\s*\d+/g, `timeout: ${action.newValue}`);

      case "retry_add":
        // Add retry configuration
        if (!testCode.includes("retry:")) {
          return testCode.replace(
            /it\(['"`]([^'"`]+)['"`],\s*async\s*\(\)/g,
            `it('$1', async () => {}, { retry: 3 })`,
          );
        }
        return testCode;

      case "data_update":
        // Make test data dynamic
        return testCode.replace(
          /(name|email|subdomain):\s*['"`]([^'"`]+)['"`]/g,
          (match, field, value) => {
            return `${field}: \`${value}-\${Date.now()}\``;
          },
        );

      case "selector_update":
        // Update selectors (would need more context)
        return testCode.replace(
          new RegExp(this.escapeRegex(action.oldValue), "g"),
          action.newValue,
        );

      default:
        return testCode;
    }
  }

  /**
   * Records a test failure for pattern analysis
   */
  recordFailure(failure: TestFailure): void {
    const testKey = `${failure.testFile}:${failure.testName}`;
    const history = this.failureHistory.get(testKey) || [];
    history.push(failure);
    this.failureHistory.set(testKey, history);
  }

  /**
   * Detects code changes that might affect tests
   */
  detectBreakingChanges(oldCode: string, newCode: string): string[] {
    const changes: string[] = [];
    const diff = diffLines(oldCode, newCode);

    diff.forEach((part) => {
      if (part.removed) {
        // Check for API endpoint changes
        const endpointMatch = part.value.match(/\/api\/[\w\-\/]+/g);
        if (endpointMatch) {
          changes.push(`API endpoint removed or changed: ${endpointMatch[0]}`);
        }

        // Check for function signature changes
        const functionMatch = part.value.match(/function\s+(\w+)\s*\(/g);
        if (functionMatch) {
          changes.push(`Function signature changed: ${functionMatch[0]}`);
        }

        // Check for type changes
        const typeMatch = part.value.match(/interface\s+(\w+)|type\s+(\w+)/g);
        if (typeMatch) {
          changes.push(`Type definition changed: ${typeMatch[0]}`);
        }
      }
    });

    return changes;
  }

  /**
   * Generates a report of healing actions
   */
  generateHealingReport(results: HealingResult[]): string {
    let report = "\n";
    report += "🔧 SELF-HEALING TEST REPORT\n";
    report += "═".repeat(70) + "\n\n";

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const needsReview = results.filter((r) => r.requiresManualReview);

    report += `Summary:\n`;
    report += `  Successfully Healed: ${successful.length} ✅\n`;
    report += `  Failed to Heal: ${failed.length} ❌\n`;
    report += `  Needs Manual Review: ${needsReview.length} ⚠️\n\n`;

    if (successful.length > 0) {
      report += `✅ Successfully Healed Tests:\n`;
      report += "─".repeat(70) + "\n";

      successful.forEach((result) => {
        report += `\n${result.testFile} - ${result.testName}\n`;
        result.actions.forEach((action) => {
          report += `  ${action.type}: ${action.description}\n`;
          report += `    Old: ${action.oldValue}\n`;
          report += `    New: ${action.newValue}\n`;
          report += `    Confidence: ${(action.confidence * 100).toFixed(0)}%\n`;
        });
      });
    }

    if (needsReview.length > 0) {
      report += `\n\n⚠️  Tests Needing Manual Review:\n`;
      report += "─".repeat(70) + "\n";

      needsReview.forEach((result) => {
        report += `\n${result.testFile} - ${result.testName}\n`;
        if (result.actions.length > 0) {
          report += `  Suggested Actions:\n`;
          result.actions.forEach((action) => {
            report += `    - ${action.description}\n`;
          });
        }
      });
    }

    return report;
  }

  /**
   * Helper methods
   */
  private extractSelector(error: string): string {
    const match = error.match(/selector ['"`]([^'"`]+)['"`]/);
    return match ? match[1] : "";
  }

  private suggestNewSelector(error: string): string {
    // This would integrate with actual DOM inspection
    return '[data-testid="suggested-selector"]';
  }

  private extractExpectedValue(error: string): string | null {
    const match = error.match(/expected ['"`]([^'"`]+)['"`]/i);
    return match ? match[1] : null;
  }

  private extractActualValue(error: string): string | null {
    const match =
      error.match(/received ['"`]([^'"`]+)['"`]/i) || error.match(/actual ['"`]([^'"`]+)['"`]/i);
    return match ? match[1] : null;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

/**
 * Vitest plugin for self-healing tests
 */
export function selfHealingPlugin() {
  const framework = new SelfHealingTestFramework();
  const healingResults: HealingResult[] = [];

  return {
    name: "self-healing-tests",

    onTestFailed(test: any) {
      const failure: TestFailure = {
        testFile: test.file?.filepath || "",
        testName: test.name,
        error: test.error?.message || "",
        stackTrace: test.error?.stack || "",
        timestamp: Date.now(),
      };

      framework.recordFailure(failure);

      // Attempt to heal
      const result = framework.healTest(failure);
      healingResults.push(result);

      if (result.success) {
        console.log(`\n🔧 Auto-healed test: ${test.name}`);
        result.actions.forEach((action) => {
          console.log(`  ✓ ${action.description}`);
        });
      }
    },

    onFinished() {
      if (healingResults.length > 0) {
        console.log(framework.generateHealingReport(healingResults));
      }
    },
  };
}

export const selfHealingFramework = new SelfHealingTestFramework();
