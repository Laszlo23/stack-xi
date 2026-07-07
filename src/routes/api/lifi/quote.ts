import { createFileRoute } from "@tanstack/react-router";
import { proxyLifiQuote, validateLifiQuoteRequest } from "@/lib/swap/lifi-proxy";
import { isLifiConfigured, validateLifiFromAmount } from "@/lib/swap/lifi-config";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";

export const Route = createFileRoute("/api/lifi/quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rateLimited = checkRateLimit(request, { routeId: "lifi-quote", maxPerWindow: 10 });
        if (rateLimited) return rateLimited;

        const forbidden = requireTrustedOrigin(request);
        if (forbidden) return forbidden;

        if (!isLifiConfigured()) {
          return new Response(
            JSON.stringify({ error: "LI.FI API not configured" }),
            { status: 503, headers: securityHeaders() },
          );
        }

        const url = new URL(request.url);
        const fromChain = Number(url.searchParams.get("fromChain"));
        const toChain = Number(url.searchParams.get("toChain"));
        const fromToken = url.searchParams.get("fromToken") ?? "";
        const toToken = url.searchParams.get("toToken") ?? "";
        const fromAmount = url.searchParams.get("fromAmount") ?? "";
        const fromAddress = url.searchParams.get("fromAddress") ?? "";
        const toAddress = url.searchParams.get("toAddress") ?? undefined;
        const slippageRaw = url.searchParams.get("slippage");

        if (!Number.isFinite(fromChain) || !Number.isFinite(toChain)) {
          return jsonError(400, "Invalid chain params");
        }

        const validation = validateLifiQuoteRequest({
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount,
          fromAddress,
        });
        if (!validation.ok) return jsonError(400, validation.error);

        const amountCheck = validateLifiFromAmount(fromAmount);
        if (!amountCheck.ok) return jsonError(400, amountCheck.error);

        const slippage = slippageRaw ? Number(slippageRaw) : undefined;
        if (slippage != null && (!Number.isFinite(slippage) || slippage < 0 || slippage > 1)) {
          return jsonError(400, "slippage must be between 0 and 1");
        }

        try {
          const data = await proxyLifiQuote({
            fromChain,
            toChain,
            fromToken,
            toToken,
            fromAmount,
            fromAddress,
            toAddress,
            slippage,
          });
          return new Response(JSON.stringify(data), { headers: securityHeaders() });
        } catch (err) {
          const message = err instanceof Error ? err.message : "LI.FI quote failed";
          return new Response(JSON.stringify({ error: message }), {
            status: 502,
            headers: securityHeaders(),
          });
        }
      },
    },
  },
});
