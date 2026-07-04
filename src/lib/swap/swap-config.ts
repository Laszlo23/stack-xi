import { base } from "viem/chains";
import { BCC_SYMBOL, BCC_TOKEN_ADDRESS, USDC_ADDRESS, USDC_DECIMALS } from "@/lib/base/config";
import { absoluteUrl } from "@/lib/seo/site-config";

export const DEFAULT_SWAP_SLIPPAGE = 1;

export const ETH_PLACEHOLDER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as const;

export const BCC_TOKEN = {
  address: BCC_TOKEN_ADDRESS,
  chainId: base.id,
  symbol: BCC_SYMBOL,
  decimals: 18,
  name: "Building Culture Coin",
  image: absoluteUrl("/pepeheadball.jpg"),
} as const;

export const USDC_TOKEN = {
  address: USDC_ADDRESS,
  chainId: base.id,
  symbol: "USDC",
  decimals: USDC_DECIMALS,
  name: "USD Coin",
  image: "https://static.alchemyapi.io/images/assets/3408.png",
} as const;

export const ETH_TOKEN = {
  address: ETH_PLACEHOLDER,
  chainId: base.id,
  symbol: "ETH",
  decimals: 18,
  name: "Ethereum",
  image: "https://static.alchemyapi.io/images/assets/279.png",
} as const;

export type SwapPreset = "usdc-bcc" | "eth-bcc";

export function swapPresetLabel(preset: SwapPreset): string {
  switch (preset) {
    case "usdc-bcc":
      return "USDC → BCC";
    case "eth-bcc":
      return "ETH → BCC";
    default: {
      const _exhaustive: never = preset;
      return _exhaustive;
    }
  }
}
