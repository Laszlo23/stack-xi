import { createFileRoute } from "@tanstack/react-router";
import { privateKeyToAccount } from "viem/accounts";
import {
  getExpectedAlchemyPayerAddress,
  isAlchemyPayerAddressMismatch,
  resolveAlchemyX402PayerKey,
} from "@/lib/server/alchemy-config";
import { getSwapMode, getX402PayerKind, isSwapConfigured } from "@/lib/swap/zerox-proxy";

function getPayerAddress(): `0x${string}` | null {
  const key = resolveAlchemyX402PayerKey();
  if (!key) return getExpectedAlchemyPayerAddress();
  try {
    return privateKeyToAccount(key).address;
  } catch {
    return getExpectedAlchemyPayerAddress();
  }
}

export const Route = createFileRoute("/api/swap/status")({
  server: {
    handlers: {
      GET: async () => {
        const mode = getSwapMode();
        const payer = getX402PayerKind();
        const payerAddress = getPayerAddress();
        const expectedAddress = getExpectedAlchemyPayerAddress();
        const payerMismatch = isAlchemyPayerAddressMismatch();

        const hint =
          mode === "direct"
            ? "Direct Aerodrome swap — no 0x API key or x402 payer needed"
            : payerMismatch
              ? "Set ALCHEMY_WALLET_KEY for ALCHEMY_PUBLIC_WALLET_ADDRESS, then fund with USDC on Base"
              : mode === "deeplink_only"
                ? "Set SWAP_MODE=direct (default), ZEROX_API_KEY, or SWAP_USE_ZEROX=1 with x402 payer"
                : mode === "x402"
                  ? payer === "cdp"
                    ? "Quotes paid via CDP API wallet; user wallet executes swap"
                    : payer === "alchemy"
                      ? "Quotes paid via Alchemy agent wallet; user wallet executes swap"
                      : "Quotes paid via project x402 wallet; user wallet executes swap"
                  : "Classic 0x API key proxy";

        return new Response(
          JSON.stringify({
            configured: isSwapConfigured() && !payerMismatch,
            mode: payerMismatch && mode === "x402" ? "deeplink_only" : mode,
            payer,
            payerAddress,
            expectedAddress,
            payerMismatch,
            hint,
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
