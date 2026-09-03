// cli/test/memory/root.test.ts
import { describe, it, expect } from "vitest";
import { memoryRoot } from "../../src/memory/root.js";
import { emptyMemory } from "../../src/memory/model.js";

describe("memoryRoot", () => {
  it("is a 32-byte hex and deterministic", () => {
    const r1 = memoryRoot(emptyMemory());
    const r2 = memoryRoot(emptyMemory());
    expect(r1).toBe(r2);
    expect(/^0x[0-9a-f]{64}$/.test(r1)).toBe(true);
  });
  it("changes when memory changes", () => {
    const m = emptyMemory();
    const before = memoryRoot(m);
    m.watchlist.push("RDDT");
    expect(memoryRoot(m)).not.toBe(before);
  });
});
