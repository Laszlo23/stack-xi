import { BASESCAN_URL, BCC_BASESCAN_URL, SQUAD_NFT_ADDRESS } from "@/lib/base/config";
import { SITE_LINKS } from "@/lib/site/links";

export const FOOTER_COMMUNITY = {
  x: SITE_LINKS.communityX,
  telegram: SITE_LINKS.telegram,
  places: SITE_LINKS.places,
  team: SITE_LINKS.team,
  farcaster: SITE_LINKS.farcasterFollow,
} as const;

export const FOOTER_BASESCAN = SQUAD_NFT_ADDRESS?.startsWith("0x")
  ? `${BASESCAN_URL}/address/${SQUAD_NFT_ADDRESS}`
  : BASESCAN_URL;

export const LEGAL_ROUTES = [
  { to: "/privacy" as const, label: "Privacy" },
  { to: "/terms" as const, label: "Terms" },
  { to: "/imprint" as const, label: "Imprint" },
] as const;

/** @deprecated Use FOOTER_PRODUCT_LINKS — kept for scripts/check-links */
export const FOOTER_SITE_ROUTES = [
  { to: "/calendar" as const, label: "Post Calendar" },
  { to: "/defi" as const, label: "DeFi Layer" },
  { to: "/proof" as const, label: "Onchain Proof" },
  { to: "/partners" as const, label: "Partners" },
  { to: "/blog" as const, label: "Blog" },
  ...LEGAL_ROUTES,
] as const;

export const FOOTER_PRODUCT_LINKS = [
  { to: "/" as const, hash: "predict" as const, label: "Predict" },
  { to: "/" as const, hash: "squad" as const, label: "Founding Squad" },
  { to: "/defi" as const, label: "DeFi Layer" },
  { to: "/proof" as const, label: "Onchain Proof" },
  { to: "/calendar" as const, label: "Post Calendar" },
  { to: "/partners" as const, label: "Partners" },
  { to: "/blog" as const, label: "Blog" },
  { to: "/finals" as const, label: "Finals (Stacks)" },
] as const;

export const FOOTER_COMMUNITY_LINKS = [
  { href: FOOTER_COMMUNITY.x, label: "X" },
  { href: FOOTER_COMMUNITY.farcaster, label: "Farcaster" },
  { href: FOOTER_COMMUNITY.telegram, label: "Telegram" },
  { href: FOOTER_COMMUNITY.places, label: "Places" },
  { href: FOOTER_COMMUNITY.team, label: "Building Culture Team" },
] as const;

export const FOOTER_ONCHAIN_LINKS = [
  { href: BCC_BASESCAN_URL, label: "BCC Token" },
  { href: FOOTER_BASESCAN, label: "Squad NFT Contract" },
  { href: SITE_LINKS.bccUniswap, label: "Swap on Uniswap" },
] as const;
