import { SOCIAL_LINKS } from "@/lib/profile/social-links";
import { SITE_EMAIL } from "@/lib/seo/site-config";
import {
  BASE_APP_COIN_URL,
  BCC_BASESCAN_URL,
  CLANKER_BCC_URL,
  DEXSCREENER_BCC_POOL_URL,
  DEXSCREENER_BOOST_URL,
  UNISWAP_BCC_SWAP_URL,
} from "@/lib/base/config";

export const PARTNER_EMAIL = "office@buildingculture.capital";

export const SITE_LINKS = {
  legalEmail: SITE_EMAIL,
  partnerEmail: PARTNER_EMAIL,
  partnerMailto: `mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent("STACK XI Partner Application")}`,
  bccBaseApp: BASE_APP_COIN_URL,
  bccBaseScan: BCC_BASESCAN_URL,
  bccUniswap: UNISWAP_BCC_SWAP_URL,
  bccClanker: CLANKER_BCC_URL,
  bccDexScreener: DEXSCREENER_BCC_POOL_URL,
  dexScreenerBoost: DEXSCREENER_BOOST_URL,
  communityX: SOCIAL_LINKS.communityX,
  farcasterFollow: SOCIAL_LINKS.farcasterFollow,
  telegram: import.meta.env.VITE_COMMUNITY_TELEGRAM_URL ?? "",
  places: import.meta.env.VITE_PLACES_SITE_URL ?? "",
} as const;

export function buildPartnerMailto(fields: {
  orgName: string;
  contactName: string;
  email: string;
  channel: string;
  useCase: string;
}): string {
  const body = [
    "STACK XI Partner Application",
    "",
    `Organization: ${fields.orgName}`,
    `Contact: ${fields.contactName}`,
    `Email: ${fields.email}`,
    `Channel: ${fields.channel}`,
    "",
    "Use case:",
    fields.useCase,
  ].join("\n");

  return `mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent("STACK XI Partner Application")}&body=${encodeURIComponent(body)}`;
}
