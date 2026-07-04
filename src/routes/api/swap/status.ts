import { createFileRoute } from "@tanstack/react-router";
import { getSwapMode, isZeroXConfigured } from "@/lib/swap/zerox-proxy";

export const Route = createFileRoute("/api/swap/status")({
  server: {
    handlers: {
      GET: async () => {
        const mode = getSwapMode();
        return new Response(
          JSON.stringify({
            configured: isZeroXConfigured(),
            mode,
            hint:
              mode === "deeplink_only"
                ? "Set ZEROX_API_KEY or X402_SWAP_PAYER_PRIVATE_KEY (USDC on Base)"
                : mode === "x402"
                  ? "Quotes paid via project x402 wallet; user wallet executes swap"
                  : "Classic 0x API key proxy",
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
