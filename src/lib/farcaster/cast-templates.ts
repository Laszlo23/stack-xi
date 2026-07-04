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
  return [
    `Just minted ${input.playerName} on Building Culture 🐸⚽`,
    `Mint #${input.mintOrder} for ${formatBcc(input.pricePaid)}.`,
    `Onchain proof: ${BASESCAN_URL}/tx/${input.txHash}`,
    `Trade ${BCC_SYMBOL}: ${SITE_LINKS.bccDexScreener}`,
    `@jessepollak @dwr culture > solo grind 💜`,
  ].join("\n");
}

export function buildPredictCast(input: PredictCastInput): string {
  return [
    `Locked ${input.pick} on STACK XI 🐸⚽`,
    `${input.matchLabel} · ${input.stakeLabel} ${BCC_SYMBOL} on Base.`,
    `Receipt: ${BASESCAN_URL}/tx/${input.txHash}`,
    `Chart: ${SITE_LINKS.bccDexScreener}`,
    `Luck decides. pepe.buildingcultureid.space`,
  ].join("\n");
}

export function warpcastComposeUrl(text: string): string {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}
