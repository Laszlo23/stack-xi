import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { generateOAuthState, generatePkcePair, verifyWalletSignature } from "@/lib/server/oauth-pkce";
import { saveOAuthPending } from "@/lib/server/social-storage";

export const Route = createFileRoute("/api/auth/x/start")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, { routeId: "auth-x-start", maxPerWindow: 10 });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        const clientId = process.env.X_CLIENT_ID;
        const callbackUrl =
          process.env.X_CALLBACK_URL ?? `${process.env.VITE_SITE_URL ?? ""}/api/auth/x/callback`;

        if (!clientId || !callbackUrl.startsWith("http")) {
          return jsonError(503, "X OAuth not configured (X_CLIENT_ID + X_CALLBACK_URL)");
        }

        let body: {
          address?: string;
          message?: string;
          signature?: string;
        };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        const address = body.address?.trim() as `0x${string}` | undefined;
        const message = body.message?.trim();
        const signature = body.signature?.trim() as `0x${string}` | undefined;

        if (!address || !message || !signature) {
          return jsonError(400, "address, message, and signature are required");
        }

        if (!message.startsWith("Link STACK XI social accounts")) {
          return jsonError(400, "Invalid link message format");
        }

        const valid = await verifyWalletSignature({ address, message, signature });
        if (!valid) {
          return jsonError(401, "Invalid wallet signature");
        }

        const { codeVerifier, codeChallenge } = generatePkcePair();
        const state = generateOAuthState();

        await saveOAuthPending(state, {
          wallet: address.toLowerCase(),
          codeVerifier,
          expiresAt: Date.now() + 10 * 60 * 1000,
        });

        const scopes = encodeURIComponent("tweet.read users.read offline.access");
        const authUrl =
          `https://twitter.com/i/oauth2/authorize?response_type=code` +
          `&client_id=${encodeURIComponent(clientId)}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&scope=${scopes}` +
          `&state=${encodeURIComponent(state)}` +
          `&code_challenge=${encodeURIComponent(codeChallenge)}` +
          `&code_challenge_method=S256`;

        return new Response(JSON.stringify({ authUrl }), {
          status: 200,
          headers: securityHeaders(),
        });
      },
    },
  },
});
