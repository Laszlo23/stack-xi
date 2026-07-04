import { createFileRoute } from "@tanstack/react-router";
import { privateKeyToAccount } from "viem/accounts";
import {
  getExpectedAlchemyPayerAddress,
  isAlchemyPayerAddressMismatch,
  resolveAlchemyX402PayerKey,
} from "@/lib/server/alchemy-config";
import { getSwapMode, getX402PayerKind, isZeroXConfigured } from "@/lib/swap/zerox-proxy";

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

        return new Response(
          JSON.stringify({
            configured: isZeroXConfigured() && !payerMismatch,
            mode: payerMismatch ? "deeplink_only" : mode,
            payer,
            payerAddress,
            expectedAddress,
            payerMismatch,
            hint: payerMismatch
              ? "Set ALCHEMY_WALLET_KEY for ALCHEMY_PUBLIC_WALLET_ADDRESS, then fund with USDC on Base"
              : mode === "deeplink_only"
                ? "Set ZEROX_API_KEY or ALCHEMY_WALLET_KEY/PRIVATE_KEY + ALCHEMY_API_KEY, or CDP credentials"
                : mode === "x402"
                  ? payer === "cdp"
                    ? "Quotes paid via CDP API wallet; user wallet executes swap"
                    : payer === "alchemy"
                      ? "Quotes paid via Alchemy agent wallet; user wallet executes swap"
                      : "Quotes paid via project x402 wallet; user wallet executes swap"
                  : "Classic 0x API key proxy",
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
