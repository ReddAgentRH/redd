// cli/test/memory/store.test.ts
import { describe, it, expect } from "vitest";
import { seal, open } from "../../src/memory/store.js";
import { emptyMemory } from "../../src/memory/model.js";

describe("encrypted store", () => {
  it("round-trips sealed memory", () => {
    const m = emptyMemory();
    m.watchlist.push("RDDT");
    const blob = seal(m, "pw123456");
    expect(blob).not.toContain("RDDT"); // ciphertext, not plaintext
    const back = open(blob, "pw123456");
    expect(back.watchlist).toEqual(["RDDT"]);
  });
  it("wrong password fails closed", () => {
    const blob = seal(emptyMemory(), "right-pw");
    expect(() => open(blob, "wrong-pw")).toThrow("bad password or corrupt memory");
  });
});
