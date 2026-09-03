# Contributing to REDD

Thanks for your interest. REDD is two things in one repo — Solidity contracts (Foundry)
and a TypeScript CLI (vitest) — and both are test-first.

## Setup

Contracts:

```bash
cd contract
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge test
```

CLI:

```bash
cd cli
npm install
npm test        # vitest
npm run build   # tsc --noEmit must be clean
```

## Workflow

1. Fork and branch from `main`.
2. Write a failing test first, then the implementation (test-driven).
3. Keep changes focused — one logical change per pull request.
4. Make sure the full suite is green and `tsc` is clean before opening a PR:
   - `cd contract && forge test`
   - `cd cli && npm test && npx tsc --noEmit`
5. CI (forge test + vitest + typecheck) must pass.

## Conventions

- Solidity `^0.8.24`, Foundry. Follow the existing contract style and the security rules
  in [SECURITY.md](SECURITY.md).
- TypeScript strict mode. Small, focused modules with clear interfaces; inject
  dependencies so units test offline (no live network in unit tests).
- Never log, print, serve, or commit a private key, mnemonic, or API key.
- Commit messages: conventional style (`feat(cli): ...`, `fix(contract): ...`, `docs: ...`).

## Reporting bugs

Open an issue with steps to reproduce. For security bugs, follow [SECURITY.md](SECURITY.md)
instead of filing a public issue.
