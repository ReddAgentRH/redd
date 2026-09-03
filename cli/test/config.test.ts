import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

describe("config", () => {
  it("uses defaults when env is empty", () => {
    const c = loadConfig({});
    expect(c.chainId).toBe(4663);
    expect(c.rpcUrl).toContain("http");
    expect(c.addresses.redd).toBe("");
  });
  it("overrides from env", () => {
    const c = loadConfig({ REDD_RPC_URL: "https://x.example", REDD_ADDR_REDD: "0xabc" });
    expect(c.rpcUrl).toBe("https://x.example");
    expect(c.addresses.redd).toBe("0xabc");
  });
});
