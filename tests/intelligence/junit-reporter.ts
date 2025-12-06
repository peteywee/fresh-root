/**
 * JUnit XML Reporter for CI/CD dashboards
 * Compact, standards-compliant
 */

import * as fs from "fs";
import * as path from "path";

interface TestCase {
  name: string;
  classname: string;
  time: number;
  status: "passed" | "failed" | "skipped";
  error?: {
    message: string;
    type: string;
    stacktrace?: string;
  };
}

interface TestSuite {
  name: string;
  tests: number;
  failures: number;
  errors: number;
  skipped: number;
  time: number;
  timestamp: string;
  testcases: TestCase[];
}

export class JUnitReporter {
  private suites: TestSuite[] = [];

  /**
   * Add test suite
   */
  addSuite(suite: TestSuite): void {
    this.suites.push(suite);
  }

  /**
   * Generate JUnit XML
   */
  generate(): string {
    const totalTests = this.suites.reduce((sum, s) => sum + s.tests, 0);
    const totalFailures = this.suites.reduce((sum, s) => sum + s.failures, 0);
    const totalErrors = this.suites.reduce((sum, s) => sum + s.errors, 0);
    const totalSkipped = this.suites.reduce((sum, s) => sum + s.skipped, 0);
    const totalTime = this.suites.reduce((sum, s) => sum + s.time, 0);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites tests="${totalTests}" failures="${totalFailures}" errors="${totalErrors}" skipped="${totalSkipped}" time="${totalTime.toFixed(3)}">\n`;

    for (const suite of this.suites) {
      xml += `  <testsuite name="${this.escape(suite.name)}" tests="${suite.tests}" failures="${suite.failures}" errors="${suite.errors}" skipped="${suite.skipped}" time="${suite.time.toFixed(3)}" timestamp="${suite.timestamp}">\n`;

      for (const testcase of suite.testcases) {
        xml += `    <testcase name="${this.escape(testcase.name)}" classname="${this.escape(testcase.classname)}" time="${testcase.time.toFixed(3)}"`;

        if (testcase.status === "passed") {
          xml += " />\n";
        } else {
          xml += ">\n";

          if (testcase.status === "failed" && testcase.error) {
            xml += `      <failure message="${this.escape(testcase.error.message)}" type="${this.escape(testcase.error.type)}">`;
            if (testcase.error.stacktrace) {
              xml += this.escape(testcase.error.stacktrace);
            }
            xml += "</failure>\n";
          } else if (testcase.status === "skipped") {
            xml += "      <skipped />\n";
          }

          xml += "    </testcase>\n";
        }
      }

      xml += "  </testsuite>\n";
    }

    xml += "</testsuites>\n";
    return xml;
  }

  /**
   * Save to file
   */
  save(outputPath: string = "tests/intelligence/junit.xml"): void {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, this.generate());
  }

  /**
   * Create from orchestrator result
   */
  static fromOrchestratorResult(result: any): JUnitReporter {
    const reporter = new JUnitReporter();

    const testcases: TestCase[] = result.stages.map((stage: any) => ({
      name: stage.name,
      classname: "TestIntelligence",
      time: stage.duration / 1000,
      status: stage.status === "success" ? "passed" : stage.status === "skipped" ? "skipped" : "failed",
      error:
        stage.status === "failed"
          ? {
              message: stage.details?.error || "Unknown error",
              type: "Error",
            }
          : undefined,
    }));

    reporter.addSuite({
      name: "Test Intelligence Suite",
      tests: testcases.length,
      failures: testcases.filter((t) => t.status === "failed").length,
      errors: 0,
      skipped: testcases.filter((t) => t.status === "skipped").length,
      time: result.duration / 1000,
      timestamp: new Date(result.timestamp).toISOString(),
      testcases,
    });

    return reporter;
  }

  private escape(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
