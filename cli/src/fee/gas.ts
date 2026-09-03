// cli/src/fee/gas.ts
export function withinCap(gwei: number, capGwei: number): boolean {
  return gwei <= capGwei;
}

export function isCheap(gwei: number, recent: number[], pct = 0.4): boolean {
  if (recent.length === 0) return true;
  const sorted = [...recent].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(pct * (sorted.length - 1)));
  const threshold = sorted[idx];
  return gwei <= threshold;
}
