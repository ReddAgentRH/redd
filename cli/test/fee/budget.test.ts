// cli/test/fee/budget.test.ts
import { describe, it, expect } from "vitest";
import { FeeBudget } from "../../src/fee/budget.js";

describe("FeeBudget", () => {
  it("queues when over the daily cap and tracks remaining", () => {
    const b = new FeeBudget(10);
    expect(b.evaluate(4).decision).toBe("ok");
    b.record(4);
    expect(b.remaining()).toBe(6);
    expect(b.evaluate(5).decision).toBe("ok");
    b.record(5);
    expect(b.evaluate(2).decision).toBe("queued");
    expect(b.remaining()).toBe(1);
  });
});
