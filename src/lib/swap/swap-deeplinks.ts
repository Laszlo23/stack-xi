import { BCC_TOKEN_ADDRESS, USDC_ADDRESS } from "@/lib/base/config";
import { SITE_LINKS } from "@/lib/site/links";
import { ETH_PLACEHOLDER, type SwapPreset } from "@/lib/swap/swap-config";

const AERODROME_POOL =
  import.meta.env.VITE_BCC_AERODROME_POOL ?? "0xE32D8d848169e4960607719DABba0154147F75F8";

const BASE_APP_ID = import.meta.env.VITE_BASE_APP_ID ?? "";

export function buildUniswapSwapUrl(preset: SwapPreset, sellAmount?: string): string {
  const inputCurrency = preset === "eth-bcc" ? "ETH" : USDC_ADDRESS;
  const params = new URLSearchParams({
    chain: "base",
    outputCurrency: BCC_TOKEN_ADDRESS,
    inputCurrency,
  });
  if (sellAmount && Number(sellAmount) > 0) {
    params.set("exactAmount", sellAmount);
  }
  return `https://app.uniswap.org/swap?${params.toString()}`;
}

export function buildBaseAppSwapUrl(): string {
  if (!BASE_APP_ID) return SITE_LINKS.bccBaseApp;
  return `https://base.app/coin/base-mainnet/${BCC_TOKEN_ADDRESS}?app_id=${BASE_APP_ID}`;
}

export function buildAerodromePoolUrl(): string {
  return `https://aerodrome.finance/deposit?token0=${USDC_ADDRESS}&token1=${BCC_TOKEN_ADDRESS}&type=0`;
}

export function buildAerodromePoolInfoUrl(): string {
  return `https://aerodrome.finance/pools?query=${AERODROME_POOL}`;
}

export function sellTokenAddress(preset: SwapPreset): string {
  return preset === "eth-bcc" ? ETH_PLACEHOLDER : USDC_ADDRESS;
}
