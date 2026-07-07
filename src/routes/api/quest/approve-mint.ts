import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { allQuestStepsComplete } from "@/lib/quest/quest-config";
import { getQuestProgress, markMintApproved } from "@/lib/server/quest-storage";
import { getWalletSocialLinks } from "@/lib/server/social-storage";
import { syncRaffleAllowlist } from "@/lib/server/raffle-allowlist";

export const Route = createFileRoute("/api/quest/approve-mint")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, { routeId: "quest-approve-mint", maxPerWindow: 10 });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        let body: { address?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        const address = body.address?.trim().toLowerCase();
        if (!address?.startsWith("0x")) {
          return jsonError(400, "Valid address required");
        }

        const links = await getWalletSocialLinks(address);
        if (!links?.x || !links?.farcaster) {
          return jsonError(400, "Connect X and Farcaster first");
        }

        const progress = await getQuestProgress(address);
        if (!allQuestStepsComplete(progress.steps)) {
          return jsonError(400, "Complete all quest steps first");
        }

        if (progress.mintApprovedAt) {
          return new Response(
            JSON.stringify({ ok: true, alreadyApproved: true, progress }),
            { status: 200, headers: securityHeaders() },
          );
        }

        const allow = await syncRaffleAllowlist(address, true);
        if (!allow.synced) {
          return jsonError(502, allow.error ?? "Could not approve mint on-chain");
        }

        const updated = await markMintApproved(address);
        return new Response(
          JSON.stringify({
            ok: true,
            txHash: allow.txHash,
            progress: updated,
          }),
          { status: 200, headers: securityHeaders() },
        );
      },
    },
  },
});
