import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@farcaster/quick-auth";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { verifyWalletSignature } from "@/lib/server/oauth-pkce";
import { linkFarcasterAccount } from "@/lib/server/social-storage";
import { grantSponsorAccessForVerifiedWallet } from "@/lib/server/sponsor-allowlist";

const quickAuthClient = createClient();

function siteDomain(): string {
  const siteUrl = process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space";
  return new URL(siteUrl).hostname;
}

export const Route = createFileRoute("/api/auth/farcaster/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "auth-farcaster-verify",
          maxPerWindow: 20,
        });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        let body: {
          address?: string;
          message?: string;
          signature?: string;
          token?: string;
        };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        const address = body.address?.trim() as `0x${string}` | undefined;
        const message = body.message?.trim();
        const signature = body.signature?.trim() as `0x${string}` | undefined;
        const token = body.token?.trim();

        if (!address || !token) {
          return jsonError(400, "address and token are required");
        }

        if (!message || !signature) {
          return jsonError(400, "message and signature are required");
        }

        const valid = await verifyWalletSignature({ address, message, signature });
        if (!valid) {
          return jsonError(401, "Invalid wallet signature");
        }

        try {
          const payload = await quickAuthClient.verifyJwt({ token, domain: siteDomain() });
          const fid = Number(payload.sub);
          if (!Number.isFinite(fid)) {
            return jsonError(401, "Invalid Farcaster token");
          }

          let username: string | undefined;
          const apiKey = process.env.NEYNAR_API_KEY;
          if (apiKey) {
            const userRes = await fetch(
              `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
              { headers: { accept: "application/json", api_key: apiKey } },
            );
            if (userRes.ok) {
              const userData = (await userRes.json()) as {
                users?: { username?: string }[];
              };
              username = userData.users?.[0]?.username;
            }
          }

          const links = await linkFarcasterAccount(address.toLowerCase(), {
            fid,
            username,
            linkedAt: new Date().toISOString(),
          });

          void grantSponsorAccessForVerifiedWallet(address.toLowerCase());

          return new Response(
            JSON.stringify({
              ok: true,
              farcaster: { fid, username: username ?? null },
              links,
            }),
            { status: 200, headers: securityHeaders() },
          );
        } catch {
          return jsonError(401, "Farcaster token verification failed");
        }
      },
    },
  },
});
