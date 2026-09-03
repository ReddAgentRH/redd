// cli/test/fee/planner.test.ts
import { describe, it, expect } from "vitest";
import { planBasket } from "../../src/fee/planner.js";
import { FeeBudget } from "../../src/fee/budget.js";

const baseCalls = [
  { to: "0x1111111111111111111111111111111111111111", data: "0xaa" },
  { to: "0x2222222222222222222222222222222222222222", data: "0xbb" },
  { to: "0x3333333333333333333333333333333333333333", data: "0xcc" },
  { to: "0x4444444444444444444444444444444444444444", data: "0xdd" }
];

describe("planBasket", () => {
  it("fires when cheap + within cap + budget ok, batching 4 into 1 tx", () => {
    const r = planBasket({
      calls: baseCalls, gasGwei: 0.9, capGwei: 1.5, recentGas: [1,2,3,4,5],
      budget: new FeeBudget(100), gasUnits: 120_000n, notionalUsd: 200, tradeFeeBps: 31, ethUsd: 3000
    });
    expect(r.action).toBe("fire");
    expect(r.txCount).toBe(1);
    expect(r.cost.totalUsd).toBeGreaterThan(0);
  });

  it("queues when gas is over the cap", () => {
    const r = planBasket({
      calls: baseCalls, gasGwei: 4.7, capGwei: 1.5, recentGas: [1,2,3,4,5],
      budget: new FeeBudget(100), gasUnits: 120_000n, notionalUsd: 200, tradeFeeBps: 31, ethUsd: 3000
    });
    expect(r.action).toBe("queue");
    expect(r.reason.toLowerCase()).toContain("cap");
  });
});
