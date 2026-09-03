# REDD MCP server

Expose REDD's pons execution to any MCP host (Claude Desktop, agents).

## Install
    npm i -g @redd/cli

## Claude Desktop (claude_desktop_config.json)
    {
      "mcpServers": {
        "redd": {
          "command": "redd-mcp",
          "env": {
            "REDD_RPC_URL": "<Robinhood Chain RPC>",
            "REDD_ADDR_REDD": "<$REDD CA>",
            "REDD_ADDR_PONS_ROUTER": "<pons router>"
          }
        }
      }
    }

## Tools
- `redd_gas` — current gas
- `redd_portfolio` — a wallet's $REDD balance
- `redd_quote` — quote a pons buy
- `redd_execute` — plan a buy (never signs; returns a plan for local signing)

Non-custodial: the MCP process holds no keys. Execution is planned here and signed locally.
