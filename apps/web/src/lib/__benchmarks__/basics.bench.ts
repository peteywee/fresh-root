// [P1][TEST][BENCH] Basic Performance Benchmarks
// Tags: P1, TEST, BENCH, PERFORMANCE

import { describe } from "vitest";

// bench is available in vitest benchmark mode
declare const bench: (name: string, fn: () => void | Promise<void>) => void;

/**
 * Beginner Benchmarks - Baseline Performance Suite
 *
 * These benchmarks establish baseline performance metrics for common operations.
 * Use these as a reference point when optimizing code.
 *
 * To run: pnpm --filter @apps/web bench
 */

describe("String Operations", () => {
  const testString = "Hello, World!".repeat(100);
  const longString = "x".repeat(10000);

  bench("String concatenation with +", () => {
    let result = "";
    for (let i = 0; i < 100; i++) {
      result = result + "test";
    }
  });

  bench("String concatenation with template literals", () => {
    let result = "";
    for (let i = 0; i < 100; i++) {
      result = `${result}test`;
    }
  });

  bench("String concatenation with array join", () => {
    const arr = [];
    for (let i = 0; i < 100; i++) {
      arr.push("test");
    }
    arr.join("");
  });

  bench("String includes vs indexOf", () => {
    testString.includes("World");
  });

  bench("String indexOf", () => {
    testString.indexOf("World") !== -1;
  });

  bench("String split", () => {
    longString.split("x");
  });
});

describe("Array Operations", () => {
  const smallArray = Array.from({ length: 100 }, (_, i) => i);
  const largeArray = Array.from({ length: 10000 }, (_, i) => i);

  bench("Array.map", () => {
    smallArray.map((x) => x * 2);
  });

  bench("Array.filter", () => {
    smallArray.filter((x) => x % 2 === 0);
  });

  bench("Array.reduce", () => {
    smallArray.reduce((acc, x) => acc + x, 0);
  });

  bench("Array.find", () => {
    smallArray.find((x) => x === 50);
  });

  bench("Array.includes", () => {
    smallArray.includes(50);
  });

  bench("Array push (large)", () => {
    const arr = [...largeArray];
    arr.push(999);
  });

  bench("Array unshift (large)", () => {
    const arr = [...largeArray];
    arr.unshift(999);
  });
});

describe("Object Operations", () => {
  const smallObject = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`key${i}`, i]));
  const largeObject = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i]));

  bench("Object.keys", () => {
    Object.keys(largeObject);
  });

  bench("Object.values", () => {
    Object.values(largeObject);
  });

  bench("Object.entries", () => {
    Object.entries(largeObject);
  });

  bench("Object spread", () => {
    ({ ...smallObject, newKey: "value" });
  });

  bench("Object.assign", () => {
    Object.assign({}, smallObject, { newKey: "value" });
  });

  bench("Object property access", () => {
    const key = "key5";
    smallObject[key];
  });

  bench("Object.hasOwnProperty", () => {
    smallObject.hasOwnProperty("key5");
  });

  bench("'in' operator", () => {
    "key5" in smallObject;
  });
});

describe("JSON Operations", () => {
  const simpleData = { name: "Test", value: 123, nested: { flag: true } };
  const complexData = {
    users: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User${i}`,
      email: `user${i}@example.com`,
      active: i % 2 === 0,
    })),
  };

  bench("JSON.stringify (simple)", () => {
    JSON.stringify(simpleData);
  });

  bench("JSON.stringify (complex)", () => {
    JSON.stringify(complexData);
  });

  bench("JSON.parse (simple)", () => {
    JSON.parse('{"name":"Test","value":123,"nested":{"flag":true}}');
  });

  bench("JSON.parse (complex)", () => {
    const str = JSON.stringify(complexData);
    JSON.parse(str);
  });
});

describe("Date Operations", () => {
  bench("new Date()", () => {
    new Date();
  });

  bench("Date.now()", () => {
    Date.now();
  });

  bench("Date parsing ISO string", () => {
    new Date("2024-01-01T00:00:00.000Z");
  });

  bench("Date formatting toISOString", () => {
    new Date().toISOString();
  });

  bench("Date formatting toLocaleDateString", () => {
    new Date().toLocaleDateString();
  });
});
