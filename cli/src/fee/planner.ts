// cli/src/fee/planner.ts
import { withinCap, isCheap } from "./gas.js";
import { FeeBudget } from "./budget.js";
import { aggregate, Call } from "./batch.js";
import { trueCost } from "./truecost.js";

export function planBasket(input: {
  calls: Call[];
  gasGwei: number;
  capGwei: number;
  recentGas: number[];
  budget: FeeBudget;
  gasUnits: bigint;
  notionalUsd: number;
  tradeFeeBps: number;
  ethUsd: number;
}) {
  const batched = aggregate(input.calls);
  const cost = trueCost({
    gasUnits: input.gasUnits,
    gasGwei: input.gasGwei,
    notionalUsd: input.notionalUsd,
    tradeFeeBps: input.tradeFeeBps,
    ethUsd: input.ethUsd
  });

  const capOk = withinCap(input.gasGwei, input.capGwei);
  const cheap = isCheap(input.gasGwei, input.recentGas);
  const budgetEval = input.budget.evaluate(input.gasGwei);

  let action: "fire" | "queue" = "fire";
  let reason = "cheap window, within cap and budget";
  if (!capOk) { action = "queue"; reason = "gas over your cap; waiting for a cheaper window"; }
  else if (!cheap) { action = "queue"; reason = "gas above recent cheap range; waiting"; }
  else if (budgetEval.decision === "queued") { action = "queue"; reason = budgetEval.reason; }

  return { action, txCount: 1, batched: { to: batched.to, data: batched.data }, cost, reason };
}
