// cli/test/memory/model.test.ts
import { describe, it, expect } from "vitest";
import { emptyMemory, canonicalize, Memory } from "../../src/memory/model.js";

describe("memory model", () => {
  it("canonicalizes identically regardless of key order", () => {
    const a: Memory = { watchlist: ["RDDT"], trades: [], prefs: { risk: "low", tz: "UTC" }, strategies: {} };
    const b: Memory = { watchlist: ["RDDT"], trades: [], prefs: { tz: "UTC", risk: "low" }, strategies: {} };
    expect(canonicalize(a)).toBe(canonicalize(b));
  });
  it("empty memory is stable", () => {
    expect(canonicalize(emptyMemory())).toBe(canonicalize(emptyMemory()));
  });
});
