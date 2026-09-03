// cli/src/fee/truecost.ts
export function trueCost(input: {
  gasUnits: bigint;
  gasGwei: number;
  notionalUsd: number;
  tradeFeeBps: number;
  ethUsd: number;
}): { gasUsd: number; tradeFeeUsd: number; totalUsd: number } {
  const gasEth = Number(input.gasUnits) * input.gasGwei * 1e-9;
  const gasUsd = gasEth * input.ethUsd;
  const tradeFeeUsd = (input.notionalUsd * input.tradeFeeBps) / 10000;
  return { gasUsd, tradeFeeUsd, totalUsd: gasUsd + tradeFeeUsd };
}
