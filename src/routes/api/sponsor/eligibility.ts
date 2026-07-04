import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import {
  describeSponsorSocialGate,
  isSociallyEligibleForSponsor,
  validateFarcasterFidExists,
} from "@/lib/server/sponsor-eligibility";
import { readSponsorAllowed } from "@/lib/server/sponsor-allowlist";
import { getWalletSocialLinks } from "@/lib/server/social-storage";

export const Route = createFileRoute("/api/sponsor/eligibility")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "sponsor-eligibility",
          maxPerWindow: 60,
        });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        const url = new URL(request.url);
        const address = url.searchParams.get("address")?.trim().toLowerCase();
        if (!address || !address.startsWith("0x")) {
          return jsonError(400, "Valid address query param required");
        }

        const links = await getWalletSocialLinks(address);
        const gate = describeSponsorSocialGate(links);
        let socialEligible = isSociallyEligibleForSponsor(links);

        if (socialEligible && links?.farcaster?.fid) {
          const fidValid = await validateFarcasterFidExists(links.farcaster.fid);
          if (!fidValid) {
            socialEligible = false;
            gate.reason = "Farcaster FID could not be verified — reconnect on Profile.";
          }
        }

        const onChainAllowed = await readSponsorAllowed(address);

        return new Response(
          JSON.stringify({
            socialEligible,
            farcasterConnected: gate.farcasterConnected,
            xConnected: gate.xConnected,
            onChainAllowed,
            canUseSponsored: socialEligible && onChainAllowed === true,
            reason: gate.reason,
          }),
          { status: 200, headers: securityHeaders() },
        );
      },
    },
  },
});
