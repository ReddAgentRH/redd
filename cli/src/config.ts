export interface ReddConfig {
  chainId: number;
  rpcUrl: string;
  addresses: { redd: string; agent: string; reserve: string };
}

const DEFAULT_RPC = "https://rpc.mainnet.chain.robinhood.com"; // Robinhood Chain 4663

// Live mainnet addresses (Robinhood Chain 4663). Env vars override.
const DEFAULT_REDD = "0xd19742b3f6cA3A4D9C3632a6ac2f6829bB111E9b"; // $REDD (pons)
const DEFAULT_AGENT = "0x9aacC5d765Cf95E7A34D544db2CeAC375FE88445"; // ReddAgent
const DEFAULT_RESERVE = "0x0A040C416b9B510777A47CaF81c62675692e9208"; // ReddCredits

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ReddConfig {
  return {
    chainId: env.REDD_CHAIN_ID ? Number(env.REDD_CHAIN_ID) : 4663,
    rpcUrl: env.REDD_RPC_URL || DEFAULT_RPC,
    addresses: {
      redd: env.REDD_ADDR_REDD || DEFAULT_REDD,
      agent: env.REDD_ADDR_AGENT || DEFAULT_AGENT,
      reserve: env.REDD_ADDR_RESERVE || DEFAULT_RESERVE
    }
  };
}
