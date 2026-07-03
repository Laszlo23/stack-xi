import { request } from "@stacks/connect";
import { isPoolConfigured, PREDICTION_POOL_ADDRESS, SBTC_CONTRACT, STACKS_NETWORK } from "./config";

export type SubmitPredictionParams = {
  amountSats: number;
  senderAddress?: string;
  matchId: string;
  pick: "home" | "away";
};

export type SubmitPredictionResult = {
  txid: string;
};

export async function submitPredictionTransfer(
  params: SubmitPredictionParams,
): Promise<SubmitPredictionResult> {
  if (!isPoolConfigured()) {
    throw new Error(
      "Prediction pool not configured. Set VITE_PREDICTION_POOL_ADDRESS in your environment.",
    );
  }

  const response = await request("stx_transferSip10Ft", {
    recipient: PREDICTION_POOL_ADDRESS,
    asset: SBTC_CONTRACT,
    amount: params.amountSats,
    network: STACKS_NETWORK,
    address: params.senderAddress,
  });

  const txid = response.txid;
  if (!txid) {
    throw new Error("Wallet did not return a transaction ID.");
  }

  return { txid };
}
