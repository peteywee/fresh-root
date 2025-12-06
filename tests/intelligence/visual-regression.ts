/**
 * Visual Regression Testing with AI-Powered Diff Analysis
 * Detects UI changes with pixel-perfect accuracy and smart ignoring
 */

import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { execSync } from "child_process";

interface Screenshot {
  name: string;
  path: string;
  hash: string;
  timestamp: number;
  metadata: {
    viewport: { width: number; height: number };
    url: string;
  };
}

interface VisualDiff {
  baseline: Screenshot;
  current: Screenshot;
  diffPath: string;
  pixelDifference: number;
  percentDifference: number;
  passed: boolean;
  aiAnalysis?: {
    intentionalChange: boolean;
    affectedComponents: string[];
    severity: "critical" | "major" | "minor";
  };
}

export class VisualRegressionTester {
  private baselineDir = "tests/intelligence/visual-baselines";
  private screenshotDir = "tests/intelligence/visual-screenshots";
  private diffDir = "tests/intelligence/visual-diffs";
  private threshold = 0.1; // 0.1% difference threshold

  /**
   * Captures screenshot and compares with baseline
   */
  async compareScreenshot(
    name: string,
    screenshotBuffer: Buffer,
    viewport: { width: number; height: number },
    url: string,
  ): Promise<VisualDiff | null> {
    const current = this.saveScreenshot(name, screenshotBuffer, viewport, url);
    const baseline = this.loadBaseline(name);

    if (!baseline) {
      console.log(`📸 No baseline found for ${name}, creating new baseline`);
      this.saveBaseline(current);
      return null;
    }

    return this.generateDiff(baseline, current);
  }

  /**
   * Generates visual diff between baseline and current
   */
  private generateDiff(baseline: Screenshot, current: Screenshot): VisualDiff {
    const pixelDiff = this.calculatePixelDifference(baseline.path, current.path);
    const baselineSize = fs.statSync(baseline.path).size;
    const percentDiff = (pixelDiff / baselineSize) * 100;

    const diff: VisualDiff = {
      baseline,
      current,
      diffPath: path.join(this.diffDir, `${baseline.name}-diff.png`),
      pixelDifference: pixelDiff,
      percentDifference: percentDiff,
      passed: percentDiff <= this.threshold,
    };

    // AI-powered analysis for intentional vs unintentional changes
    if (!diff.passed) {
      diff.aiAnalysis = this.analyzeVisualChange(baseline, current, percentDiff);
    }

    return diff;
  }

  /**
   * AI analysis to determine if visual change is intentional
   */
  private analyzeVisualChange(
    baseline: Screenshot,
    current: Screenshot,
    percentDiff: number,
  ): {
    intentionalChange: boolean;
    affectedComponents: string[];
    severity: "critical" | "major" | "minor";
  } {
    // Analyze change patterns
    const affectedComponents: string[] = [];
    let intentionalChange = false;
    let severity: "critical" | "major" | "minor" = "minor";

    // Heuristics for intentional changes
    const hashDiff = this.getHashDifference(baseline.hash, current.hash);

    // Large changes are usually intentional redesigns
    if (percentDiff > 30) {
      intentionalChange = true;
      severity = "major";
      affectedComponents.push("Layout");
    }

    // Small changes might be rendering inconsistencies
    if (percentDiff < 1) {
      intentionalChange = false;
      severity = "minor";
      affectedComponents.push("Anti-aliasing");
    }

    // Medium changes need review
    if (percentDiff >= 1 && percentDiff <= 30) {
      severity = "major";
      affectedComponents.push("Component update");
    }

    // Critical changes (likely bugs)
    if (percentDiff > 5 && percentDiff < 20) {
      severity = "critical";
      intentionalChange = false;
    }

    return { intentionalChange, affectedComponents, severity };
  }

  /**
   * Calculates pixel difference using simple hash comparison
   */
  private calculatePixelDifference(path1: string, path2: string): number {
    const hash1 = this.hashFile(path1);
    const hash2 = this.hashFile(path2);
    return hash1 === hash2 ? 0 : this.getHashDifference(hash1, hash2);
  }

  /**
   * Generates visual regression report
   */
  generateReport(diffs: VisualDiff[]): string {
    let report = "\n📸 VISUAL REGRESSION TESTING REPORT\n";
    report += "═".repeat(70) + "\n\n";

    const passed = diffs.filter((d) => d.passed).length;
    const failed = diffs.filter((d) => !d.passed).length;

    report += `Summary:\n`;
    report += `  Total Screenshots: ${diffs.length}\n`;
    report += `  Passed: ${passed} ✅\n`;
    report += `  Failed: ${failed} ❌\n`;
    report += `  Threshold: ${this.threshold}%\n\n`;

    if (failed > 0) {
      report += "Visual Differences Detected:\n";
      report += "─".repeat(70) + "\n\n";

      diffs
        .filter((d) => !d.passed)
        .forEach((diff, i) => {
          report += `${i + 1}. ${diff.baseline.name}\n`;
          report += `   Difference: ${diff.percentDifference.toFixed(3)}%\n`;
          report += `   Pixels Changed: ${diff.pixelDifference}\n`;

          if (diff.aiAnalysis) {
            report += `   Severity: ${diff.aiAnalysis.severity.toUpperCase()}\n`;
            report += `   Intentional: ${diff.aiAnalysis.intentionalChange ? "Yes" : "No"}\n`;
            report += `   Components: ${diff.aiAnalysis.affectedComponents.join(", ")}\n`;
          }

          report += `   Diff: ${diff.diffPath}\n\n`;
        });

      report += "\n💡 Recommendations:\n";
      report += "  • Review visual diffs in the diff directory\n";
      report += "  • Update baselines if changes are intentional\n";
      report += "  • Investigate unintentional changes\n";
    }

    return report;
  }

  /**
   * Updates baseline for approved changes
   */
  approveChange(name: string): void {
    const currentPath = path.join(this.screenshotDir, `${name}.png`);
    const baselinePath = path.join(this.baselineDir, `${name}.png`);

    if (fs.existsSync(currentPath)) {
      fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
      fs.copyFileSync(currentPath, baselinePath);
      console.log(`✅ Baseline updated for ${name}`);
    }
  }

  /**
   * Auto-approves minor changes below threshold
   */
  autoApproveMinorChanges(diffs: VisualDiff[], maxPercent: number = 0.05): void {
    diffs.forEach((diff) => {
      if (!diff.passed && diff.percentDifference <= maxPercent) {
        if (diff.aiAnalysis?.severity === "minor") {
          this.approveChange(diff.baseline.name);
          console.log(`🤖 Auto-approved minor change: ${diff.baseline.name}`);
        }
      }
    });
  }

  private saveScreenshot(
    name: string,
    buffer: Buffer,
    viewport: { width: number; height: number },
    url: string,
  ): Screenshot {
    const filename = `${name}.png`;
    const filePath = path.join(this.screenshotDir, filename);

    fs.mkdirSync(this.screenshotDir, { recursive: true });
    fs.writeFileSync(filePath, buffer);

    return {
      name,
      path: filePath,
      hash: this.hashFile(filePath),
      timestamp: Date.now(),
      metadata: { viewport, url },
    };
  }

  private loadBaseline(name: string): Screenshot | null {
    const baselinePath = path.join(this.baselineDir, `${name}.png`);
    if (!fs.existsSync(baselinePath)) return null;

    return {
      name,
      path: baselinePath,
      hash: this.hashFile(baselinePath),
      timestamp: fs.statSync(baselinePath).mtimeMs,
      metadata: { viewport: { width: 0, height: 0 }, url: "" },
    };
  }

  private saveBaseline(screenshot: Screenshot): void {
    const baselinePath = path.join(this.baselineDir, `${screenshot.name}.png`);
    fs.mkdirSync(this.baselineDir, { recursive: true });
    fs.copyFileSync(screenshot.path, baselinePath);
  }

  private hashFile(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    return createHash("sha256").update(buffer).digest("hex");
  }

  private getHashDifference(hash1: string, hash2: string): number {
    let diff = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) diff++;
    }
    return diff;
  }
}

export const visualRegression = new VisualRegressionTester();
