// [P1][TEST][PERFORMANCE] PerformanceMetrics bounded-history tests
// Tags: P1, TEST, PERFORMANCE
import { describe, expect, it } from "vitest";

import { PerformanceMetrics } from "../performance";

describe("PerformanceMetrics", () => {
  it("caps sample history at the configured limit", () => {
    const metrics = new PerformanceMetrics(3);

    metrics.record("op", 10);
    metrics.record("op", 20);
    metrics.record("op", 30);
    metrics.record("op", 40);

    const stats = metrics.getStats("op");

    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(3);
    expect(stats?.min).toBe(20);
    expect(stats?.max).toBe(40);
    expect(stats?.p50).toBe(30);
  });

  it("clears stored samples and reports aggregated stats", () => {
    const metrics = new PerformanceMetrics(5);

    metrics.record("alpha", 5);
    metrics.record("beta", 10);
    metrics.clear();

    expect(metrics.getStats("alpha")).toBeNull();

    metrics.record("alpha", 10);
    metrics.record("alpha", 20);

    const allStats = metrics.getAllStats();

    expect(allStats.alpha?.count).toBe(2);
    expect(allStats.alpha?.min).toBe(10);
    expect(allStats.alpha?.max).toBe(20);
  });
});
