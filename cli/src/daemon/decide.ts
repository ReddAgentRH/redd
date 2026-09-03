// cli/src/daemon/decide.ts
export interface DcaRule { token: string; usdPerRun: number; intervalSec: number; lastRunTs: number }
export interface SlTpRule { token: string; entryUsd: number; stopPct: number; takePct: number }
export type DaemonAction =
  | { kind: "dca"; token: string; usd: number }
  | { kind: "sell"; token: string; reason: "stop" | "take" };

export function decide(input: {
  nowTs: number;
  dca: DcaRule[];
  sltp: SlTpRule[];
  prices: Record<string, number>;
}): DaemonAction[] {
  const actions: DaemonAction[] = [];

  for (const r of input.dca) {
    if (input.nowTs - r.lastRunTs >= r.intervalSec) {
      actions.push({ kind: "dca", token: r.token, usd: r.usdPerRun });
    }
  }

  for (const r of input.sltp) {
    const p = input.prices[r.token];
    if (p === undefined) continue;
    if (p <= r.entryUsd * (1 - r.stopPct)) actions.push({ kind: "sell", token: r.token, reason: "stop" });
    else if (p >= r.entryUsd * (1 + r.takePct)) actions.push({ kind: "sell", token: r.token, reason: "take" });
  }

  return actions;
}
