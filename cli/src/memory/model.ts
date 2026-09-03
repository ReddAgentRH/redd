// cli/src/memory/model.ts
export interface Trade { ts: number; token: string; side: "buy" | "sell"; amountUsd: number; reason?: string }
export interface Memory {
  watchlist: string[];
  trades: Trade[];
  prefs: Record<string, string>;
  strategies: Record<string, string>;
}

export function emptyMemory(): Memory {
  return { watchlist: [], trades: [], prefs: {}, strategies: {} };
}

function sortValue(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortValue);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      out[k] = sortValue((v as Record<string, unknown>)[k]);
    }
    return out;
  }
  return v;
}

export function canonicalize(m: Memory): string {
  return JSON.stringify(sortValue(m));
}
