import { describe, it, expect } from "vitest";
import { dispatch } from "../src/dispatch.js";
import { ReddChain } from "../src/chain.js";
import { loadConfig } from "../src/config.js";

function fakeProvider() {
  return {
    async send() { return "0x" + (900_000_000n).toString(16); }, // 0.9 gwei
    async call() { return "0x" + (5n * 10n ** 18n).toString(16).padStart(64, "0"); } // balance 5e18
  };
}

const deps = {
  chain: new ReddChain(fakeProvider()),
  config: loadConfig({ REDD_ADDR_REDD: "0xredd" }),
  ownerAddress: "0xowner"
};

describe("dispatch", () => {
  it("gas returns gwei", async () => {
    const out = await dispatch({ kind: "gas" }, deps);
    expect(out).toContain("0.9");
    expect(out.toLowerCase()).toContain("gwei");
  });
  it("buy returns a dry-run plan and never claims execution", async () => {
    const out = await dispatch({ kind: "buy", token: "RDDT", amountUsd: 200 }, deps);
    expect(out.toLowerCase()).toContain("dry-run");
    expect(out).toContain("RDDT");
    expect(out).toContain("200");
  });
  it("unknown is explained", async () => {
    const out = await dispatch({ kind: "unknown", text: "xyz" }, deps);
    expect(out.toLowerCase()).toContain("didn't understand");
  });
});
