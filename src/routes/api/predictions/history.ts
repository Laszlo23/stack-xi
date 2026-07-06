import { createFileRoute } from "@tanstack/react-router";
import { base } from "viem/chains";
import {
  fetchOnchainPredictions,
  formatPredictionStake,
} from "@/lib/predict/fetch-onchain-predictions";

function getServerRpcUrl(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.ALCHEMY_BASE_ENDPOINT?.trim() ||
    (process.env.ALCHEMY_API_KEY
      ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY.trim()}`
      : base.rpcUrls.default.http[0])
  );
}

export const Route = createFileRoute("/api/predictions/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const address = url.searchParams.get("address")?.trim();

        if (!address?.startsWith("0x") || address.length !== 42) {
          return Response.json({ error: "invalid_address" }, { status: 400 });
        }

        try {
          const rpcUrl = getServerRpcUrl();
          const predictions = await fetchOnchainPredictions(
            rpcUrl,
            address as `0x${string}`,
          );

          return Response.json({
            address,
            predictions: predictions.map((p) => ({
              matchId: p.matchId,
              pick: p.pickHome ? "home" : "away",
              stakeLabel: `${formatPredictionStake(p.amount)} BCC`,
              timestamp: p.timestamp,
              txHash: p.txHash,
              blockNumber: p.blockNumber.toString(),
            })),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "fetch_failed";
          return Response.json({ error: message }, { status: 502 });
        }
      },
    },
  },
});
