export interface MinimalProvider {
  send(method: string, params?: any[]): Promise<any>;
  call(tx: { to: string; data: string }): Promise<string>;
}

const SEL_BALANCE_OF = "0x70a08231";
const SEL_DECIMALS = "0x313ce567";

function pad32(hexNo0x: string): string {
  return hexNo0x.padStart(64, "0");
}

export class ReddChain {
  constructor(private provider: MinimalProvider) {}

  get raw(): MinimalProvider {
    return this.provider;
  }

  async gasPriceGwei(): Promise<number> {
    const hex = await this.provider.send("eth_gasPrice", []);
    const wei = BigInt(hex);
    return Number(wei) / 1e9;
  }

  async erc20Balance(token: string, owner: string): Promise<bigint> {
    const addr = owner.toLowerCase().replace(/^0x/, "");
    const data = SEL_BALANCE_OF + pad32(addr);
    const out = await this.provider.call({ to: token, data });
    return BigInt(out);
  }

  async erc20Decimals(token: string): Promise<number> {
    const out = await this.provider.call({ to: token, data: SEL_DECIMALS });
    return Number(BigInt(out));
  }
}
