// cli/test/exec/pons.test.ts
import { describe, it, expect } from "vitest";
import { PonsRouter } from "../../src/exec/pons.js";

const ROUTER = "0x0000000000000000000000000000000000000R01";

function providerReturning(amountOut: bigint) {
  return {
    async send() { return "0x0"; },
    async call() { return "0x" + amountOut.toString(16).padStart(64, "0"); }
  };
}

describe("PonsRouter", () => {
  it("quotes buy from the curve", async () => {
    const r = new PonsRouter(providerReturning(4200n), ROUTER);
    expect(await r.quoteBuy("0xtoken", 1000n)).toBe(4200n);
  });
  it("applies slippage in bps", () => {
    const r = new PonsRouter(providerReturning(0n), ROUTER);
    expect(r.applySlippage(1000n, 200)).toBe(980n); // 2%
  });
  it("encodes a buy to the router", () => {
    const r = new PonsRouter(providerReturning(0n), ROUTER);
    const tx = r.encodeBuy("0xtoken", 1000n, 980n, "0xme");
    expect(tx.to).toBe(ROUTER);
    expect(tx.data.startsWith("0x")).toBe(true);
    expect(tx.data.length).toBeGreaterThan(10);
  });
});
