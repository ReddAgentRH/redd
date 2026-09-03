// cli/test/fee/gas.test.ts
import { describe, it, expect } from "vitest";
import { withinCap, isCheap } from "../../src/fee/gas.js";

describe("gas guardian", () => {
  it("withinCap", () => {
    expect(withinCap(0.9, 1.5)).toBe(true);
    expect(withinCap(4.7, 1.5)).toBe(false);
  });
  it("isCheap uses a quantile of recent samples", () => {
    const recent = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(isCheap(3, recent, 0.4)).toBe(true);   // 40th pct ~4 -> 3 is cheap
    expect(isCheap(9, recent, 0.4)).toBe(false);
  });
  it("empty history never blocks", () => {
    expect(isCheap(100, [], 0.4)).toBe(true);
  });
});
