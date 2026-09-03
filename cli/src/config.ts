export interface ReddConfig {
  chainId: number;
  rpcUrl: string;
  addresses: { redd: string; agent: string; reserve: string };
}

const DEFAULT_RPC = "https://rpc.robinhoodchain.example"; // replace with real RH RPC at launch

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ReddConfig {
  return {
    chainId: env.REDD_CHAIN_ID ? Number(env.REDD_CHAIN_ID) : 4663,
    rpcUrl: env.REDD_RPC_URL || DEFAULT_RPC,
    addresses: {
      redd: env.REDD_ADDR_REDD || "",
      agent: env.REDD_ADDR_AGENT || "",
      reserve: env.REDD_ADDR_RESERVE || ""
    }
  };
}
