// cli/test/daemon/decide.test.ts
import { describe, it, expect } from "vitest";
import { decide } from "../../src/daemon/decide.js";

describe("daemon decide", () => {
  it("fires DCA when the interval elapsed", () => {
    const out = decide({
      nowTs: 1000, dca: [{ token: "RDDT", usdPerRun: 50, intervalSec: 100, lastRunTs: 850 }],
      sltp: [], prices: { RDDT: 148 }
    });
    expect(out).toContainEqual({ kind: "dca", token: "RDDT", usd: 50 });
  });
  it("does not fire DCA before the interval", () => {
    const out = decide({
      nowTs: 1000, dca: [{ token: "RDDT", usdPerRun: 50, intervalSec: 100, lastRunTs: 950 }],
      sltp: [], prices: { RDDT: 148 }
    });
    expect(out.length).toBe(0);
  });
  it("triggers stop-loss and take-profit", () => {
    const stop = decide({ nowTs: 0, dca: [], sltp: [{ token: "RDDT", entryUsd: 100, stopPct: 0.1, takePct: 0.5 }], prices: { RDDT: 89 } });
    expect(stop).toContainEqual({ kind: "sell", token: "RDDT", reason: "stop" });
    const take = decide({ nowTs: 0, dca: [], sltp: [{ token: "RDDT", entryUsd: 100, stopPct: 0.1, takePct: 0.5 }], prices: { RDDT: 151 } });
    expect(take).toContainEqual({ kind: "sell", token: "RDDT", reason: "take" });
  });
});
