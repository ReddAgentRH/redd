import { describe, it, expect } from "vitest";
import { createKeystore, unlockKeystore, redactSecret } from "../src/wallet.js";

// deterministic test key (well-known throwaway, never used on-chain)
const PK = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const ADDR = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

describe("wallet", () => {
  it("round-trips an encrypted keystore and exposes address + sign only", async () => {
    const json = await createKeystore(PK, "pw123456");
    const w = await unlockKeystore(json, "pw123456");
    expect(w.address).toBe(ADDR);
    expect((w as any).privateKey).toBeUndefined();
    const sig = await w.sign("0x" + "11".repeat(32));
    expect(sig.startsWith("0x")).toBe(true);
  });

  it("redacts private-key-looking strings", () => {
    expect(redactSecret(PK)).toBe("[redacted]");
    expect(redactSecret("hello world")).toBe("hello world");
  });
});
