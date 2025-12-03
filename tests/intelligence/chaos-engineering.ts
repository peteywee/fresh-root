/**
 * Chaos Engineering for Resilience Testing
 * Injects failures to test system resilience and error handling
 */

import { NextRequest, NextResponse } from 'next/server';

interface ChaosExperiment {
  name: string;
  type: ChaosType;
  enabled: boolean;
  probability: number; // 0-1
  config: any;
}

type ChaosType =
  | 'latency' // Add artificial latency
  | 'error' // Return errors
  | 'timeout' // Force timeouts
  | 'malformed_response' // Return malformed data
  | 'intermittent_failure' // Random failures
  | 'rate_limit' // Simulate rate limiting
  | 'database_failure' // Simulate DB issues
  | 'network_partition'; // Simulate network issues

interface ChaosResult {
  experimentName: string;
  totalRequests: number;
  affectedRequests: number;
  systemBehavior: 'graceful' | 'degraded' | 'failed';
  errors: Array<{ type: string; count: number }>;
  recommendations: string[];
}

export class ChaosEngineer {
  private experiments: Map<string, ChaosExperiment> = new Map();
  private results: Map<string, ChaosResult> = new Map();
  private requestLog: Array<{ timestamp: number; affected: boolean; error?: string }> = [];

  /**
   * Registers a chaos experiment
   */
  registerExperiment(experiment: ChaosExperiment): void {
    this.experiments.set(experiment.name, experiment);

    this.results.set(experiment.name, {
      experimentName: experiment.name,
      totalRequests: 0,
      affectedRequests: 0,
      systemBehavior: 'graceful',
      errors: [],
      recommendations: [],
    });
  }

  /**
   * Chaos middleware for API routes
   */
  async chaosMiddleware(
    request: Request,
    next: () => Promise<Response>
  ): Promise<Response> {
    // Check each active experiment
    for (const [name, experiment] of this.experiments) {
      if (!experiment.enabled) continue;

      const result = this.results.get(name)!;
      result.totalRequests++;

      // Probabilistically apply chaos
      if (Math.random() < experiment.probability) {
        result.affectedRequests++;
        this.requestLog.push({ timestamp: Date.now(), affected: true });

        // Apply chaos based on type
        const chaosResponse = await this.applyChaos(experiment, request);
        if (chaosResponse) {
          return chaosResponse;
        }
      } else {
        this.requestLog.push({ timestamp: Date.now(), affected: false });
      }
    }

    // Proceed normally
    return next();
  }

  /**
   * Applies chaos based on experiment type
   */
  private async applyChaos(
    experiment: ChaosExperiment,
    request: Request
  ): Promise<Response | null> {
    const result = this.results.get(experiment.name)!;

    switch (experiment.type) {
      case 'latency':
        // Add artificial latency
        const delay = experiment.config.delayMs || 3000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return null; // Continue to normal handler

      case 'error':
        // Return error response
        const statusCode = experiment.config.statusCode || 500;
        const errorMessage = experiment.config.message || 'Internal Server Error (Chaos Experiment)';

        this.logError(result, `HTTP ${statusCode}`);

        return new Response(
          JSON.stringify({ error: errorMessage, chaos: true }),
          { status: statusCode, headers: { 'Content-Type': 'application/json' } }
        );

      case 'timeout':
        // Force timeout by delaying indefinitely
        await new Promise(resolve => setTimeout(resolve, 60000));
        return null;

      case 'malformed_response':
        // Return malformed JSON
        this.logError(result, 'Malformed Response');

        return new Response(
          '{"incomplete": "json", missing_bracket',
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'intermittent_failure':
        // Random failures (50% chance)
        if (Math.random() < 0.5) {
          this.logError(result, 'Intermittent Failure');

          return new Response(
            JSON.stringify({ error: 'Service temporarily unavailable', chaos: true }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return null;

      case 'rate_limit':
        // Simulate rate limiting
        this.logError(result, 'Rate Limit');

        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', chaos: true }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );

      case 'database_failure':
        // Simulate database connection error
        this.logError(result, 'Database Failure');

        return new Response(
          JSON.stringify({ error: 'Database connection failed', chaos: true }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );

      case 'network_partition':
        // Simulate network timeout
        await new Promise(resolve => setTimeout(resolve, 10000));
        this.logError(result, 'Network Partition');

        return new Response(
          JSON.stringify({ error: 'Network timeout', chaos: true }),
          { status: 504, headers: { 'Content-Type': 'application/json' } }
        );

      default:
        return null;
    }
  }

  /**
   * Logs error for analysis
   */
  private logError(result: ChaosResult, errorType: string): void {
    const existing = result.errors.find(e => e.type === errorType);
    if (existing) {
      existing.count++;
    } else {
      result.errors.push({ type: errorType, count: 1 });
    }
  }

  /**
   * Analyzes chaos experiment results
   */
  analyzeExperiment(experimentName: string): ChaosResult {
    const result = this.results.get(experimentName);
    if (!result) {
      throw new Error(`Experiment ${experimentName} not found`);
    }

    // Analyze system behavior
    const affectedPercentage = (result.affectedRequests / result.totalRequests) * 100;

    if (result.errors.length === 0) {
      result.systemBehavior = 'graceful';
      result.recommendations.push('✅ System handled chaos gracefully');
    } else if (affectedPercentage < 20) {
      result.systemBehavior = 'graceful';
      result.recommendations.push('✅ System mostly resilient with minor degradation');
    } else if (affectedPercentage < 50) {
      result.systemBehavior = 'degraded';
      result.recommendations.push('⚠️  System showed degradation under chaos');
      result.recommendations.push('   Consider adding retry logic and circuit breakers');
    } else {
      result.systemBehavior = 'failed';
      result.recommendations.push('❌ System failed under chaos conditions');
      result.recommendations.push('   CRITICAL: Implement error handling and fallbacks');
    }

    // Analyze error patterns
    result.errors.forEach(error => {
      if (error.type.includes('500') || error.type.includes('Database')) {
        result.recommendations.push('💡 Add database connection pooling and retry logic');
      }
      if (error.type.includes('timeout') || error.type.includes('Network')) {
        result.recommendations.push('💡 Implement request timeouts and circuit breakers');
      }
      if (error.type.includes('Rate Limit')) {
        result.recommendations.push('💡 Add client-side rate limiting and backoff');
      }
    });

    return result;
  }

  /**
   * Generates chaos engineering report
   */
  generateReport(): string {
    let report = '\n';
    report += '🌪️  CHAOS ENGINEERING REPORT\n';
    report += '═'.repeat(70) + '\n\n';

    this.experiments.forEach((experiment, name) => {
      const result = this.analyzeExperiment(name);

      report += `Experiment: ${name}\n`;
      report += `Type: ${experiment.type}\n`;
      report += `Probability: ${(experiment.probability * 100).toFixed(0)}%\n`;
      report += `Status: ${experiment.enabled ? '🟢 Active' : '🔴 Inactive'}\n\n`;

      report += `Results:\n`;
      report += `  Total Requests: ${result.totalRequests}\n`;
      report += `  Affected Requests: ${result.affectedRequests}\n`;
      report += `  System Behavior: ${result.systemBehavior.toUpperCase()}\n\n`;

      if (result.errors.length > 0) {
        report += `Errors Encountered:\n`;
        result.errors.forEach(error => {
          report += `  ${error.type}: ${error.count} occurrences\n`;
        });
        report += '\n';
      }

      if (result.recommendations.length > 0) {
        report += `Recommendations:\n`;
        result.recommendations.forEach(rec => {
          report += `  ${rec}\n`;
        });
        report += '\n';
      }

      report += '─'.repeat(70) + '\n\n';
    });

    return report;
  }

  /**
   * Predefined chaos experiments
   */
  static createStandardExperiments(): ChaosExperiment[] {
    return [
      {
        name: 'High Latency',
        type: 'latency',
        enabled: false,
        probability: 0.3,
        config: { delayMs: 5000 },
      },
      {
        name: 'Random 500 Errors',
        type: 'error',
        enabled: false,
        probability: 0.1,
        config: { statusCode: 500, message: 'Internal Server Error' },
      },
      {
        name: 'Database Connection Failures',
        type: 'database_failure',
        enabled: false,
        probability: 0.05,
        config: {},
      },
      {
        name: 'Network Timeouts',
        type: 'timeout',
        enabled: false,
        probability: 0.05,
        config: {},
      },
      {
        name: 'Rate Limiting',
        type: 'rate_limit',
        enabled: false,
        probability: 0.15,
        config: {},
      },
      {
        name: 'Intermittent Failures',
        type: 'intermittent_failure',
        enabled: false,
        probability: 0.2,
        config: {},
      },
    ];
  }

  /**
   * Enables an experiment
   */
  enableExperiment(name: string): void {
    const experiment = this.experiments.get(name);
    if (experiment) {
      experiment.enabled = true;
      console.log(`🌪️  Enabled chaos experiment: ${name}`);
    }
  }

  /**
   * Disables an experiment
   */
  disableExperiment(name: string): void {
    const experiment = this.experiments.get(name);
    if (experiment) {
      experiment.enabled = false;
      console.log(`🛡️  Disabled chaos experiment: ${name}`);
    }
  }

  /**
   * Disables all experiments
   */
  disableAllExperiments(): void {
    this.experiments.forEach(exp => {
      exp.enabled = false;
    });
    console.log('🛡️  All chaos experiments disabled');
  }
}

/**
 * Chaos testing integration for E2E tests
 */
export class ChaosTestRunner {
  private engineer: ChaosEngineer;

  constructor() {
    this.engineer = new ChaosEngineer();

    // Register standard experiments
    ChaosEngineer.createStandardExperiments().forEach(exp => {
      this.engineer.registerExperiment(exp);
    });
  }

  /**
   * Runs a chaos test scenario
   */
  async runChaosTest(
    scenario: string,
    testFn: () => Promise<void>
  ): Promise<{ success: boolean; report: string }> {
    console.log(`\n🌪️  Running chaos test: ${scenario}`);

    // Enable relevant experiment
    this.engineer.enableExperiment(scenario);

    try {
      // Run test with chaos
      await testFn();

      // Analyze results
      const report = this.engineer.generateReport();

      return {
        success: true,
        report,
      };
    } catch (error: any) {
      const report = this.engineer.generateReport();

      return {
        success: false,
        report: `Test failed under chaos:\n${error.message}\n\n${report}`,
      };
    } finally {
      // Disable experiment
      this.engineer.disableExperiment(scenario);
    }
  }

  /**
   * Runs all chaos experiments
   */
  async runAllChaosTests(testFn: () => Promise<void>): Promise<string> {
    const results: string[] = [];

    for (const experiment of ChaosEngineer.createStandardExperiments()) {
      const result = await this.runChaosTest(experiment.name, testFn);
      results.push(result.report);
    }

    return results.join('\n\n');
  }
}

// Export singleton
export const chaosEngineer = new ChaosEngineer();

// Initialize with standard experiments
ChaosEngineer.createStandardExperiments().forEach(exp => {
  chaosEngineer.registerExperiment(exp);
});
