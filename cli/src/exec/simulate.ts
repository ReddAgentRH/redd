// cli/src/exec/simulate.ts
import type { MinimalProvider } from "../chain.js";

export async function simulate(
  provider: MinimalProvider,
  tx: { to: string; data: string; from: string }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await provider.send("eth_call", [{ to: tx.to, data: tx.data, from: tx.from }, "latest"]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
