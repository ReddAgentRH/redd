// cli/src/exec/sender.ts
import { JsonRpcProvider, Wallet } from "ethers";
import type { Sender } from "./executor.js";

export function makeEthersSender(
  rpcUrl: string,
  chainId: number,
  keystoreJson: string,
  password: string
): Sender {
  return {
    async buildAndSend(tx) {
      const provider = new JsonRpcProvider(rpcUrl, chainId);
      const wallet = (await Wallet.fromEncryptedJson(keystoreJson, password)).connect(provider);
      const sent = await wallet.sendTransaction({ to: tx.to, data: tx.data });
      return sent.hash;
    }
  };
}
