import {
  absoluteUrl,
  SITE_NAME,
  SITE_DESCRIPTION,
  THEME_COLOR,
  DEFAULT_OG_IMAGE_PATH,
} from "@/lib/seo/site-config";

export const FARCASTER_MANIFEST = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1" as const,
    name: SITE_NAME,
    iconUrl: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    homeUrl: absoluteUrl("/"),
    splashImageUrl: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    splashBackgroundColor: THEME_COLOR,
    subtitle: "Building Culture · BCC on Base",
    description: SITE_DESCRIPTION,
    primaryCategory: "games" as const,
    tags: ["base", "world-cup", "predictions", "bcc", "nft", "building-culture"] as const,
    heroImageUrl: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    tagline: "Mint · Predict · Prove on Base",
    ogTitle: SITE_NAME,
    ogDescription: SITE_DESCRIPTION,
    ogImageUrl: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
  },
} as const;

export function farcasterMiniAppMetaContent(): string {
  return JSON.stringify({
    version: FARCASTER_MANIFEST.miniapp.version,
    imageUrl: FARCASTER_MANIFEST.miniapp.heroImageUrl,
    button: {
      title: "Open STACK XI",
      action: {
        type: "launch_frame",
        url: FARCASTER_MANIFEST.miniapp.homeUrl,
        name: FARCASTER_MANIFEST.miniapp.name,
        splashImageUrl: FARCASTER_MANIFEST.miniapp.splashImageUrl,
        splashBackgroundColor: FARCASTER_MANIFEST.miniapp.splashBackgroundColor,
      },
    },
  });
}
