#!/usr/bin/env node
// Lightweight wrapper around autocannon to benchmark the running Next.js dev or prod server.
// Usage: node scripts/bench/http-bench.js --url http://localhost:3000 --connections 50 --duration 10

const autocannon = require("autocannon");
const argv = require("minimist")(process.argv.slice(2));

const url = argv.url || "http://localhost:3000";
const connections = parseInt(argv.connections || "20", 10);
const duration = parseInt(argv.duration || "5", 10);

console.log(`Running HTTP benchmark against ${url} — ${connections} connections for ${duration}s`);

const inst = autocannon(
  {
    url,
    connections,
    duration,
  },
  (err, result) => {
    if (err) {
      console.error("Benchmark failed:", err);
      process.exit(1);
    }
    console.log("\nBenchmark results:");
    console.log(JSON.stringify(result, null, 2));
  },
);

autocannon.track(inst, { renderProgressBar: true });
