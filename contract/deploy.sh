#!/bin/bash
# Deploy REDD on-chain layer (ReddAgent + ReddReserve) on Robinhood Chain.
# $REDD fair-launches on pons (plain ERC-20) — ReddToken.sol is NOT deployed.
# NEVER verifies on the explorer (hard rule). Legacy gas (RH chain gotcha).
# Usage: ./deploy.sh <REDD_CA> [holdersSink] [stakersSink] [burnSink]
#   deployer PK read from /root/.redd_deploy/deploy.key (chmod 600, never logged)
set -e
cd "$(dirname "$0")"
RPC=${RPC:-https://rpc.mainnet.chain.robinhood.com}
KEY=/root/.redd_deploy/deploy.key

[ -n "$1" ] || { echo "usage: ./deploy.sh <REDD_CA> [holders] [stakers] [burn]"; exit 1; }
[ -f "$KEY" ] || { echo "ERROR: put deployer private key (chmod 600) at $KEY"; exit 1; }

export PRIVATE_KEY="$(cat "$KEY")"     # not printed
export REDD="$1"
[ -n "$2" ] && export HOLDERS="$2"
[ -n "$3" ] && export STAKERS="$3"
[ -n "$4" ] && export BURN="$4"

echo "Deploying to $RPC  (REDD=$REDD)  — NO verify"
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$RPC" \
  --broadcast --legacy --gas-price 2000000000 \
  -vvv
echo
echo ">>> wire the printed ReddAgent / ReddReserve:"
echo "    CLI env: REDD_ADDR_REDD=<REDD>  REDD_ADDR_AGENT=<ReddAgent>  REDD_ADDR_RESERVE=<ReddReserve>"
echo "    landing: set the launch pair + Launch App -> npm i -g @redd/cli"
