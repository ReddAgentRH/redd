// cli/test/daemon/guard.test.ts
import { describe, it, expect } from "vitest";
import { guard } from "../../src/daemon/guard.js";

const act = { kind: "dca", token: "RDDT", usd: 50 } as const;

describe("fail-safe guard", () => {
  it("proceeds only when fuel ok, within cap, sim ok", () => {
    expect(guard(act, { fuelRedd: 100, fuelCostRedd: 1, withinCap: true, simOk: true }).proceed).toBe(true);
  });
  it("pauses when out of fuel", () => {
    const r = guard(act, { fuelRedd: 0, fuelCostRedd: 1, withinCap: true, simOk: true });
    expect(r.proceed).toBe(false);
    expect(r.reason.toLowerCase()).toContain("fuel");
  });
  it("pauses when over cap", () => {
    expect(guard(act, { fuelRedd: 100, fuelCostRedd: 1, withinCap: false, simOk: true }).proceed).toBe(false);
  });
  it("pauses when simulation fails", () => {
    const r = guard(act, { fuelRedd: 100, fuelCostRedd: 1, withinCap: true, simOk: false });
    expect(r.proceed).toBe(false);
    expect(r.reason.toLowerCase()).toContain("sim");
  });
});
