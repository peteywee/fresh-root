/**
 * Smart Parallelization Optimizer
 * Optimizes test execution with intelligent batching and resource allocation
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface TestInfo {
  name: string;
  duration: number;
  dependencies: string[];
  resourceUsage: {
    cpu: number;
    memory: number;
    io: number;
  };
}

interface Batch {
  tests: TestInfo[];
  estimatedDuration: number;
  resourceRequirements: {
    cpu: number;
    memory: number;
    io: number;
  };
}

interface OptimizationResult {
  batches: Batch[];
  totalDuration: number;
  parallelDuration: number;
  speedup: number;
  efficiency: number;
}

export class ParallelizationOptimizer {
  private testInfo: Map<string, TestInfo> = new Map();
  private maxWorkers = 4;
  private resourceLimits = {
    cpu: 80, // % per worker
    memory: 2048, // MB per worker
    io: 50, // % per worker
  };

  /**
   * Optimizes test execution order for maximum parallelism
   */
  optimize(tests: string[]): OptimizationResult {
    // Load test info
    tests.forEach((test) => {
      if (!this.testInfo.has(test)) {
        this.testInfo.set(test, this.analyzeTest(test));
      }
    });

    // Build dependency graph
    const graph = this.buildDependencyGraph(tests);

    // Topological sort for dependency-respecting order
    const sorted = this.topologicalSort(graph);

    // Create optimal batches
    const batches = this.createOptimalBatches(sorted);

    // Calculate metrics
    const totalDuration = Array.from(this.testInfo.values()).reduce((sum, t) => sum + t.duration, 0);
    const parallelDuration = batches.reduce((max, b) => Math.max(max, b.estimatedDuration), 0);
    const speedup = totalDuration / parallelDuration;
    const efficiency = speedup / this.maxWorkers;

    return {
      batches,
      totalDuration,
      parallelDuration,
      speedup,
      efficiency,
    };
  }

  /**
   * Creates balanced batches with resource constraints
   */
  private createOptimalBatches(sortedTests: string[]): Batch[] {
    const batches: Batch[] = [];
    const testInfoArray = sortedTests.map((t) => this.testInfo.get(t)!);

    // Greedy bin packing with resource constraints
    for (const test of testInfoArray) {
      let placed = false;

      // Try to add to existing batch
      for (const batch of batches) {
        if (this.canAddToBatch(batch, test)) {
          batch.tests.push(test);
          batch.estimatedDuration = Math.max(batch.estimatedDuration, test.duration);
          batch.resourceRequirements.cpu += test.resourceUsage.cpu;
          batch.resourceRequirements.memory += test.resourceUsage.memory;
          batch.resourceRequirements.io += test.resourceUsage.io;
          placed = true;
          break;
        }
      }

      // Create new batch if needed
      if (!placed) {
        batches.push({
          tests: [test],
          estimatedDuration: test.duration,
          resourceRequirements: { ...test.resourceUsage },
        });
      }
    }

    // Balance batches
    return this.balanceBatches(batches);
  }

  /**
   * Balances batches to minimize total execution time
   */
  private balanceBatches(batches: Batch[]): Batch[] {
    // Sort batches by duration (longest first)
    batches.sort((a, b) => b.estimatedDuration - a.estimatedDuration);

    // Move tests from longer batches to shorter ones
    for (let i = 0; i < batches.length - 1; i++) {
      const longBatch = batches[i];
      const shortBatch = batches[i + 1];

      // Find movable tests
      const movableTests = longBatch.tests.filter(
        (test) =>
          this.canAddToBatch(shortBatch, test) &&
          longBatch.tests.length > 1 &&
          test.duration < longBatch.estimatedDuration / 2,
      );

      // Move tests
      for (const test of movableTests) {
        const index = longBatch.tests.indexOf(test);
        if (index > -1) {
          longBatch.tests.splice(index, 1);
          shortBatch.tests.push(test);

          // Recalculate durations
          longBatch.estimatedDuration = Math.max(...longBatch.tests.map((t) => t.duration));
          shortBatch.estimatedDuration = Math.max(...shortBatch.tests.map((t) => t.duration));
        }
      }
    }

    return batches;
  }

  /**
   * Checks if test can be added to batch without exceeding limits
   */
  private canAddToBatch(batch: Batch, test: TestInfo): boolean {
    return (
      batch.resourceRequirements.cpu + test.resourceUsage.cpu <= this.resourceLimits.cpu &&
      batch.resourceRequirements.memory + test.resourceUsage.memory <= this.resourceLimits.memory &&
      batch.resourceRequirements.io + test.resourceUsage.io <= this.resourceLimits.io &&
      batch.tests.length < 10 // Max tests per batch
    );
  }

  /**
   * Builds dependency graph from test info
   */
  private buildDependencyGraph(tests: string[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    tests.forEach((test) => {
      const info = this.testInfo.get(test);
      if (info) {
        graph.set(test, info.dependencies.filter((dep) => tests.includes(dep)));
      }
    });

    return graph;
  }

  /**
   * Topological sort for dependency resolution
   */
  private topologicalSort(graph: Map<string, string[]>): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (node: string) => {
      if (temp.has(node)) {
        // Circular dependency - ignore
        return;
      }
      if (visited.has(node)) return;

      temp.add(node);

      const deps = graph.get(node) || [];
      deps.forEach((dep) => visit(dep));

      temp.delete(node);
      visited.add(node);
      sorted.push(node);
    };

    Array.from(graph.keys()).forEach((node) => visit(node));

    return sorted;
  }

  /**
   * Analyzes test to determine duration and resource usage
   */
  private analyzeTest(testPath: string): TestInfo {
    // Try to load from history
    const historyFile = "tests/intelligence/test-execution-history.json";
    let avgDuration = 1000; // Default 1s
    let dependencies: string[] = [];

    try {
      if (fs.existsSync(historyFile)) {
        const history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
        const testHistory = history.filter((h: any) => h.name === testPath);

        if (testHistory.length > 0) {
          avgDuration =
            testHistory.reduce((sum: number, h: any) => sum + h.duration, 0) / testHistory.length;
        }
      }

      // Analyze dependencies from import statements
      if (fs.existsSync(testPath)) {
        const content = fs.readFileSync(testPath, "utf-8");
        const importMatches = content.matchAll(/import.*from\s+['"](.+)['"]/g);

        for (const match of importMatches) {
          const importPath = match[1];
          if (importPath.startsWith(".") || importPath.startsWith("/")) {
            dependencies.push(importPath);
          }
        }
      }
    } catch {
      // Use defaults
    }

    // Estimate resource usage based on test type
    const resourceUsage = this.estimateResourceUsage(testPath, avgDuration);

    return {
      name: testPath,
      duration: avgDuration,
      dependencies,
      resourceUsage,
    };
  }

  /**
   * Estimates resource usage based on test characteristics
   */
  private estimateResourceUsage(
    testPath: string,
    duration: number,
  ): {
    cpu: number;
    memory: number;
    io: number;
  } {
    // Heuristics based on test type
    const isE2E = testPath.includes("/e2e/");
    const isIntegration = testPath.includes("/integration/");
    const isUnit = !isE2E && !isIntegration;

    if (isE2E) {
      return {
        cpu: 30,
        memory: 512,
        io: 40,
      };
    }

    if (isIntegration) {
      return {
        cpu: 20,
        memory: 256,
        io: 30,
      };
    }

    // Unit tests
    return {
      cpu: 10,
      memory: 128,
      io: 10,
    };
  }

  /**
   * Generates optimization report
   */
  generateReport(result: OptimizationResult): string {
    let report = "\n⚡ PARALLELIZATION OPTIMIZATION REPORT\n";
    report += "═".repeat(70) + "\n\n";

    report += `Performance:\n`;
    report += `  Sequential Duration: ${(result.totalDuration / 1000).toFixed(1)}s\n`;
    report += `  Parallel Duration: ${(result.parallelDuration / 1000).toFixed(1)}s\n`;
    report += `  Speedup: ${result.speedup.toFixed(2)}x\n`;
    report += `  Efficiency: ${(result.efficiency * 100).toFixed(1)}%\n\n`;

    report += `Batches: ${result.batches.length}\n`;
    report += `Max Workers: ${this.maxWorkers}\n\n`;

    report += "Batch Details:\n";
    report += "─".repeat(70) + "\n\n";

    result.batches.forEach((batch, i) => {
      report += `Batch ${i + 1}:\n`;
      report += `  Tests: ${batch.tests.length}\n`;
      report += `  Duration: ${(batch.estimatedDuration / 1000).toFixed(1)}s\n`;
      report += `  CPU: ${batch.resourceRequirements.cpu}%\n`;
      report += `  Memory: ${batch.resourceRequirements.memory}MB\n`;
      report += `  I/O: ${batch.resourceRequirements.io}%\n`;
      report += `  Tests:\n`;
      batch.tests.forEach((test) => {
        report += `    - ${path.basename(test.name)} (${test.duration}ms)\n`;
      });
      report += "\n";
    });

    report += "💡 Recommendations:\n";
    if (result.efficiency < 0.7) {
      report += `  • Low efficiency detected - consider increasing max workers\n`;
    }
    if (result.batches.length < this.maxWorkers) {
      report += `  • Fewer batches than workers - some workers will be idle\n`;
    }
    if (result.speedup < 2) {
      report += `  • Limited parallelization gains - check for dependencies\n`;
    }

    return report;
  }

  /**
   * Generates execution script for parallel runs
   */
  generateExecutionScript(result: OptimizationResult): string {
    let script = "#!/bin/bash\n\n";
    script += "# Auto-generated parallel test execution script\n\n";

    script += "echo '🚀 Running optimized parallel test execution'\n";
    script += "echo '═════════════════════════════════════════════'\n\n";

    result.batches.forEach((batch, i) => {
      const testPaths = batch.tests.map((t) => t.name).join(" ");
      script += `# Batch ${i + 1} (${batch.tests.length} tests, ~${(batch.estimatedDuration / 1000).toFixed(1)}s)\n`;
      script += `pnpm vitest run ${testPaths} &\n`;
      script += `BATCH${i + 1}_PID=$!\n\n`;
    });

    script += "# Wait for all batches to complete\n";
    result.batches.forEach((_, i) => {
      script += `wait $BATCH${i + 1}_PID\n`;
    });

    script += '\necho "✅ All batches complete"\n';

    return script;
  }
}

export const parallelizationOptimizer = new ParallelizationOptimizer();
