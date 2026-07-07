import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { verifyWalletSignature } from "@/lib/server/oauth-pkce";
import { linkFarcasterAccount } from "@/lib/server/social-storage";
import { grantSponsorAccessForVerifiedWallet } from "@/lib/server/sponsor-allowlist";
import {
  farcasterFidOwnsWallet,
  verifyFarcasterSignInMessage,
} from "@/lib/server/verify-farcaster-siwf";

export const Route = createFileRoute("/api/auth/farcaster/link-account")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "auth-farcaster-link-account",
          maxPerWindow: 20,
        });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        let body: {
          address?: string;
          message?: string;
          signature?: string;
          fid?: number;
          username?: string | null;
          siwfMessage?: string;
          siwfSignature?: string;
          siwfNonce?: string;
        };

        try {
          body = (await request.json()) as typeof body;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        const address = body.address?.trim() as `0x${string}` | undefined;
        const message = body.message?.trim();
        const signature = body.signature?.trim() as `0x${string}` | undefined;
        const fid = body.fid;
        const username = body.username?.trim() || undefined;

        if (!address || !message || !signature || !Number.isFinite(fid)) {
          return jsonError(400, "address, message, signature, and fid are required");
        }

        const validWallet = await verifyWalletSignature({ address, message, signature });
        if (!validWallet) {
          return jsonError(401, "Invalid wallet signature");
        }

        const siwfMessage = body.siwfMessage?.trim();
        const siwfSignature = body.siwfSignature?.trim() as `0x${string}` | undefined;
        const siwfNonce = body.siwfNonce?.trim();

        let fidVerified = false;

        if (siwfMessage && siwfSignature && siwfNonce) {
          const siwf = await verifyFarcasterSignInMessage({
            message: siwfMessage,
            signature: siwfSignature,
            nonce: siwfNonce,
          });
          fidVerified = siwf.success && siwf.fid === fid;
        } else {
          fidVerified = await farcasterFidOwnsWallet(fid!, address);
        }

        if (!fidVerified) {
          return jsonError(
            401,
            "Farcaster account could not be verified for this wallet — complete Sign in with Farcaster first.",
          );
        }

        const links = await linkFarcasterAccount(address.toLowerCase(), {
          fid: fid!,
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
      },
    },
  },
});
