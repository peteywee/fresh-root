// Monte Carlo simulation for auth/onboarding flows
// Run with: pnpm dlx tsx tools/sim/auth_sim.mts


interface SimResult {
  success: boolean;
  duration: number;
  errors: string[];
}

async function simulateAuthFlow(iterations: number = 10000): Promise<SimResult[]> {
  const results: SimResult[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const errors: string[] = [];

    try {
      // Simulate random auth scenarios
      const scenario = Math.random();

      if (scenario < 0.3) {
        // Google popup success
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      } else if (scenario < 0.6) {
        // Email link success
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
      } else if (scenario < 0.8) {
        // Session creation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
      } else {
        // Error case
        errors.push('Simulated auth failure');
        await new Promise(resolve => setTimeout(resolve, Math.random() * 300));
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
  const results = await simulateAuthFlow(10000);

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

  // Exit with error if success rate < 95%
  if (successes.length / results.length < 0.95) {
    console.error('❌ Auth simulation failed: success rate below 95%');
    process.exit(1);
  }

  console.log('✅ Auth simulation passed');
}

main().catch(console.error);
