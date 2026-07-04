/**
 * Writes sitemap.xml, robots.txt, and farcaster.json from VITE_SITE_URL.
 * Run: bun run generate:seo
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BLOG_POSTS } from "../src/lib/blog/posts.ts";
import { getAccountAssociation } from "../src/lib/farcaster/account-association.ts";

const ROOT = join(import.meta.dir, "..");
const SITE_URL = (process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(
  /\/$/,
  "",
);

const THEME_COLOR = "#1f2937";
const SITE_NAME = "STACK XI";
const SITE_DESCRIPTION =
  "Building Culture matchday hub on Base — mint the founding squad with BCC, predict World Cup picks, swap on 0x, and prove it onchain.";
const APP_ICON_PATH = "/icons/farcaster-icon-1024.png";
const OG_IMAGE_PATH = "/og/stack-xi-bcc.png";

const FARCASTER_SUBTITLE = "Building Culture BCC on Base";
const FARCASTER_DESCRIPTION =
  "Building Culture matchday hub on Base. Mint squad with BCC, predict World Cup picks, swap on 0x, prove onchain.";
const FARCASTER_TAGLINE = "Mint Predict Prove on Base";
const FARCASTER_OG_DESCRIPTION =
  "Mint squad with BCC, predict matchdays, and prove it onchain on Base.";

/** ISO date (YYYY-MM-DD) — override in CI for reproducible builds. */
const BUILD_DATE =
  process.env.SITEMAP_BUILD_DATE ?? new Date().toISOString().slice(0, 10);

type SitemapEntry = {
  path: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
  lastmod: string;
};

/** Indexable public routes only — /labs is noindex and excluded. */
const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0", lastmod: BUILD_DATE },
  { path: "/calendar", changefreq: "daily", priority: "0.9", lastmod: BUILD_DATE },
  { path: "/defi", changefreq: "weekly", priority: "0.9", lastmod: BUILD_DATE },
  { path: "/blog", changefreq: "weekly", priority: "0.9", lastmod: BUILD_DATE },
  { path: "/proof", changefreq: "weekly", priority: "0.85", lastmod: BUILD_DATE },
  { path: "/partners", changefreq: "monthly", priority: "0.75", lastmod: "2026-07-01" },
  { path: "/profile", changefreq: "weekly", priority: "0.7", lastmod: BUILD_DATE },
  { path: "/finals", changefreq: "monthly", priority: "0.6", lastmod: "2026-07-03" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3", lastmod: "2026-06-15" },
  { path: "/terms", changefreq: "yearly", priority: "0.3", lastmod: "2026-06-15" },
  { path: "/imprint", changefreq: "yearly", priority: "0.3", lastmod: "2026-06-15" },
];

function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function toLastmod(iso: string): string {
  return iso.slice(0, 10);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(): string {
  const blogEntries: SitemapEntry[] = BLOG_POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    changefreq: "monthly" as const,
    priority: "0.8",
    lastmod: toLastmod(post.updatedAt ?? post.publishedAt),
  }));

  const urls = [...STATIC_ROUTES, ...blogEntries]
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots(): string {
  return `User-agent: *
Allow: /
Disallow: /labs

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
}

function buildFarcasterManifest(): string {
  const iconUrl = absoluteUrl(APP_ICON_PATH);
  const ogImageUrl = absoluteUrl(OG_IMAGE_PATH);
  return JSON.stringify(
    {
      accountAssociation: getAccountAssociation(),
      miniapp: {
        version: "1",
        name: SITE_NAME,
        iconUrl,
        homeUrl: SITE_URL,
        splashBackgroundColor: THEME_COLOR,
        subtitle: FARCASTER_SUBTITLE,
        description: FARCASTER_DESCRIPTION,
        primaryCategory: "games",
        tags: ["base", "worldcup", "predictions", "bcc", "nft"],
        heroImageUrl: ogImageUrl,
        tagline: FARCASTER_TAGLINE,
        ogTitle: SITE_NAME,
        ogDescription: FARCASTER_OG_DESCRIPTION,
        ogImageUrl: ogImageUrl,
      },
    },
    null,
    2,
  );
}

const sitemap = buildSitemap();
const robots = buildRobots();
const farcaster = buildFarcasterManifest();

writeFileSync(join(ROOT, "public/sitemap.xml"), sitemap, "utf8");
writeFileSync(join(ROOT, "public/robots.txt"), robots, "utf8");
mkdirSync(join(ROOT, "public/.well-known"), { recursive: true });
writeFileSync(join(ROOT, "public/.well-known/farcaster.json"), `${farcaster}\n`, "utf8");

console.log(`SEO assets generated for ${SITE_URL}`);
