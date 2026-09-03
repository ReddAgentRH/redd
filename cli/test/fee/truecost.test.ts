// cli/test/fee/truecost.test.ts
import { describe, it, expect } from "vitest";
import { trueCost } from "../../src/fee/truecost.js";

describe("trueCost", () => {
  it("computes gas + trading fee in USD", () => {
    // 100k gas units at 0.9 gwei, ETH=$3000, $200 notional, 31 bps fee
    const r = trueCost({ gasUnits: 100_000n, gasGwei: 0.9, notionalUsd: 200, tradeFeeBps: 31, ethUsd: 3000 });
    // gasUsd = 100000 * 0.9e-9 ETH * 3000 = 0.00009 ETH * 3000 = 0.27
    expect(r.gasUsd).toBeCloseTo(0.27, 6);
    expect(r.tradeFeeUsd).toBeCloseTo(0.62, 6); // 200 * 31/10000
    expect(r.totalUsd).toBeCloseTo(0.89, 6);
  });
});
