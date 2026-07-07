import { createFileRoute } from "@tanstack/react-router";
import { base } from "viem/chains";
import { requestClaim, getClaimByTxHash } from "@/lib/server/claim-storage";
import { getMatchResult } from "@/lib/server/match-results-storage";
import { fetchOnchainPredictions } from "@/lib/predict/fetch-onchain-predictions";
import { fetchSquadPerksForAddress } from "@/lib/squad/squad-perks-server";

function getServerRpcUrl(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.ALCHEMY_BASE_ENDPOINT?.trim() ||
    (process.env.ALCHEMY_API_KEY
      ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY.trim()}`
      : base.rpcUrls.default.http[0])
  );
}

export const Route = createFileRoute("/api/claims/request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const address = typeof body.address === "string" ? body.address.trim() : "";
        const matchId = typeof body.matchId === "string" ? body.matchId.trim() : "";
        const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";
        const pick = body.pick === "home" || body.pick === "away" ? body.pick : null;

        if (!address.startsWith("0x") || address.length !== 42) {
          return Response.json({ error: "invalid_address" }, { status: 400 });
        }
        if (!matchId || !txHash.startsWith("0x") || !pick) {
          return Response.json({ error: "invalid_payload" }, { status: 400 });
        }

        const existing = await getClaimByTxHash(txHash);
        if (existing) {
          return Response.json({ ok: true, claim: existing });
        }

        const settled = await getMatchResult(matchId);
        if (!settled || !settled.payoutsOpen) {
          return Response.json({ error: "payouts_not_open" }, { status: 400 });
        }
        if (settled.winner !== pick) {
          return Response.json({ error: "pick_did_not_win" }, { status: 400 });
        }

        try {
          const rpcUrl = getServerRpcUrl();
          const predictions = await fetchOnchainPredictions(
            rpcUrl,
            address as `0x${string}`,
          );
          const onchain = predictions.find(
            (p) => p.txHash.toLowerCase() === txHash.toLowerCase() && p.matchId === matchId,
          );
          if (!onchain) {
            return Response.json({ error: "prediction_not_found" }, { status: 404 });
          }
          const onchainPick = onchain.pickHome ? "home" : "away";
          if (onchainPick !== pick) {
            return Response.json({ error: "pick_mismatch" }, { status: 400 });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "validation_failed";
          return Response.json({ error: message }, { status: 502 });
        }

        let boostBps = 0;
        let perkTier: string | undefined;
        try {
          const perks = await fetchSquadPerksForAddress(address as `0x${string}`);
          boostBps = perks.predictionBoostBps;
          perkTier = perks.tierLabel;
        } catch {
          // Perk read failure should not block claims
        }

        const claim = await requestClaim({
          address,
          matchId,
          txHash,
          pick,
          boostBps,
          perkTier,
        });
        return Response.json({ ok: true, claim });
      },
    },
  },
});
