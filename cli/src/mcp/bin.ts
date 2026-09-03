import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { JsonRpcProvider } from "ethers";
import { loadConfig } from "../config.js";
import { ReddChain } from "../chain.js";
import { PonsRouter } from "../exec/pons.js";
import { buildMcpServer } from "./server.js";

const config = loadConfig();
const provider = new JsonRpcProvider(config.rpcUrl, config.chainId);
const chain = new ReddChain({ send: (m, p) => provider.send(m, p ?? []), call: (tx) => provider.call(tx) });
const router = new PonsRouter(
  { send: (m, p) => provider.send(m, p ?? []), call: (tx) => provider.call(tx) },
  process.env.REDD_ADDR_PONS_ROUTER || ""
);
const server = buildMcpServer({ chain, router, reddAddr: config.addresses.redd });
await server.connect(new StdioServerTransport());
