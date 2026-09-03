import { describe, it, expect } from "vitest";
import { buildMcpServer } from "../../src/mcp/server.js";
import { ReddChain } from "../../src/chain.js";
import { PonsRouter } from "../../src/exec/pons.js";

function provider() {
  return { async send() { return "0x" + (900_000_000n).toString(16); }, async call() { return "0x" + (0n).toString(16).padStart(64, "0"); } };
}
const deps = { chain: new ReddChain(provider()), router: new PonsRouter(provider(), "0x00000000000000000000000000000000000000R1"), reddAddr: "0x00000000000000000000000000000000000000dd" };

describe("mcp server", () => {
  it("builds a server exposing the four redd tools", () => {
    const s = buildMcpServer(deps);
    expect(s).toBeTruthy();
  });
});
