import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { isQuestVerifyStep } from "@/lib/growth/social-targets";
import { getQuestProgress, setQuestStep } from "@/lib/server/quest-storage";
import { getWalletSocialLinks } from "@/lib/server/social-storage";
import { verifyQuestStep } from "@/lib/server/social-verify";

const STEP_MAP = {
  follow_x: "followX",
  engage_x: "engageX",
  engage_fc: "engageFc",
} as const;

export const Route = createFileRoute("/api/quest/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, { routeId: "quest-verify", maxPerWindow: 30 });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        let body: { address?: string; step?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        const address = body.address?.trim().toLowerCase();
        const step = body.step?.trim();

        if (!address?.startsWith("0x") || !step || !isQuestVerifyStep(step)) {
          return jsonError(400, "Valid address and step required");
        }

        const links = await getWalletSocialLinks(address);
        if (!links?.x || !links?.farcaster) {
          return new Response(
            JSON.stringify({
              verified: false,
              message: "Connect both X and Farcaster first.",
            }),
            { status: 200, headers: securityHeaders() },
          );
        }

        const result = await verifyQuestStep(step, links);
        if (result.verified) {
          const field = STEP_MAP[step];
          await setQuestStep(address, field, true);
        }

        const progress = await getQuestProgress(address);
        return new Response(
          JSON.stringify({ ...result, progress }),
          { status: 200, headers: securityHeaders() },
        );
      },
    },
  },
});
