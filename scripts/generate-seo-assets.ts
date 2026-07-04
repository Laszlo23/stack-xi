/**
 * Writes sitemap.xml, robots.txt, and farcaster.json from VITE_SITE_URL.
 * Run: bun run generate:seo
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SITE_URL = (process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(
  /\/$/,
  "",
);

const THEME_COLOR = "#1f2937";
const SITE_NAME = "STACK XI";
const SITE_DESCRIPTION =
  "Building Culture matchday hub on Base — mint the founding squad with BCC, predict World Cup picks, swap on 0x, and prove it onchain.";
const OG_IMAGE_PATH = "/og/stack-xi-bcc.png";

const BLOG_SLUGS = [
  "pepe-matchdays-on-base",
  "bonding-curve-squad-mint",
  "usdc-predictions-dallas-2026",
  "from-base-believers-to-bitcoin-finals",
  "member-profile-culture-missions",
];

type SitemapEntry = { path: string; changefreq: string; priority: string };

const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/calendar", changefreq: "daily", priority: "0.85" },
  { path: "/defi", changefreq: "weekly", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/proof", changefreq: "weekly", priority: "0.85" },
  { path: "/partners", changefreq: "monthly", priority: "0.75" },
  { path: "/profile", changefreq: "weekly", priority: "0.7" },
  { path: "/finals", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/imprint", changefreq: "yearly", priority: "0.4" },
];

function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildSitemap(): string {
  const blogEntries: SitemapEntry[] = BLOG_SLUGS.map((slug) => ({
    path: `/blog/${slug}`,
    changefreq: "monthly",
    priority: "0.8",
  }));

  const urls = [...STATIC_ROUTES, ...blogEntries]
    .map(
      (entry) => `  <url>
    <loc>${absoluteUrl(entry.path)}</loc>
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
  const iconUrl = absoluteUrl(OG_IMAGE_PATH);
  return JSON.stringify(
    {
      accountAssociation: {
        header: "",
        payload: "",
        signature: "",
      },
      miniapp: {
        version: "1",
        name: SITE_NAME,
        iconUrl,
        homeUrl: absoluteUrl("/"),
        splashImageUrl: iconUrl,
        splashBackgroundColor: THEME_COLOR,
        subtitle: "Building Culture · BCC on Base",
        description: SITE_DESCRIPTION,
        primaryCategory: "games",
        tags: ["base", "world-cup", "predictions", "bcc", "nft", "building-culture"],
        heroImageUrl: iconUrl,
        tagline: "Mint · Predict · Prove on Base",
        ogTitle: SITE_NAME,
        ogDescription: SITE_DESCRIPTION,
        ogImageUrl: iconUrl,
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
