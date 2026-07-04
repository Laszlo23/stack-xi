import { PREDICTION_POOL_ABI, PREDICTION_POOL_ADDRESS, isPredictionPoolConfigured } from "./config";

export type SubmitBasePredictionParams = {
  matchId: string;
  pickHome: boolean;
  amount: bigint;
  useContract: boolean;
};

export type EnsureBccAllowanceFn = (
  spender: `0x${string}`,
  amount: bigint,
) => Promise<`0x${string}` | null>;

export async function submitBasePrediction(
  writeContract: (args: {
    address: `0x${string}`;
    abi: readonly unknown[];
    functionName: string;
    args: unknown[];
  }) => Promise<`0x${string}`>,
  ensureAllowance: EnsureBccAllowanceFn,
  params: SubmitBasePredictionParams,
): Promise<`0x${string}`> {
  if (!isPredictionPoolConfigured() || !PREDICTION_POOL_ADDRESS) {
    throw new Error("Prediction pool not configured. Set VITE_PREDICTION_POOL_ADDRESS.");
  }

  await ensureAllowance(PREDICTION_POOL_ADDRESS, params.amount);
  return writeContract({
    address: PREDICTION_POOL_ADDRESS,
    abi: PREDICTION_POOL_ABI,
    functionName: "predict",
    args: [params.matchId, params.pickHome, params.amount],
  });
}
