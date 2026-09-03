// cli/test/exec/sender.test.ts
import { describe, it, expect } from "vitest";
import { makeEthersSender } from "../../src/exec/sender.js";
import { createKeystore } from "../../src/wallet.js";

const PK = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

describe("makeEthersSender", () => {
  it("returns a Sender with buildAndSend (no network needed to construct)", async () => {
    const json = await createKeystore(PK, "pw123456");
    const s = makeEthersSender("http://localhost:8545", 4663, json, "pw123456");
    expect(typeof s.buildAndSend).toBe("function");
  });
});
