# Security Policy

REDD is non-custodial by design. Keys and funds stay with the user, on the user's
machine. The following are hard rules across the codebase:

- A private key or mnemonic is never logged, printed, served, or committed.
- The wallet exposes only an address and a signing function — never the raw key.
- Every transaction is simulated (`eth_call`) before broadcast; a failed simulation aborts.
- Automation is fuel-gated and capped (per-transaction and daily spend caps); when a
  guard fails it pauses and notifies rather than sending.
- The X402 gateway (when hosted) never returns or logs the LLM/facilitator key; errors
  are surfaced as generic messages so a secret can never leak through an error.

## Scope

In scope:
- Smart contracts in `contract/src` (`ReddAgent`, `ReddCredits`, `ReddToken`).
- The CLI in `cli/src` — wallet handling, signing, execution, and the MCP server.

Out of scope:
- The pons launchpad / bonding curve and Robinhood Chain infrastructure themselves.
- Third-party dependencies (report those upstream).

## Reporting a vulnerability

Please report suspected vulnerabilities privately — do not open a public issue for a
security bug. Reach out via a direct message on X: https://x.com/ReddAgentRH.

Include:
- a description and impact,
- steps to reproduce (or a proof-of-concept),
- affected files / contracts / versions.

We aim to acknowledge within a few days. Responsible disclosure is appreciated; please
give us reasonable time to ship a fix before any public disclosure.
