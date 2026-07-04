import { getAccountAssociation } from "@/lib/farcaster/account-association";
import {
  absoluteUrl,
  SITE_NAME,
  SITE_URL,
  THEME_COLOR,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_APP_ICON_PATH,
  DEFAULT_SPLASH_ICON_PATH,
} from "@/lib/seo/site-config";

/** Farcaster manifest text limits — ASCII only, no emojis. */
const FARCASTER_SUBTITLE = "Building Culture BCC on Base";
const FARCASTER_DESCRIPTION =
  "Building Culture matchday hub on Base. Mint squad with BCC, predict World Cup picks, swap on 0x, prove onchain.";
const FARCASTER_TAGLINE = "Mint Predict Prove on Base";
const FARCASTER_OG_DESCRIPTION =
  "Mint squad with BCC, predict matchdays, and prove it onchain on Base.";

const accountAssociation = getAccountAssociation();

export const FARCASTER_MANIFEST = {
  accountAssociation,
  miniapp: {
    version: "1" as const,
    name: SITE_NAME,
    iconUrl: absoluteUrl(DEFAULT_APP_ICON_PATH),
    homeUrl: SITE_URL,
    splashBackgroundColor: THEME_COLOR,
    subtitle: FARCASTER_SUBTITLE,
    description: FARCASTER_DESCRIPTION,
    primaryCategory: "games" as const,
    tags: ["base", "worldcup", "predictions", "bcc", "nft"] as const,
    heroImageUrl: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    tagline: FARCASTER_TAGLINE,
    ogTitle: SITE_NAME,
    ogDescription: FARCASTER_OG_DESCRIPTION,
    ogImageUrl: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
  },
} as const;

type MiniAppEmbedActionType = "launch_miniapp" | "launch_frame";

function buildMiniAppEmbed(actionType: MiniAppEmbedActionType): string {
  return JSON.stringify({
    version: FARCASTER_MANIFEST.miniapp.version,
    imageUrl: FARCASTER_MANIFEST.miniapp.heroImageUrl,
    button: {
      title: "Open STACK XI",
      action: {
        type: actionType,
        url: FARCASTER_MANIFEST.miniapp.homeUrl,
        name: FARCASTER_MANIFEST.miniapp.name,
        splashImageUrl: absoluteUrl(DEFAULT_SPLASH_ICON_PATH),
        splashBackgroundColor: FARCASTER_MANIFEST.miniapp.splashBackgroundColor,
      },
    },
  });
}

export function farcasterMiniAppMetaContent(): string {
  return buildMiniAppEmbed("launch_miniapp");
}

export function farcasterFrameMetaContent(): string {
  return buildMiniAppEmbed("launch_frame");
}
