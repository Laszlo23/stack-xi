import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { getWalletSocialLinks, publicSocialStatus } from "@/lib/server/social-storage";

export const Route = createFileRoute("/api/social/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rateLimited = checkRateLimit(request, { routeId: "social-status", maxPerWindow: 60 });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        const url = new URL(request.url);
        const address = url.searchParams.get("address")?.trim().toLowerCase();
        if (!address || !address.startsWith("0x")) {
          return jsonError(400, "Valid address query param required");
        }

        const links = await getWalletSocialLinks(address);
        return new Response(JSON.stringify(publicSocialStatus(links)), {
          status: 200,
          headers: securityHeaders(),
        });
      },
    },
  },
});
