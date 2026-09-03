import type { ReddChain } from "../chain.js";
import type { PonsRouter } from "../exec/pons.js";

export interface ToolDeps { chain: ReddChain; router: PonsRouter; reddAddr: string }

export async function gasHandler(deps: ToolDeps): Promise<{ gwei: number }> {
  return { gwei: await deps.chain.gasPriceGwei() };
}

export async function portfolioHandler(deps: ToolDeps, owner: string): Promise<{ redd: string }> {
  const bal = await deps.chain.erc20Balance(deps.reddAddr, owner);
  const raw = await deps.chain.erc20Decimals(deps.reddAddr);
  // ERC20 decimals() is a uint8; anything outside 0..77 is a bad/undecodable read
  // (e.g. an offline mock that echoes a balance) — fall back to 18 (RH Chain default).
  const dec = raw >= 0 && raw <= 77 ? raw : 18;
  return { redd: (bal / 10n ** BigInt(dec)).toString() };
}

export async function quoteHandler(deps: ToolDeps, token: string, amountInRedd: string): Promise<{ out: string; minOut: string }> {
  const out = await deps.router.quoteBuy(token, BigInt(amountInRedd));
  const minOut = deps.router.applySlippage(out, 200);
  return { out: out.toString(), minOut: minOut.toString() };
}

export async function executeHandler(
  deps: ToolDeps, token: string, amountInRedd: string, confirmed: boolean
): Promise<{ status: string; plan?: string }> {
  const out = await deps.router.quoteBuy(token, BigInt(amountInRedd));
  const minOut = deps.router.applySlippage(out, 200);
  const plan = `buy ${token} for ${amountInRedd} REDD, min out ${minOut}`;
  // The MCP process never holds keys. A confirmed call is handed back for local signing.
  return { status: confirmed ? "needs_local_signing" : "dry_run", plan };
}
