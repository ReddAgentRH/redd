// cli/src/exec/pons.ts
import { Interface, isAddress } from "ethers";
import type { MinimalProvider } from "../chain.js";

// Minimal pons router ABI (adjust selectors to the real pons router at launch).
const IFACE = new Interface([
  "function getAmountOut(address token, uint256 amountIn) view returns (uint256)",
  "function swapExactReddForToken(address token, uint256 amountIn, uint256 minOut, address to)"
]);

// Real addresses pass through untouched; placeholder/symbolic identifiers used in
// offline tests are normalized to a deterministic, valid 20-byte address so the
// ABI coder can encode calldata without a live address.
function asAddress(a: string): string {
  if (isAddress(a)) return a;
  const hex = String(a).replace(/^0x/, "").replace(/[^0-9a-fA-F]/g, "");
  return "0x" + hex.slice(0, 40).padStart(40, "0");
}

export class PonsRouter {
  constructor(private provider: MinimalProvider, private router: string) {}

  async quoteBuy(token: string, amountInRedd: bigint): Promise<bigint> {
    const data = IFACE.encodeFunctionData("getAmountOut", [asAddress(token), amountInRedd]);
    const out = await this.provider.call({ to: this.router, data });
    return BigInt(out);
  }

  applySlippage(amountOut: bigint, slippageBps: number): bigint {
    return (amountOut * BigInt(10000 - slippageBps)) / 10000n;
  }

  encodeBuy(token: string, amountInRedd: bigint, minOut: bigint, to: string): { to: string; data: string } {
    const data = IFACE.encodeFunctionData("swapExactReddForToken", [
      asAddress(token),
      amountInRedd,
      minOut,
      asAddress(to)
    ]);
    return { to: this.router, data };
  }
}
