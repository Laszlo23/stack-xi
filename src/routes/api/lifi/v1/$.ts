import { createFileRoute } from "@tanstack/react-router";
import { forwardLifiApiRequest } from "@/lib/swap/lifi-proxy";
import { isLifiConfigured } from "@/lib/swap/lifi-config";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";

async function handleProxy(request: Request, splat: string): Promise<Response> {
  const rateLimited = checkRateLimit(request, { routeId: "lifi-proxy", maxPerWindow: 40 });
  if (rateLimited) return rateLimited;

  const forbidden = requireTrustedOrigin(request);
  if (forbidden) return forbidden;

  if (!isLifiConfigured()) {
    return jsonError(503, "LI.FI API not configured");
  }

  if (!splat) {
    return jsonError(400, "Missing LI.FI path");
  }

  try {
    const proxied = await forwardLifiApiRequest(splat, request);
    const headers = new Headers(proxied.headers);
    for (const [key, value] of Object.entries(securityHeaders())) {
      headers.set(key, value);
    }
    return new Response(proxied.body, {
      status: proxied.status,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LI.FI proxy failed";
    return jsonError(502, message);
  }
}

export const Route = createFileRoute("/api/lifi/v1/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => handleProxy(request, params._splat),
      POST: async ({ request, params }) => handleProxy(request, params._splat),
      PUT: async ({ request, params }) => handleProxy(request, params._splat),
      PATCH: async ({ request, params }) => handleProxy(request, params._splat),
      DELETE: async ({ request, params }) => handleProxy(request, params._splat),
    },
  },
});
