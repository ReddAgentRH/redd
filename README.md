# REDD

[![CI](https://github.com/ReddAgentRH/redd/actions/workflows/ci.yml/badge.svg)](https://github.com/ReddAgentRH/redd/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
![coverage](https://img.shields.io/badge/contracts%20coverage-80%25-brightgreen)
![Solidity](https://img.shields.io/badge/solidity-0.8.24-363636)
![TypeScript](https://img.shields.io/badge/typescript-5-3178c6)
![Robinhood Chain](https://img.shields.io/badge/chain-Robinhood%204663-ff4500)

**DeFi agent for Robinhood Chain. Remembers your strategy. Guards every fee. Signs nothing without you.**

REDD is a non-custodial, natural-language trading agent for Robinhood Chain (pons). Talk to it in your own terminal — it remembers your strategies and trades on-chain, guards every transaction's cost, and can run automation while you sleep. Your keys never leave your machine.

$REDD fair-launches on pons, paired with tokenized Reddit stock ($RDDT).

- X: https://x.com/ReddAgentRH

This repository is the open-source utility: the smart contracts and the CLI.

## What's here

```
contract/   Solidity (Foundry) — the on-chain layer
cli/        TypeScript CLI (@redd/cli) — wallet, chain client, intent parser,
            fee guardian, memory + daemon, execution, and an MCP server (redd-mcp)
```

## Architecture

```
  you (plain language: "buy $100 RDDT, guard the fees")
        │
        ▼
  ┌──────────────────────────── REDD CLI ────────────────────────────┐
  │  intent parser  →  planner  →  Fee Guardian  →  executor          │
  │                                 · gas timing     · simulate (eth_call)
  │  wallet (local encrypted keystore, isolated signing)  · confirm gate
  │                                 · batching       · send
  │  memory (encrypted, local) ── root-hash commit   · budget cap     │
  └───────────────────────────────────────────────────────────────────┘
        │                                   │
        ▼                                   ▼
  ReddAgent (on-chain identity + karma)   Robinhood Chain / pons
                                            (real cost shown before signing)

  X402:  redd-mcp exposes pons tools (gas, portfolio, quote, execute) to any MCP
         host; paid calls settle in $REDD via ReddCredits.
```

Nothing is custodial: intents are parsed and planned locally, every transaction is
simulated first, and signing happens with a key that never leaves your machine.

## Tokenomics

- **Tier / flair is hold-based** — hold 50k / 250k / 1M $REDD for Bronze / Silver / Gold. Tier unlocks agent perks (deeper memory, smarter model tier, more automation slots). Read live from your balance; no staking, no lock.
- **Creator fee → holders** — the 2% pons creator fee is shared straight to $REDD holders, handled natively by pons. Holders claim their share from their pons profile.
- **Usage revenue → treasury + burn** — paid API calls (REDD X402) settle in $REDD via `ReddCredits`: **70% to the treasury** that funds long-term REDD development, **30% burned**.

## Contracts

| Contract | Purpose | Coverage |
| --- | --- | --- |
| `ReddAgent` | Soulbound identity NFT — karma reputation + on-chain memory-root commitment | 100% |
| `ReddCredits` | Prepaid $REDD escrow for X402 — user-signed per-call vouchers; splits usage 70% treasury / 30% burn; non-custodial | 93% |
| `ReddToken` | Reference ERC-20 with EIP-3009 (not deployed; $REDD fair-launches on pons) | 100% |

```bash
cd contract
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge test          # 14 passing
forge coverage      # 80% lines / 89% functions
```

## CLI

```bash
cd cli
npm install
npm test          # vitest — 53 passing
npm run build     # tsc (clean)
```

### Commands

```bash
npm i -g @redd/cli

redd do "gas"                         # current network gas
redd do "portfolio"                   # your balances + PnL
redd do "price RDDT"                  # a token price
redd do "buy $100 RDDT"               # plan + (on confirm) execute a pons buy
redd-mcp                              # MCP server: expose pons tools to agents
```

The MCP server (`redd-mcp`) exposes pons tools (gas, portfolio, quote, execute) to MCP hosts — see [`cli/MCP.md`](cli/MCP.md).

## Security

- Non-custodial: keys and funds stay with the user, on the user's machine.
- Private key / mnemonic is never logged, served, or committed.
- Simulate before broadcast; per-transaction and daily spend caps.
- Fees are minimized, never claimed to be zero.

See [SECURITY.md](SECURITY.md) for the disclosure policy.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
