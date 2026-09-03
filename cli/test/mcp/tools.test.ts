import { describe, it, expect } from "vitest";
import { gasHandler, portfolioHandler, quoteHandler, executeHandler } from "../../src/mcp/tools.js";
import { ReddChain } from "../../src/chain.js";
import { PonsRouter } from "../../src/exec/pons.js";

function provider() {
  return {
    async send() { return "0x" + (900_000_000n).toString(16); },       // 0.9 gwei
    async call() { return "0x" + (5n * 10n ** 18n).toString(16).padStart(64, "0"); } // 5e18
  };
}
const chain = new ReddChain(provider());
const router = new PonsRouter(provider(), "0x00000000000000000000000000000000000000R1");
const deps = { chain, router, reddAddr: "0x00000000000000000000000000000000000000dd" };

describe("mcp tool handlers", () => {
  it("gas", async () => { expect((await gasHandler(deps)).gwei).toBeCloseTo(0.9, 6); });
  it("portfolio", async () => { expect((await portfolioHandler(deps, "0x00000000000000000000000000000000000000ee")).redd).toBe("5"); });
  it("quote applies slippage", async () => {
    const q = await quoteHandler(deps, "0x00000000000000000000000000000000000000cc", "1000000000000000000");
    expect(BigInt(q.minOut) < BigInt(q.out)).toBe(true);
  });
  it("execute is never signed by the mcp process", async () => {
    const r = await executeHandler(deps, "0x00000000000000000000000000000000000000cc", "1000000000000000000", true);
    expect(r.status).toBe("needs_local_signing");
    const d = await executeHandler(deps, "0x00000000000000000000000000000000000000cc", "1000000000000000000", false);
    expect(d.status).toBe("dry_run");
  });
});
