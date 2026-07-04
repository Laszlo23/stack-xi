import { createFileRoute } from "@tanstack/react-router";
import { proxyZeroXQuote, isZeroXConfigured } from "@/lib/swap/zerox-proxy";
import { validateSellAmount, validateSwapPair } from "@/lib/swap/validate-swap-params";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";

export const Route = createFileRoute("/api/swap/quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rateLimited = checkRateLimit(request, { routeId: "swap-quote", maxPerWindow: 20 });
        if (rateLimited) return rateLimited;

        const forbidden = requireTrustedOrigin(request);
        if (forbidden) return forbidden;

        if (!isZeroXConfigured()) {
          return new Response(
            JSON.stringify({ error: "Swap API not configured", mode: "deeplink_only" }),
            { status: 503, headers: securityHeaders() },
          );
        }

        const url = new URL(request.url);
        const sellToken = url.searchParams.get("sellToken");
        const buyToken = url.searchParams.get("buyToken");
        const sellAmount = url.searchParams.get("sellAmount");
        const taker = url.searchParams.get("taker");
        const slippageBps = url.searchParams.get("slippageBps");

        if (
          !sellToken?.startsWith("0x") ||
          !buyToken?.startsWith("0x") ||
          !sellAmount ||
          !taker?.startsWith("0x")
        ) {
          return jsonError(400, "Missing swap params");
        }

        const pairCheck = validateSwapPair(sellToken, buyToken);
        if (!pairCheck.ok) return jsonError(400, pairCheck.error);

        const amountCheck = validateSellAmount(sellAmount);
        if (!amountCheck.ok) return jsonError(400, amountCheck.error);

        try {
          const data = await proxyZeroXQuote({
            sellToken: sellToken as `0x${string}`,
            buyToken: buyToken as `0x${string}`,
            sellAmount,
            taker: taker as `0x${string}`,
            slippageBps: slippageBps ? Number(slippageBps) : undefined,
          });
          return new Response(JSON.stringify(data), { headers: securityHeaders() });
        } catch (err) {
          const message = err instanceof Error ? err.message : "0x quote failed";
          return new Response(JSON.stringify({ error: message }), {
            status: 502,
            headers: securityHeaders(),
          });
        }
      },
    },
  },
});
