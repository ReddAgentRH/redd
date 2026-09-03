// cli/src/exec/executor.ts
import type { MinimalProvider } from "../chain.js";
import { simulate } from "./simulate.js";

export interface Sender {
  buildAndSend(tx: { to: string; data: string; from: string }): Promise<string>;
}

export async function execute(input: {
  tx: { to: string; data: string };
  from: string;
  confirmed: boolean;
  provider: MinimalProvider;
  sender: Sender;
}): Promise<{ status: "sent" | "aborted"; txHash?: string; reason?: string }> {
  if (input.confirmed !== true) {
    return { status: "aborted", reason: "not confirmed" };
  }
  const sim = await simulate(input.provider, { to: input.tx.to, data: input.tx.data, from: input.from });
  if (!sim.ok) {
    return { status: "aborted", reason: sim.error ?? "simulation failed" };
  }
  const txHash = await input.sender.buildAndSend({ to: input.tx.to, data: input.tx.data, from: input.from });
  return { status: "sent", txHash };
}
