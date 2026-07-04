import { buildSharePost } from "@/lib/growth/share-copy";
import { BASESCAN_URL, BCC_SYMBOL, formatBcc } from "@/lib/base/config";
import { SITE_LINKS } from "@/lib/site/links";

export type MintCastInput = {
  playerName: string;
  mintOrder: number;
  pricePaid: bigint;
  txHash: string;
};

export type PredictCastInput = {
  pick: string;
  stakeLabel: string;
  txHash: string;
  matchLabel: string;
};

export function buildMintCast(input: MintCastInput): string {
  return buildSharePost(
    [
      `Just minted ${input.playerName} on Building Culture 🐸⚽`,
      `Mint #${input.mintOrder} for ${formatBcc(input.pricePaid)}.`,
      `Onchain proof: ${BASESCAN_URL}/tx/${input.txHash}`,
      `Trade ${BCC_SYMBOL}: ${SITE_LINKS.bccDexScreener}`,
      "culture > solo grind 💜",
    ],
    { path: "/" },
  );
}

export function buildPredictCast(input: PredictCastInput): string {
  return buildSharePost(
    [
      `Locked ${input.pick} on STACK XI 🐸⚽`,
      `${input.matchLabel} · ${input.stakeLabel} ${BCC_SYMBOL} on Base.`,
      `Receipt: ${BASESCAN_URL}/tx/${input.txHash}`,
      `Chart: ${SITE_LINKS.bccDexScreener}`,
      "Luck decides.",
    ],
    { path: "/" },
  );
}

export function warpcastComposeUrl(text: string): string {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}
