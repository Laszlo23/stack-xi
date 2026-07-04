import { BCC_TOKEN_ADDRESS, USDC_ADDRESS } from "@/lib/base/config";
import { ETH_PLACEHOLDER } from "@/lib/swap/swap-config";

const ALLOWED_SELL = new Set([USDC_ADDRESS.toLowerCase(), ETH_PLACEHOLDER.toLowerCase()]);

const ALLOWED_BUY = new Set([BCC_TOKEN_ADDRESS.toLowerCase()]);

export function validateSwapPair(
  sellToken: string,
  buyToken: string,
): { ok: true } | { ok: false; error: string } {
  const sell = sellToken.toLowerCase();
  const buy = buyToken.toLowerCase();

  if (!ALLOWED_SELL.has(sell)) {
    return { ok: false, error: "sellToken not allowlisted (USDC or ETH → BCC only)" };
  }
  if (!ALLOWED_BUY.has(buy)) {
    return { ok: false, error: "buyToken must be BCC" };
  }

  return { ok: true };
}

export function validateSellAmount(
  sellAmount: string,
): { ok: true } | { ok: false; error: string } {
  if (!/^\d+$/.test(sellAmount)) {
    return { ok: false, error: "sellAmount must be a positive integer string" };
  }
  if (sellAmount === "0") {
    return { ok: false, error: "sellAmount must be greater than zero" };
  }
  return { ok: true };
}

export const MAX_CAST_TEXT_LENGTH = 320;

export function validateCastText(text: string): { ok: true } | { ok: false; error: string } {
  if (text.length > MAX_CAST_TEXT_LENGTH) {
    return { ok: false, error: `Cast text max ${MAX_CAST_TEXT_LENGTH} characters` };
  }
  return { ok: true };
}
