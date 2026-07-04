import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { verifyWalletSignature } from "@/lib/server/oauth-pkce";
import {
  linkTelegramUserToWallet,
  publicTelegramSession,
  upsertTelegramUser,
} from "@/lib/server/social-storage";
import {
  parseTelegramUserFromInitData,
  validateTelegramInitData,
} from "@/lib/server/telegram-auth";

export const Route = createFileRoute("/api/auth/telegram/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "auth-telegram-verify",
          maxPerWindow: 30,
        });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          return jsonError(503, "TELEGRAM_BOT_TOKEN not configured");
        }

        let body: {
          address?: string;
          initData?: string;
          message?: string;
          signature?: string;
        };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        const address = body.address?.trim() as `0x${string}` | undefined;
        const initData = body.initData?.trim();
        if (!initData) {
          return jsonError(400, "initData is required");
        }

        if (!validateTelegramInitData(initData, botToken)) {
          return jsonError(401, "Invalid Telegram initData");
        }

        const user = parseTelegramUserFromInitData(initData);
        if (!user) {
          return jsonError(400, "Telegram user missing from initData");
        }

        if (address) {
          if (body.message && body.signature) {
            const valid = await verifyWalletSignature({
              address,
              message: body.message,
              signature: body.signature as `0x${string}`,
            });
            if (!valid) {
              return jsonError(401, "Invalid wallet signature");
            }
          }

          const { telegram, walletLinks } = await linkTelegramUserToWallet(
            user.id,
            address,
            user.username,
          );

          return new Response(
            JSON.stringify({
              ok: true,
              telegram: publicTelegramSession(telegram),
              linkedWallet: address.toLowerCase(),
              links: walletLinks,
            }),
            { status: 200, headers: securityHeaders() },
          );
        }

        const telegram = await upsertTelegramUser({
          userId: user.id,
          username: user.username,
          linkedAt: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({
            ok: true,
            telegram: publicTelegramSession(telegram),
            linkedWallet: telegram.wallet ?? null,
          }),
          { status: 200, headers: securityHeaders() },
        );
      },
    },
  },
});
