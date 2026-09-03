import type { Intent } from "./intent.js";
import type { ReddChain } from "./chain.js";
import type { ReddConfig } from "./config.js";
import type { PonsRouter } from "./exec/pons.js";
import { execute, Sender } from "./exec/executor.js";

export interface DispatchDeps {
  chain: ReddChain;
  config: ReddConfig;
  ownerAddress: string;
  exec?: { router: PonsRouter; sender: Sender; confirmed: boolean };
}

export async function dispatch(intent: Intent, deps: DispatchDeps): Promise<string> {
  switch (intent.kind) {
    case "gas": {
      const g = await deps.chain.gasPriceGwei();
      return `Network gas is ${g} gwei.`;
    }
    case "portfolio": {
      if (!deps.config.addresses.redd) return "No $REDD address configured yet.";
      const bal = await deps.chain.erc20Balance(deps.config.addresses.redd, deps.ownerAddress);
      const dec = await deps.chain.erc20Decimals(deps.config.addresses.redd);
      const whole = bal / 10n ** BigInt(dec);
      return `$REDD balance: ${whole.toString()}`;
    }
    case "price":
      return `Price lookup for ${intent.token} is not wired in this build.`;
    case "buy": {
      const g = await deps.chain.gasPriceGwei();
      if (!deps.exec) {
        return [
          `Dry-run plan:`,
          `  buy ${intent.token} with $${intent.amountUsd}`,
          `  current gas ${g} gwei (Fee Guardian would wait for a cheap window)`,
          `  nothing signed, nothing sent.`
        ].join("\n");
      }
      // NOTE: amountInRedd here is illustrative; a price oracle converts USD->REDD in a later step.
      const amountInRedd = BigInt(Math.round(intent.amountUsd)) * 10n ** 18n;
      const quoted = await deps.exec.router.quoteBuy(intent.token, amountInRedd);
      const minOut = deps.exec.router.applySlippage(quoted, 200);
      const tx = deps.exec.router.encodeBuy(intent.token, amountInRedd, minOut, deps.ownerAddress);
      const res = await execute({
        tx, from: deps.ownerAddress, confirmed: deps.exec.confirmed,
        provider: deps.chain.raw,
        sender: deps.exec.sender
      });
      if (res.status === "sent") return `Sent. tx ${res.txHash}. Bought ${intent.token} (min out ${minOut}).`;
      return `Not sent: ${res.reason}.`;
    }
    case "unknown":
      return `I didn't understand: "${intent.text}". Try: portfolio, gas, or "buy $100 RDDT".`;
  }
}
