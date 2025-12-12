#!/usr/bin/env npx ts-node
/**
 * FRESH SCHEDULES ORCHESTRATOR
 * 
 * Replaces CrewOps with a TypeScript-native pipeline orchestrator.
 * Executes gates in correct order, handles failures gracefully,
 * and produces structured output for CI/CD integration.
 * 
 * @version 1.0.0
 * @author Patrick - Fresh Schedules
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

type PipelineFamily = 'Feature' | 'Bug' | 'Schema' | 'Refactor' | 'Security';
type PipelineVariant = 'FAST' | 'STANDARD' | 'HEAVY';
type GateName = 'STATIC' | 'CORRECTNESS' | 'SAFETY' | 'PERF' | 'AI';
type GateStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED';

interface GateDefinition {
  name: GateName;
  displayName: string;
  commands: string[];
  timeout: number;
  blocking: boolean;
  parallel: boolean;
}

interface GateResult {
  gate: GateName;
  status: GateStatus;
  duration: number;
  output: string;
  exitCode: number | null;
}

interface PipelineConfig {
  family: PipelineFamily;
  variant: PipelineVariant;
  gates: GateName[];
  parallel: boolean;
  failFast: boolean;
}

interface PipelineResult {
  config: PipelineConfig;
  status: 'PASSED' | 'FAILED' | 'BLOCKED';
  results: GateResult[];
  blockedBy?: GateName;
  totalDuration: number;
  timestamp: string;
}

interface OrchestratorOptions {
  mode: 'local' | 'ci';
  fix: boolean;
  verbose: boolean;
  dryRun: boolean;
  scope?: string;
}

// =============================================================================
// GATE DEFINITIONS
// =============================================================================

const GATE_DEFINITIONS: Record<GateName, GateDefinition> = {
  STATIC: {
    name: 'STATIC',
    displayName: 'Static Analysis',
    commands: [
      'pnpm lint:check',
      'pnpm format:check',
      'pnpm typecheck',
    ],
    timeout: 120_000,
    blocking: true,
    parallel: true,
  },
  CORRECTNESS: {
    name: 'CORRECTNESS',
    displayName: 'Tests & Correctness',
    commands: [
      'pnpm test:unit',
      'pnpm test:e2e',
      'pnpm test:rules',
    ],
    timeout: 300_000,
    blocking: true,
    parallel: false,
  },
  SAFETY: {
    name: 'SAFETY',
    displayName: 'Security & Safety',
    commands: [
      'pnpm validate:patterns',
      'pnpm validate:secrets',
      'pnpm audit --audit-level=high',
    ],
    timeout: 60_000,
    blocking: true,
    parallel: true,
  },
  PERF: {
    name: 'PERF',
    displayName: 'Performance',
    commands: [
      'pnpm analyze:bundle',
    ],
    timeout: 180_000,
    blocking: false,
    parallel: false,
  },
  AI: {
    name: 'AI',
    displayName: 'AI Context Quality',
    commands: [
      'pnpm validate:ai-context',
    ],
    timeout: 30_000,
    blocking: false,
    parallel: false,
  },
};

// =============================================================================
// PIPELINE CONFIGURATIONS
// =============================================================================

const PIPELINE_CONFIGS: Record<string, PipelineConfig> = {
  'Feature.FAST': {
    family: 'Feature',
    variant: 'FAST',
    gates: ['STATIC'],
    parallel: false,
    failFast: true,
  },
  'Feature.STANDARD': {
    family: 'Feature',
    variant: 'STANDARD',
    gates: ['STATIC', 'CORRECTNESS'],
    parallel: false,
    failFast: true,
  },
  'Feature.HEAVY': {
    family: 'Feature',
    variant: 'HEAVY',
    gates: ['STATIC', 'CORRECTNESS', 'SAFETY', 'PERF'],
    parallel: false,
    failFast: true,
  },
  'Bug.FAST': {
    family: 'Bug',
    variant: 'FAST',
    gates: ['STATIC'],
    parallel: false,
    failFast: true,
  },
  'Bug.STANDARD': {
    family: 'Bug',
    variant: 'STANDARD',
    gates: ['STATIC', 'CORRECTNESS'],
    parallel: false,
    failFast: true,
  },
  'Bug.HEAVY': {
    family: 'Bug',
    variant: 'HEAVY',
    gates: ['STATIC', 'CORRECTNESS', 'SAFETY'],
    parallel: false,
    failFast: true,
  },
  'Schema.STANDARD': {
    family: 'Schema',
    variant: 'STANDARD',
    gates: ['STATIC', 'CORRECTNESS', 'SAFETY'],
    parallel: false,
    failFast: true,
  },
  'Schema.HEAVY': {
    family: 'Schema',
    variant: 'HEAVY',
    gates: ['STATIC', 'CORRECTNESS', 'SAFETY', 'PERF'],
    parallel: false,
    failFast: true,
  },
  'Refactor.FAST': {
    family: 'Refactor',
    variant: 'FAST',
    gates: ['STATIC'],
    parallel: false,
    failFast: true,
  },
  'Refactor.STANDARD': {
    family: 'Refactor',
    variant: 'STANDARD',
    gates: ['STATIC', 'CORRECTNESS'],
    parallel: false,
    failFast: true,
  },
  'Refactor.HEAVY': {
    family: 'Refactor',
    variant: 'HEAVY',
    gates: ['STATIC', 'CORRECTNESS', 'SAFETY', 'PERF', 'AI'],
    parallel: false,
    failFast: true,
  },
  'Security.FAST': {
    family: 'Security',
    variant: 'FAST',
    gates: ['STATIC', 'SAFETY'],
    parallel: false,
    failFast: true,
  },
  'Security.STANDARD': {
    family: 'Security',
    variant: 'STANDARD',
    gates: ['STATIC', 'CORRECTNESS', 'SAFETY'],
    parallel: false,
    failFast: true,
  },
  'Security.HEAVY': {
    family: 'Security',
    variant: 'HEAVY',
    gates: ['STATIC', 'CORRECTNESS', 'SAFETY', 'PERF', 'AI'],
    parallel: false,
    failFast: false, // Run all gates for security audits
  },
};

// =============================================================================
// ORCHESTRATOR CLASS
// =============================================================================

class Orchestrator {
  private options: OrchestratorOptions;
  private startTime: number = 0;

  constructor(options: Partial<OrchestratorOptions> = {}) {
    this.options = {
      mode: options.mode ?? 'local',
      fix: options.fix ?? false,
      verbose: options.verbose ?? false,
      dryRun: options.dryRun ?? false,
      scope: options.scope,
    };
  }

  /**
   * Run a specific pipeline configuration
   */
  async run(pipelineKey: string): Promise<PipelineResult> {
    const config = PIPELINE_CONFIGS[pipelineKey];
    if (!config) {
      throw new Error(`Unknown pipeline: ${pipelineKey}. Available: ${Object.keys(PIPELINE_CONFIGS).join(', ')}`);
    }

    this.startTime = Date.now();
    this.log(`\n🚀 Starting pipeline: ${pipelineKey}`);
    this.log(`   Gates: ${config.gates.join(' → ')}`);
    this.log(`   Mode: ${this.options.mode} | Fix: ${this.options.fix} | Verbose: ${this.options.verbose}\n`);

    const results: GateResult[] = [];

    for (const gateName of config.gates) {
      const gate = GATE_DEFINITIONS[gateName];
      const result = await this.runGate(gate);
      results.push(result);

      if (result.status === 'FAILED' && gate.blocking && config.failFast) {
        this.log(`\n❌ Pipeline BLOCKED by ${gateName}`);
        return this.buildResult(config, 'BLOCKED', results, gateName);
      }
    }

    const anyFailed = results.some(r => r.status === 'FAILED' && GATE_DEFINITIONS[r.gate].blocking);
    const status = anyFailed ? 'FAILED' : 'PASSED';

    this.log(`\n${status === 'PASSED' ? '✅' : '❌'} Pipeline ${status}`);
    return this.buildResult(config, status, results);
  }

  /**
   * Run a single gate
   */
  private async runGate(gate: GateDefinition): Promise<GateResult> {
    const gateStart = Date.now();
    this.log(`\n📋 Gate: ${gate.displayName}`);

    if (this.options.dryRun) {
      this.log(`   [DRY RUN] Would execute: ${gate.commands.join(' && ')}`);
      return {
        gate: gate.name,
        status: 'SKIPPED',
        duration: 0,
        output: 'Dry run - skipped',
        exitCode: null,
      };
    }

    const commands = this.options.fix && this.options.mode === 'local'
      ? this.getFixCommands(gate)
      : gate.commands;

    let output = '';
    let exitCode = 0;

    for (const cmd of commands) {
      this.log(`   → ${cmd}`);
      try {
        const result = execSync(cmd, {
          encoding: 'utf8',
          timeout: gate.timeout,
          stdio: this.options.verbose ? 'inherit' : 'pipe',
        });
        output += result;
      } catch (error: any) {
        output += error.stdout ?? '';
        output += error.stderr ?? '';
        exitCode = error.status ?? 1;
        this.log(`   ❌ Command failed with exit code ${exitCode}`);
        break;
      }
    }

    const duration = Date.now() - gateStart;
    const status: GateStatus = exitCode === 0 ? 'PASSED' : 'FAILED';
    
    this.log(`   ${status === 'PASSED' ? '✓' : '✗'} ${gate.displayName}: ${status} (${duration}ms)`);

    return {
      gate: gate.name,
      status,
      duration,
      output,
      exitCode,
    };
  }

  /**
   * Get fix-mode commands for a gate
   */
  private getFixCommands(gate: GateDefinition): string[] {
    const fixMap: Record<string, string> = {
      'pnpm lint:check': 'pnpm lint:fix',
      'pnpm format:check': 'pnpm format:fix',
    };

    return gate.commands.map(cmd => fixMap[cmd] ?? cmd);
  }

  /**
   * Build the final result object
   */
  private buildResult(
    config: PipelineConfig,
    status: PipelineResult['status'],
    results: GateResult[],
    blockedBy?: GateName
  ): PipelineResult {
    const totalDuration = Date.now() - this.startTime;

    const result: PipelineResult = {
      config,
      status,
      results,
      blockedBy,
      totalDuration,
      timestamp: new Date().toISOString(),
    };

    // Write result to file for CI consumption
    if (this.options.mode === 'ci') {
      this.writeResultFile(result);
    }

    return result;
  }

  /**
   * Write result to JSON file
   */
  private writeResultFile(result: PipelineResult): void {
    const outputPath = path.join(process.cwd(), '.orchestrator-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    this.log(`\n📄 Result written to ${outputPath}`);
  }

  /**
   * Log message (respects verbose setting)
   */
  private log(message: string): void {
    if (this.options.verbose || !message.startsWith('   ')) {
      console.log(message);
    }
  }

  /**
   * Auto-detect appropriate pipeline based on changed files
   */
  static detectPipeline(changedFiles: string[]): string {
    // Security-relevant files
    const securityPatterns = [
      /firestore\.rules/,
      /\.env/,
      /auth/i,
      /security/i,
      /packages\/api-framework/,
    ];

    // Schema files
    const schemaPatterns = [
      /packages\/types\/src\/schemas/,
      /\.schema\.ts$/,
    ];

    // Check for security changes
    if (changedFiles.some(f => securityPatterns.some(p => p.test(f)))) {
      return 'Security.STANDARD';
    }

    // Check for schema changes
    if (changedFiles.some(f => schemaPatterns.some(p => p.test(f)))) {
      return 'Schema.STANDARD';
    }

    // Check scope
    const fileCount = changedFiles.length;
    const touchesMultiplePackages = new Set(
      changedFiles.map(f => f.split('/').slice(0, 2).join('/'))
    ).size > 1;

    if (fileCount === 1) {
      return 'Feature.FAST';
    } else if (fileCount <= 5 && !touchesMultiplePackages) {
      return 'Feature.STANDARD';
    } else {
      return 'Feature.HEAVY';
    }
  }
}

// =============================================================================
// CLI
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options: Partial<OrchestratorOptions> = {
    mode: args.includes('--ci') ? 'ci' : 'local',
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run'),
  };

  // Find pipeline argument
  const pipelineArg = args.find(a => !a.startsWith('-'));
  
  if (!pipelineArg && !args.includes('--auto')) {
    console.log(`
FRESH SCHEDULES ORCHESTRATOR

Usage:
  pnpm orchestrate <pipeline> [options]
  pnpm orchestrate --auto [options]

Pipelines:
  Feature.{FAST|STANDARD|HEAVY}
  Bug.{FAST|STANDARD|HEAVY}
  Schema.{STANDARD|HEAVY}
  Refactor.{FAST|STANDARD|HEAVY}
  Security.{FAST|STANDARD|HEAVY}

Options:
  --ci          Run in CI mode (write result file)
  --fix         Auto-fix fixable issues (local mode only)
  --verbose     Show all output
  --dry-run     Show what would run without executing
  --auto        Auto-detect pipeline from git diff

Examples:
  pnpm orchestrate Feature.STANDARD
  pnpm orchestrate Security.HEAVY --verbose
  pnpm orchestrate --auto --fix
`);
    process.exit(0);
  }

  // Auto-detect pipeline
  let pipeline = pipelineArg;
  if (args.includes('--auto')) {
    try {
      const diffOutput = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' });
      const changedFiles = diffOutput.trim().split('\n').filter(Boolean);
      pipeline = Orchestrator.detectPipeline(changedFiles);
      console.log(`🔍 Auto-detected pipeline: ${pipeline}`);
    } catch {
      console.log('⚠️ Could not auto-detect, using Feature.STANDARD');
      pipeline = 'Feature.STANDARD';
    }
  }

  const orchestrator = new Orchestrator(options);
  
  try {
    const result = await orchestrator.run(pipeline!);
    
    // Print summary
    console.log('\n═══════════════════════════════════════');
    console.log(`Pipeline: ${result.config.family}.${result.config.variant}`);
    console.log(`Status:   ${result.status}`);
    console.log(`Duration: ${result.totalDuration}ms`);
    console.log('═══════════════════════════════════════\n');

    // Gate summary
    console.log('Gate Results:');
    for (const gate of result.results) {
      const icon = gate.status === 'PASSED' ? '✅' : gate.status === 'FAILED' ? '❌' : '⏭️';
      console.log(`  ${icon} ${gate.gate}: ${gate.status} (${gate.duration}ms)`);
    }

    // Exit with appropriate code
    process.exit(result.status === 'PASSED' ? 0 : 1);
  } catch (error: any) {
    console.error(`\n💥 Orchestrator error: ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
main();

export { Orchestrator, PIPELINE_CONFIGS, GATE_DEFINITIONS };
export type { PipelineConfig, PipelineResult, GateResult, OrchestratorOptions };
