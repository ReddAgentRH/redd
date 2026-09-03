// cli/test/fee/batch.test.ts
import { describe, it, expect } from "vitest";
import { aggregate, MULTICALL3 } from "../../src/fee/batch.js";

describe("Batcher", () => {
  it("bundles many calls into one tx to Multicall3", () => {
    const calls = [
      { to: "0x1111111111111111111111111111111111111111", data: "0xaabbccdd" },
      { to: "0x2222222222222222222222222222222222222222", data: "0x11223344" },
      { to: "0x3333333333333333333333333333333333333333", data: "0x55667788" }
    ];
    const out = aggregate(calls);
    expect(out.to).toBe(MULTICALL3);
    expect(out.count).toBe(3);
    expect(out.data.startsWith("0x82ad56cb")).toBe(true); // aggregate3 selector
  });

  it("throws on empty batch", () => {
    expect(() => aggregate([])).toThrow("empty batch");
  });
});
