/**
 * Verify footer + sitemap routes exist in TanStack route tree.
 * Run: bun run check:links
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const routeTreePath = join(ROOT, "src/routeTree.gen.ts");
const sitemapPath = join(ROOT, "public/sitemap.xml");

const SITE_URL = (process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(
  /\/$/,
  "",
);

const routeTree = readFileSync(routeTreePath, "utf8");
const sitemap = readFileSync(sitemapPath, "utf8");

const routePaths = [...routeTree.matchAll(/path: '([^']+)'/g)].map((m) => m[1]);
const sitemapUrlPattern = new RegExp(
  `<loc>${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^<]*)</loc>`,
  "g",
);
const sitemapPaths = [...sitemap.matchAll(sitemapUrlPattern)].map((m) => m[1] || "/");

const footerRoutes = [
  "/calendar",
  "/defi",
  "/proof",
  "/partners",
  "/blog",
  "/privacy",
  "/terms",
  "/imprint",
];

let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ ${message}`);
    failed += 1;
  }
}

console.log("Link audit\n");

for (const path of [...new Set([...sitemapPaths, ...footerRoutes])]) {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "");
  const found =
    routePaths.includes(normalized) ||
    routePaths.includes(normalized === "/" ? "/" : `${normalized}/`) ||
    (normalized.startsWith("/blog/") && routePaths.includes("/blog/$slug"));
  assert(found, `route exists: ${normalized}`);
}

assert(routePaths.includes("/partners"), "partners route registered");

console.log(`\n${failed === 0 ? "All checks passed" : `${failed} failed`}`);
process.exit(failed > 0 ? 1 : 0);
