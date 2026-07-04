/**
 * Fail if committed SEO assets don't match VITE_SITE_URL.
 * Run: bun run seo:check
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SITE_URL = (process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(
  /\/$/,
  "",
);

const files = [
  { path: "public/sitemap.xml", mustInclude: [`<loc>${SITE_URL}/</loc>`] },
  { path: "public/robots.txt", mustInclude: [`Sitemap: ${SITE_URL}/sitemap.xml`] },
  { path: "public/.well-known/farcaster.json", mustInclude: [`"homeUrl": "${SITE_URL}/"`] },
];

let failed = 0;

for (const file of files) {
  const content = readFileSync(join(ROOT, file.path), "utf8");
  for (const needle of file.mustInclude) {
    if (content.includes(needle)) {
      console.log(`  ✓ ${file.path} contains ${needle}`);
    } else {
      console.error(`  ✗ ${file.path} missing ${needle}`);
      failed += 1;
    }
  }
  if (content.includes("stackxi.xyz")) {
    console.error(`  ✗ ${file.path} still references stackxi.xyz — run bun run generate:seo`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} SEO check(s) failed. Run: bun run generate:seo`);
  process.exit(1);
}

console.log("\nSEO assets match VITE_SITE_URL");
