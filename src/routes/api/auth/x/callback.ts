import { createFileRoute } from "@tanstack/react-router";
import { consumeOAuthPending, linkXAccount } from "@/lib/server/social-storage";
import { grantSponsorAccessForVerifiedWallet } from "@/lib/server/sponsor-allowlist";

export const Route = createFileRoute("/api/auth/x/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const siteUrl = (process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(
          /\/$/,
          "",
        );

        if (!code || !state) {
          return Response.redirect(`${siteUrl}/profile?x=error`, 302);
        }

        const session = await consumeOAuthPending(state);
        if (!session) {
          return Response.redirect(`${siteUrl}/profile?x=expired`, 302);
        }

        const clientId = process.env.X_CLIENT_ID;
        const clientSecret = process.env.X_CLIENT_SECRET;
        const callbackUrl =
          process.env.X_CALLBACK_URL ?? `${siteUrl}/api/auth/x/callback`;

        if (!clientId || !clientSecret) {
          return Response.redirect(`${siteUrl}/profile?x=unconfigured`, 302);
        }

        const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            code,
            grant_type: "authorization_code",
            redirect_uri: callbackUrl,
            code_verifier: session.codeVerifier,
          }),
        });

        if (!tokenRes.ok) {
          return Response.redirect(`${siteUrl}/profile?x=token_error`, 302);
        }

        const tokenData = (await tokenRes.json()) as {
          access_token: string;
          refresh_token?: string;
        };

        const userRes = await fetch("https://api.twitter.com/2/users/me", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!userRes.ok) {
          return Response.redirect(`${siteUrl}/profile?x=user_error`, 302);
        }

        const userData = (await userRes.json()) as {
          data: { id: string; username: string };
        };

        await linkXAccount(session.wallet, {
          userId: userData.data.id,
          username: userData.data.username,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          linkedAt: new Date().toISOString(),
        });

        void grantSponsorAccessForVerifiedWallet(session.wallet);

        return Response.redirect(`${siteUrl}/profile?x=connected`, 302);
      },
    },
  },
});
