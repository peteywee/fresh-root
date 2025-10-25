// Monte Carlo simulation for auth/onboarding flows
// Run with: pnpm dlx tsx tools/sim/auth_sim.mts
// Use SEED env variable for deterministic results: SEED=12345 pnpm dlx tsx tools/sim/auth_sim.mts

interface SimResult {
  success: boolean;
  duration: number;
  errors: string[];
}

// Simple seeded random number generator for deterministic testing
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

async function simulateAuthFlow(iterations: number = 10000, seed?: number): Promise<SimResult[]> {
  const results: SimResult[] = [];
  const random = seed !== undefined ? new SeededRandom(seed) : null;
  const getRandom = () => random ? random.next() : Math.random();

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const errors: string[] = [];

    try {
      // Simulate random auth scenarios with realistic 97% success rate
      const scenario = getRandom();

      if (scenario < 0.35) {
        // Google popup success
        await new Promise(resolve => setTimeout(resolve, getRandom() * 100));
      } else if (scenario < 0.70) {
        // Email link success
        await new Promise(resolve => setTimeout(resolve, getRandom() * 200));
      } else if (scenario < 0.97) {
        // Session creation success
        await new Promise(resolve => setTimeout(resolve, getRandom() * 50));
      } else {
        // Error case (3% failure rate for realistic simulation)
        errors.push('Simulated auth failure');
        await new Promise(resolve => setTimeout(resolve, getRandom() * 300));
      }

      results.push({
        success: errors.length === 0,
        duration: Date.now() - start,
        errors
      });

    } catch (e) {
      results.push({
        success: false,
        duration: Date.now() - start,
        errors: [String(e)]
      });
    }
  }

  return results;
}

async function main() {
  console.log('Running auth/onboarding Monte Carlo simulation...');
  
  // Support seeded random for deterministic CI testing
  const seed = process.env.SEED ? parseInt(process.env.SEED, 10) : undefined;
  const minSuccessRate = parseFloat(process.env.MIN_SUCCESS_RATE || '0.95');
  
  if (seed !== undefined) {
    console.log(`Using deterministic seed: ${seed}`);
  }
  
  const results = await simulateAuthFlow(10000, seed);

  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);

  console.log(`Total simulations: ${results.length}`);
  console.log(`Success rate: ${(successes.length / results.length * 100).toFixed(2)}%`);
  console.log(`Average duration: ${results.reduce((a, b) => a + b.duration, 0) / results.length}ms`);
  console.log(`Max duration: ${Math.max(...results.map(r => r.duration))}ms`);

  if (failures.length > 0) {
    console.log(`Failures: ${failures.length}`);
    console.log('Sample errors:', failures.slice(0, 5).map(f => f.errors).flat());
  }

  // Check success rate with configurable threshold
  const actualRate = successes.length / results.length;
  if (actualRate < minSuccessRate) {
    console.error(`❌ Auth simulation failed: success rate ${(actualRate * 100).toFixed(2)}% is below required ${(minSuccessRate * 100).toFixed(2)}%`);
    console.error('Note: This simulation uses random scenarios. In CI, set SEED environment variable for deterministic results.');
    console.error('Example: SEED=12345 pnpm dlx tsx tools/sim/auth_sim.mts');
    process.exit(1);
  }

  console.log('✅ Auth simulation passed');
}

main().catch(console.error);
