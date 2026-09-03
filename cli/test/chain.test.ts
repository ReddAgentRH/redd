import { describe, it, expect } from "vitest";
import { ReddChain } from "../src/chain.js";

function fakeProvider(map: Record<string, string>, gasWei: bigint) {
  return {
    async send(method: string) {
      if (method === "eth_gasPrice") return "0x" + gasWei.toString(16);
      throw new Error("unexpected send " + method);
    },
    async call(tx: { to: string; data: string }) {
      // key by 4-byte selector
      const sel = tx.data.slice(0, 10);
      if (!(sel in map)) throw new Error("no stub for " + sel);
      return map[sel];
    }
  };
}

const BAL_SEL = "0x70a08231"; // balanceOf(address)
const DEC_SEL = "0x313ce567"; // decimals()

describe("ReddChain", () => {
  it("converts gas price to gwei", async () => {
    const c = new ReddChain(fakeProvider({}, 900_000_000n)); // 0.9 gwei
    expect(await c.gasPriceGwei()).toBeCloseTo(0.9, 6);
  });

  it("reads erc20 balance and decimals", async () => {
    const c = new ReddChain(
      fakeProvider(
        {
          [BAL_SEL]: "0x" + (1234n).toString(16).padStart(64, "0"),
          [DEC_SEL]: "0x" + (18n).toString(16).padStart(64, "0")
        },
        0n
      )
    );
    expect(await c.erc20Balance("0xtoken", "0xowner")).toBe(1234n);
    expect(await c.erc20Decimals("0xtoken")).toBe(18);
  });
});
