// cli/test/exec/executor.test.ts
import { describe, it, expect } from "vitest";
import { execute } from "../../src/exec/executor.js";

const okProvider = { async send() { return "0x01"; }, async call() { return "0x01"; } };
const revProvider = { async send() { throw new Error("execution reverted"); }, async call() { throw new Error("x"); } };
const sender = { async buildAndSend() { return "0xdeadbeef"; } };
const tx = { to: "0xrouter", data: "0xabcd" };

describe("execute", () => {
  it("aborts when not confirmed and never sends", async () => {
    let sent = false;
    const spy = { async buildAndSend() { sent = true; return "0x"; } };
    const r = await execute({ tx, from: "0xme", confirmed: false, provider: okProvider, sender: spy });
    expect(r.status).toBe("aborted");
    expect(sent).toBe(false);
  });
  it("aborts when simulation reverts", async () => {
    const r = await execute({ tx, from: "0xme", confirmed: true, provider: revProvider, sender });
    expect(r.status).toBe("aborted");
    expect(r.reason).toContain("reverted");
  });
  it("sends when confirmed and sim ok", async () => {
    const r = await execute({ tx, from: "0xme", confirmed: true, provider: okProvider, sender });
    expect(r.status).toBe("sent");
    expect(r.txHash).toBe("0xdeadbeef");
  });
});
