// [P1][TEST][TEST] Mutation Testing tests
// Tags: P1, TEST, TEST
/**
 * Mutation Testing Framework
 * Validates test quality by introducing bugs and ensuring tests catch them
 */

import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface Mutant {
  id: string;
  filePath: string;
  lineNumber: number;
  original: string;
  mutated: string;
  operator: MutationOperator;
  status: "pending" | "killed" | "survived" | "timeout" | "error";
}

type MutationOperator =
  | "ConditionalBoundary" // < to <=, > to >=
  | "Negation" // ! addition/removal
  | "Arithmetic" // +, -, *, / swaps
  | "Logical" // &&, ||, swaps
  | "Return" // return value changes
  | "Assignment" // = mutations
  | "Comparison"; // ==, !=, <, >, <=, >= swaps

interface MutationReport {
  totalMutants: number;
  killed: number;
  survived: number;
  timeout: number;
  errors: number;
  mutationScore: number; // percentage
  survivedMutants: Mutant[];
  coverage: {
    statement: number;
    branch: number;
    function: number;
  };
}

export class MutationTester {
  private mutants: Mutant[] = [];
  private currentMutantId = 0;
  private testCommand: string = "pnpm vitest run";
  private timeout: number = 60000; // 60 seconds per test run

  /**
   * Generates mutants for a source file
   */
  generateMutants(filePath: string): Mutant[] {
    const sourceCode = fs.readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);

    const mutants: Mutant[] = [];

    const visit = (node: ts.Node) => {
      // Conditional boundary mutations: < to <=, > to >=
      if (ts.isBinaryExpression(node)) {
        const operator = node.operatorToken.kind;

        if (operator === ts.SyntaxKind.LessThanToken) {
          mutants.push(
            this.createMutant(
              filePath,
              sourceFile,
              node.operatorToken,
              "<",
              "<=",
              "ConditionalBoundary",
            ),
          );
        } else if (operator === ts.SyntaxKind.GreaterThanToken) {
          mutants.push(
            this.createMutant(
              filePath,
              sourceFile,
              node.operatorToken,
              ">",
              ">=",
              "ConditionalBoundary",
            ),
          );
        }

        // Arithmetic mutations: + to -, * to /
        if (operator === ts.SyntaxKind.PlusToken) {
          mutants.push(
            this.createMutant(filePath, sourceFile, node.operatorToken, "+", "-", "Arithmetic"),
          );
        } else if (operator === ts.SyntaxKind.MinusToken) {
          mutants.push(
            this.createMutant(filePath, sourceFile, node.operatorToken, "-", "+", "Arithmetic"),
          );
        } else if (operator === ts.SyntaxKind.AsteriskToken) {
          mutants.push(
            this.createMutant(filePath, sourceFile, node.operatorToken, "*", "/", "Arithmetic"),
          );
        }

        // Logical mutations: && to ||
        if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
          mutants.push(
            this.createMutant(filePath, sourceFile, node.operatorToken, "&&", "||", "Logical"),
          );
        } else if (operator === ts.SyntaxKind.BarBarToken) {
          mutants.push(
            this.createMutant(filePath, sourceFile, node.operatorToken, "||", "&&", "Logical"),
          );
        }

        // Comparison mutations: == to !=
        if (
          operator === ts.SyntaxKind.EqualsEqualsToken ||
          operator === ts.SyntaxKind.EqualsEqualsEqualsToken
        ) {
          mutants.push(
            this.createMutant(
              filePath,
              sourceFile,
              node.operatorToken,
              node.operatorToken.getText(sourceFile),
              "!==",
              "Comparison",
            ),
          );
        }
      }

      // Negation mutations: add/remove !
      if (ts.isPrefixUnaryExpression(node)) {
        if (node.operator === ts.SyntaxKind.ExclamationToken) {
          // Remove negation
          mutants.push({
            id: `mutant-${this.currentMutantId++}`,
            filePath,
            lineNumber:
              sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            original: node.getText(sourceFile),
            mutated: node.operand.getText(sourceFile),
            operator: "Negation",
            status: "pending",
          });
        }
      }

      // Return value mutations
      if (ts.isReturnStatement(node) && node.expression) {
        const expression = node.expression;

        // Return true to false
        if (expression.kind === ts.SyntaxKind.TrueKeyword) {
          mutants.push(
            this.createMutant(filePath, sourceFile, expression, "true", "false", "Return"),
          );
        } else if (expression.kind === ts.SyntaxKind.FalseKeyword) {
          mutants.push(
            this.createMutant(filePath, sourceFile, expression, "false", "true", "Return"),
          );
        }

        // Numeric return values
        if (ts.isNumericLiteral(expression)) {
          const value = parseInt(expression.text);
          mutants.push(
            this.createMutant(
              filePath,
              sourceFile,
              expression,
              expression.text,
              `${value + 1}`,
              "Return",
            ),
          );
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    this.mutants.push(...mutants);

    return mutants;
  }

  /**
   * Helper to create a mutant
   */
  private createMutant(
    filePath: string,
    sourceFile: ts.SourceFile,
    node: ts.Node,
    original: string,
    mutated: string,
    operator: MutationOperator,
  ): Mutant {
    return {
      id: `mutant-${this.currentMutantId++}`,
      filePath,
      lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
      original,
      mutated,
      operator,
      status: "pending",
    };
  }

  /**
   * Applies a mutant to the source file
   */
  private applyMutant(mutant: Mutant): string {
    const sourceCode = fs.readFileSync(mutant.filePath, "utf-8");
    const lines = sourceCode.split("\n");

    // Replace first occurrence on the specific line
    const lineIndex = mutant.lineNumber - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      lines[lineIndex] = lines[lineIndex].replace(mutant.original, mutant.mutated);
    }

    return lines.join("\n");
  }

  /**
   * Reverts a mutant (restores original code)
   */
  private revertMutant(mutant: Mutant, originalCode: string): void {
    fs.writeFileSync(mutant.filePath, originalCode);
  }

  /**
   * Runs tests against a mutant
   */
  private async testMutant(mutant: Mutant): Promise<"killed" | "survived" | "timeout" | "error"> {
    const originalCode = fs.readFileSync(mutant.filePath, "utf-8");
    const mutatedCode = this.applyMutant(mutant);

    try {
      // Write mutated code
      fs.writeFileSync(mutant.filePath, mutatedCode);

      // Run tests with timeout
      try {
        execSync(this.testCommand, {
          cwd: process.cwd(),
          timeout: this.timeout,
          stdio: "pipe",
        });

        // Tests passed - mutant survived (bad!)
        return "survived";
      } catch (error: any) {
        if (error.killed) {
          return "timeout";
        }
        // Tests failed - mutant killed (good!)
        return "killed";
      }
    } catch (error) {
      console.error(`Error testing mutant ${mutant.id}:`, error);
      return "error";
    } finally {
      // Always revert the mutant
      this.revertMutant(mutant, originalCode);
    }
  }

  /**
   * Runs mutation testing on all mutants
   */
  async runMutationTests(): Promise<MutationReport> {
    console.log(`🧬 Running mutation testing on ${this.mutants.length} mutants...\n`);

    let killed = 0;
    let survived = 0;
    let timeout = 0;
    let errors = 0;
    const survivedMutants: Mutant[] = [];

    for (const mutant of this.mutants) {
      process.stdout.write(`Testing ${mutant.id} (${mutant.operator})... `);

      const result = await this.testMutant(mutant);
      mutant.status = result;

      switch (result) {
        case "killed":
          killed++;
          console.log("✅ KILLED");
          break;
        case "survived":
          survived++;
          survivedMutants.push(mutant);
          console.log("❌ SURVIVED");
          break;
        case "timeout":
          timeout++;
          console.log("⏱️  TIMEOUT");
          break;
        case "error":
          errors++;
          console.log("⚠️  ERROR");
          break;
      }
    }

    const mutationScore = (killed / (this.mutants.length - errors - timeout)) * 100;

    return {
      totalMutants: this.mutants.length,
      killed,
      survived,
      timeout,
      errors,
      mutationScore,
      survivedMutants,
      coverage: {
        statement: 0, // Would need to integrate with coverage tool
        branch: 0,
        function: 0,
      },
    };
  }

  /**
   * Generates a detailed mutation testing report
   */
  generateReport(report: MutationReport): string {
    let output = "\n";
    output += "═".repeat(70) + "\n";
    output += "🧬  MUTATION TESTING REPORT\n";
    output += "═".repeat(70) + "\n\n";

    // Summary
    output += "📊 Summary:\n";
    output += `   Total Mutants: ${report.totalMutants}\n`;
    output += `   Killed: ${report.killed} ✅\n`;
    output += `   Survived: ${report.survived} ❌\n`;
    output += `   Timeout: ${report.timeout} ⏱️\n`;
    output += `   Errors: ${report.errors} ⚠️\n`;
    output += `   Mutation Score: ${report.mutationScore.toFixed(2)}%\n\n`;

    // Score interpretation
    if (report.mutationScore >= 80) {
      output += "🏆 Excellent! Your tests are high quality.\n\n";
    } else if (report.mutationScore >= 60) {
      output += "👍 Good! But there's room for improvement.\n\n";
    } else if (report.mutationScore >= 40) {
      output += "⚠️  Fair. Consider adding more test cases.\n\n";
    } else {
      output += "❌ Poor. Your tests need significant improvement.\n\n";
    }

    // Survived mutants (weaknesses in tests)
    if (report.survivedMutants.length > 0) {
      output += "❌ Survived Mutants (Test Weaknesses):\n";
      output += "─".repeat(70) + "\n";

      report.survivedMutants.forEach((mutant) => {
        output += `\n${mutant.id} - ${mutant.operator}\n`;
        output += `   File: ${mutant.filePath}:${mutant.lineNumber}\n`;
        output += `   Original: ${mutant.original}\n`;
        output += `   Mutated:  ${mutant.mutated}\n`;
        output += `   💡 Add a test case to catch this mutation!\n`;
      });

      output += "\n";
    }

    // Recommendations
    output += "\n💡 Recommendations:\n";
    output += "─".repeat(70) + "\n";

    const operatorCounts = new Map<MutationOperator, { killed: number; survived: number }>();

    this.mutants.forEach((mutant) => {
      if (!operatorCounts.has(mutant.operator)) {
        operatorCounts.set(mutant.operator, { killed: 0, survived: 0 });
      }

      const counts = operatorCounts.get(mutant.operator)!;
      if (mutant.status === "killed") {
        counts.killed++;
      } else if (mutant.status === "survived") {
        counts.survived++;
      }
    });

    operatorCounts.forEach((counts, operator) => {
      const total = counts.killed + counts.survived;
      const score = total > 0 ? ((counts.killed / total) * 100).toFixed(1) : "0";

      if (counts.survived > 0) {
        output += `\n${operator}:\n`;
        output += `   Score: ${score}% (${counts.killed}/${total} killed)\n`;

        if (operator === "ConditionalBoundary") {
          output += "   💡 Add boundary value tests (e.g., test with 0, 1, -1, max values)\n";
        } else if (operator === "Arithmetic") {
          output += "   💡 Verify arithmetic operations with different input values\n";
        } else if (operator === "Logical") {
          output += "   💡 Test all combinations of boolean conditions\n";
        } else if (operator === "Return") {
          output += "   💡 Assert exact return values, not just truthiness\n";
        } else if (operator === "Negation") {
          output += "   💡 Test both positive and negative cases\n";
        } else if (operator === "Comparison") {
          output += "   💡 Test equality and inequality explicitly\n";
        }
      }
    });

    return output;
  }

  /**
   * Saves mutation report to file
   */
  saveMutationReport(
    report: MutationReport,
    outputPath: string = "tests/intelligence/mutation-report.json",
  ): void {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Mutation report saved to ${outputPath}`);
  }
}

/**
 * CLI entry point for mutation testing
 */
export async function runMutationTesting(targetFiles: string[]): Promise<MutationReport> {
  const tester = new MutationTester();

  // Generate mutants for all target files
  targetFiles.forEach((file) => {
    console.log(`Generating mutants for ${file}...`);
    const mutants = tester.generateMutants(file);
    console.log(`  Generated ${mutants.length} mutants`);
  });

  // Run mutation tests
  const report = await tester.runMutationTests();

  // Generate and display report
  console.log(tester.generateReport(report));

  // Save report
  tester.saveMutationReport(report);

  return report;
}
