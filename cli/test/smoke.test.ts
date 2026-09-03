// cli/test/smoke.test.ts
import { describe, it, expect } from "vitest";
import { buildProgram } from "../src/index.js";

describe("cli", () => {
  it("builds a program named redd", () => {
    const p = buildProgram();
    expect(p.name()).toBe("redd");
  });
});
