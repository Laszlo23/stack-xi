import { createFileRoute } from "@tanstack/react-router";
import { forwardLifiApiRequest } from "@/lib/swap/lifi-proxy";
import { isLifiConfigured } from "@/lib/swap/lifi-config";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";

export const Route = createFileRoute("/api/lifi/step-transaction")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "lifi-step-transaction",
          maxPerWindow: 20,
        });
        if (rateLimited) return rateLimited;

        const forbidden = requireTrustedOrigin(request);
        if (forbidden) return forbidden;

        if (!isLifiConfigured()) {
          return jsonError(503, "LI.FI API not configured");
        }

        try {
          const proxied = await forwardLifiApiRequest("advanced/stepTransaction", request);
          const headers = new Headers(proxied.headers);
          for (const [entry, value] of Object.entries(securityHeaders())) {
            headers.set(entry, value);
          }
          return new Response(proxied.body, {
            status: proxied.status,
            headers,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "LI.FI step transaction failed";
          return jsonError(502, message);
        }
      },
    },
  },
});
