import { createFileRoute } from "@tanstack/react-router";
import {
  getLifiIntegrator,
  getLifiIntegratorFee,
  isLifiConfigured,
  isLifiSwapEnabled,
} from "@/lib/swap/lifi-config";
import { checkRateLimit, requireTrustedOrigin, securityHeaders } from "@/lib/server/api-guard";

export const Route = createFileRoute("/api/lifi/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rateLimited = checkRateLimit(request, { routeId: "lifi-status", maxPerWindow: 30 });
        if (rateLimited) return rateLimited;

        const forbidden = requireTrustedOrigin(request);
        if (forbidden) return forbidden;

        const configured = isLifiConfigured();
        const enabled = isLifiSwapEnabled();
        const fee = getLifiIntegratorFee();

        return new Response(
          JSON.stringify({
            configured,
            enabled,
            integrator: getLifiIntegrator(),
            fee: fee ?? null,
            ready: configured && enabled,
          }),
          { headers: securityHeaders() },
        );
      },
    },
  },
});
