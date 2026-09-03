// cli/src/fee/batch.ts
import { Interface } from "ethers";

export type Call = { to: string; data: string; allowFailure?: boolean };

export const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";

const IFACE = new Interface([
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)"
]);

export function aggregate(calls: Call[]): { to: string; data: string; count: number } {
  if (calls.length === 0) throw new Error("empty batch");
  const encoded = calls.map((c) => ({
    target: c.to,
    allowFailure: c.allowFailure ?? false,
    callData: c.data
  }));
  const data = IFACE.encodeFunctionData("aggregate3", [encoded]);
  return { to: MULTICALL3, data, count: calls.length };
}
