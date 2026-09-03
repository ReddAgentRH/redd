// cli/test/exec/simulate.test.ts
import { describe, it, expect } from "vitest";
import { simulate } from "../../src/exec/simulate.js";

describe("simulate", () => {
  it("ok when eth_call returns", async () => {
    const p = { async send() { return "0x01"; }, async call() { return "0x01"; } };
    expect((await simulate(p, { to: "0xa", data: "0x", from: "0xme" })).ok).toBe(true);
  });
  it("not ok when eth_call reverts", async () => {
    const p = {
      async send() { throw new Error("execution reverted: slippage"); },
      async call() { throw new Error("execution reverted: slippage"); }
    };
    const r = await simulate(p, { to: "0xa", data: "0x", from: "0xme" });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("reverted");
  });
});
