import { BASESCAN_URL, SQUAD_NFT_ADDRESS } from "@/lib/base/config";
import { SITE_LINKS } from "@/lib/site/links";

export const FOOTER_COMMUNITY = {
  x: SITE_LINKS.communityX,
  telegram: SITE_LINKS.telegram,
  places: SITE_LINKS.places,
  team: SITE_LINKS.team,
} as const;

export const FOOTER_BASESCAN = SQUAD_NFT_ADDRESS?.startsWith("0x")
  ? `${BASESCAN_URL}/address/${SQUAD_NFT_ADDRESS}`
  : BASESCAN_URL;

export const LEGAL_ROUTES = [
  { to: "/privacy" as const, label: "Privacy" },
  { to: "/terms" as const, label: "Terms" },
  { to: "/imprint" as const, label: "Imprint" },
] as const;

export const FOOTER_SITE_ROUTES = [
  { to: "/calendar" as const, label: "Post Calendar" },
  { to: "/defi" as const, label: "DeFi Layer" },
  { to: "/proof" as const, label: "Onchain Proof" },
  { to: "/partners" as const, label: "Partners" },
  { to: "/blog" as const, label: "Blog" },
  ...LEGAL_ROUTES,
] as const;
