import { createFileRoute } from "@tanstack/react-router";
import { proxyZeroXQuote, isZeroXConfigured } from "@/lib/swap/zerox-proxy";

export const Route = createFileRoute("/api/swap/quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isZeroXConfigured()) {
          return new Response(
            JSON.stringify({ error: "Swap API not configured", mode: "deeplink_only" }),
            {
              status: 503,
              headers: { "content-type": "application/json" },
            },
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
          return new Response(JSON.stringify({ error: "Missing swap params" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const data = await proxyZeroXQuote({
            sellToken: sellToken as `0x${string}`,
            buyToken: buyToken as `0x${string}`,
            sellAmount,
            taker: taker as `0x${string}`,
            slippageBps: slippageBps ? Number(slippageBps) : undefined,
          });
          return new Response(JSON.stringify(data), {
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "0x quote failed";
          return new Response(JSON.stringify({ error: message }), {
            status: 502,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
