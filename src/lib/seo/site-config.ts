import { PROTOCOL_NAME, PROTOCOL_ONE_LINER, PROTOCOL_TAGLINE } from "@/domain/constants";

export const SITE_NAME = PROTOCOL_NAME;
export const SITE_TAGLINE = PROTOCOL_TAGLINE;
export const SITE_DESCRIPTION = PROTOCOL_ONE_LINER;

/** Canonical production URL — set VITE_SITE_URL in deploy env. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space"
).replace(/\/$/, "");

export const SITE_LOCALE = "en_US";
export const SITE_LANGUAGE = "en";

export const TWITTER_HANDLE = import.meta.env.VITE_TWITTER_SITE ?? "@buildingcultu3";
export const TWITTER_CREATOR = "@0xleonardo";

export const SITE_EMAIL = "hello@buildingcultureid.space";
export const SITE_ORG = "Building Culture ID";

/** Dark cyber football palette — matches :root background. */
export const THEME_COLOR = "#1f2937";

export const DEFAULT_OG_IMAGE_PATH = "/og/stack-xi-bcc.png";
/** 1024x1024 PNG for Farcaster manifest iconUrl (required by spec). */
export const DEFAULT_APP_ICON_PATH = "/icons/farcaster-icon-1024.png";
/** 200x200 PNG for fc:miniapp embed splash (not in manifest — URL max 32 chars). */
export const DEFAULT_SPLASH_ICON_PATH = "/icons/farcaster-splash-200.png";
export const DEFAULT_OG_IMAGE = `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT =
  "STACK XI — Building Culture Pepe on Base: mint squad NFTs with BCC, predict matchdays, prove onchain";

export const DEFAULT_KEYWORDS = [
  "STACK XI",
  "Building Culture",
  "BCC token",
  "Clanker",
  "Base blockchain",
  "Farcaster mini app",
  "World Cup 2026",
  "Dallas matchday",
  "Pepe NFT",
  "founding squad mint",
  "onchain proof",
  "DexScreener",
  "0x swap",
  "Decentraland watch party",
] as const;

export const GOOGLE_SITE_VERIFICATION = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ?? "";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageTitle(title: string, options?: { home?: boolean }): string {
  if (options?.home) return `${SITE_NAME} — Building Culture Pepe on Base`;
  return `${title} · ${SITE_NAME}`;
}
