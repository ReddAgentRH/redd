// cli/test/exec/dispatch-buy.test.ts
import { describe, it, expect } from "vitest";
import { dispatch } from "../../src/dispatch.js";
import { ReddChain } from "../../src/chain.js";
import { loadConfig } from "../../src/config.js";
import { PonsRouter } from "../../src/exec/pons.js";

const provider = {
  async send() { return "0x" + (900_000_000n).toString(16); },
  async call() { return "0x" + (4200n).toString(16).padStart(64, "0"); }
};
const chain = new ReddChain(provider);
const router = new PonsRouter(provider, "0xrouter");
const sender = { async buildAndSend() { return "0xfeed"; } };
const baseDeps = { chain, config: loadConfig({ REDD_ADDR_REDD: "0xredd" }), ownerAddress: "0xme" };

describe("dispatch buy with exec", () => {
  it("confirmed buy sends and returns tx hash", async () => {
    const out = await dispatch(
      { kind: "buy", token: "0xtoken", amountUsd: 100 },
      { ...baseDeps, exec: { router, sender, confirmed: true } }
    );
    expect(out).toContain("0xfeed");
  });
  it("unconfirmed buy never sends", async () => {
    const out = await dispatch(
      { kind: "buy", token: "0xtoken", amountUsd: 100 },
      { ...baseDeps, exec: { router, sender, confirmed: false } }
    );
    expect(out.toLowerCase()).toContain("not confirmed");
  });
});
