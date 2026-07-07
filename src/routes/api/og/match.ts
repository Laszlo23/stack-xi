import { createFileRoute } from "@tanstack/react-router";
import { getMatchBySlug } from "@/lib/story/match-slugs";
import { absoluteUrl } from "@/lib/seo/site-config";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/api/og/match")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug")?.trim();
        const match = slug ? getMatchBySlug(slug) : undefined;

        const home = match?.home ?? "Team A";
        const away = match?.away ?? "Team B";
        const stage = match?.stage ?? "Matchday";
        const title = `${home} vs ${away}`;

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1419"/>
      <stop offset="100%" stop-color="#1a2e1a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="80" text-anchor="middle" fill="#4ade80" font-family="system-ui,sans-serif" font-size="28" font-weight="700" letter-spacing="8">STACK XI</text>
  <text x="600" y="200" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="64" font-weight="800">${escapeXml(home)}</text>
  <text x="600" y="280" text-anchor="middle" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="36" font-weight="600">vs</text>
  <text x="600" y="360" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="64" font-weight="800">${escapeXml(away)}</text>
  <text x="600" y="440" text-anchor="middle" fill="#86efac" font-family="system-ui,sans-serif" font-size="28">${escapeXml(stage)}</text>
  <rect x="350" y="500" width="500" height="64" rx="16" fill="#22c55e"/>
  <text x="600" y="542" text-anchor="middle" fill="#052e16" font-family="system-ui,sans-serif" font-size="28" font-weight="800">Predict Now 🐸</text>
  <text x="600" y="610" text-anchor="middle" fill="#6b7280" font-family="system-ui,sans-serif" font-size="20">${escapeXml(absoluteUrl(slug ? `/match/${slug}` : "/"))}</text>
</svg>`;

        return new Response(svg, {
          headers: {
            "content-type": "image/svg+xml",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
