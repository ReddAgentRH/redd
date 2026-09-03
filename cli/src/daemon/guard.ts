// cli/src/daemon/guard.ts
import type { DaemonAction } from "./decide.js";

export function guard(
  _action: DaemonAction,
  ctx: { fuelRedd: number; fuelCostRedd: number; withinCap: boolean; simOk: boolean }
): { proceed: boolean; reason: string } {
  if (ctx.fuelRedd < ctx.fuelCostRedd) return { proceed: false, reason: "out of fuel — agent paused, funds untouched" };
  if (!ctx.withinCap) return { proceed: false, reason: "over fee cap — paused, waiting for a cheaper window" };
  if (!ctx.simOk) return { proceed: false, reason: "simulation failed — paused, nothing sent" };
  return { proceed: true, reason: "all guards passed" };
}
