import { BASESCAN_URL, SQUAD_NFT_ADDRESS } from "@/lib/base/config";
import { SOCIAL_LINKS } from "@/lib/profile/social-links";

export const FOOTER_COMMUNITY = {
  x: SOCIAL_LINKS.communityX,
  telegram: import.meta.env.VITE_COMMUNITY_TELEGRAM_URL ?? "",
  places: import.meta.env.VITE_PLACES_SITE_URL ?? "",
} as const;

export const FOOTER_BASESCAN = SQUAD_NFT_ADDRESS?.startsWith("0x")
  ? `${BASESCAN_URL}/address/${SQUAD_NFT_ADDRESS}`
  : BASESCAN_URL;

export const LEGAL_ROUTES = [
  { to: "/privacy" as const, label: "Privacy" },
  { to: "/terms" as const, label: "Terms" },
  { to: "/imprint" as const, label: "Imprint" },
] as const;
