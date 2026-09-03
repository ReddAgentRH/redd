import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolDeps } from "./tools.js";
import { gasHandler, portfolioHandler, quoteHandler, executeHandler } from "./tools.js";

function text(result: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
}

export function buildMcpServer(deps: ToolDeps): McpServer {
  const server = new McpServer({ name: "redd", version: "0.1.0" });

  server.tool("redd_gas", "Current Robinhood Chain gas in gwei", {}, async () => text(await gasHandler(deps)));

  server.tool("redd_portfolio", "A wallet's $REDD balance on pons",
    { owner: z.string() }, async ({ owner }) => text(await portfolioHandler(deps, owner)));

  server.tool("redd_quote", "Quote a pons buy (with 2% slippage)",
    { token: z.string(), amountInRedd: z.string() },
    async ({ token, amountInRedd }) => text(await quoteHandler(deps, token, amountInRedd)));

  server.tool("redd_execute", "Plan a pons buy. Never signs — returns a plan for local signing.",
    { token: z.string(), amountInRedd: z.string(), confirmed: z.boolean().default(false) },
    async ({ token, amountInRedd, confirmed }) => text(await executeHandler(deps, token, amountInRedd, confirmed)));

  return server;
}
