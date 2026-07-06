import { createPublicClient, formatUnits, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { BCC_DECIMALS, PREDICTION_POOL_ADDRESS } from "@/lib/base/config";

export type OnchainPrediction = {
  matchId: string;
  pickHome: boolean;
  amount: bigint;
  timestamp: number;
  txHash: `0x${string}`;
  blockNumber: bigint;
};

const predictionEvent = parseAbiItem(
  "event Prediction(address indexed user, string matchId, bool pickHome, uint256 amount, uint256 timestamp)",
);

/** Approximate Base block when PredictionPool was deployed — avoids full-chain log scans. */
const DEFAULT_FROM_BLOCK = 33_500_000n;

export async function fetchOnchainPredictions(
  rpcUrl: string,
  userAddress: `0x${string}`,
  fromBlock = DEFAULT_FROM_BLOCK,
): Promise<OnchainPrediction[]> {
  if (!PREDICTION_POOL_ADDRESS?.startsWith("0x")) return [];

  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });

  const logs = await client.getLogs({
    address: PREDICTION_POOL_ADDRESS,
    event: predictionEvent,
    args: { user: userAddress },
    fromBlock,
    toBlock: "latest",
  });

  return logs.map((log) => ({
    matchId: log.args.matchId ?? "",
    pickHome: Boolean(log.args.pickHome),
    amount: log.args.amount ?? 0n,
    timestamp: Number(log.args.timestamp ?? 0n),
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
  }));
}

export function formatPredictionStake(amount: bigint): string {
  const whole = Number(formatUnits(amount, BCC_DECIMALS));
  return whole.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
