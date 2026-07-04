import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { buildSharePost } from "@/lib/growth/share-copy";
import { absoluteUrl } from "@/lib/seo/site-config";
import {
  parseTelegramUserFromInitData,
  validateTelegramInitData,
} from "@/lib/server/telegram-auth";

type ShareType = "prediction" | "invite" | "campaign" | "referral";

type PrepareShareBody = {
  initData?: string;
  shareType?: ShareType;
  text?: string;
  title?: string;
  buttonUrl?: string;
};

async function savePreparedInlineMessage(
  botToken: string,
  userId: number,
  result: Record<string, unknown>,
): Promise<string> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/savePreparedInlineMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      result,
      allow_user_chats: true,
      allow_bot_chats: false,
      allow_group_chats: true,
      allow_channel_chats: false,
    }),
  });
  const data = (await res.json()) as { ok: boolean; description?: string; result?: { id: string } };
  if (!data.ok || !data.result?.id) {
    throw new Error(data.description ?? "savePreparedInlineMessage failed");
  }
  return data.result.id;
}

function buildShareContent(body: PrepareShareBody): { title: string; text: string; url: string } {
  const shareType = body.shareType ?? "campaign";
  const buttonUrl = body.buttonUrl ?? absoluteUrl("/");

  if (body.text && body.title) {
    return { title: body.title, text: body.text, url: buttonUrl };
  }

  switch (shareType) {
    case "prediction":
      return {
        title: "My STACK XI pick",
        text:
          body.text ??
          buildSharePost(
            ["🐸 Locked my World Cup pick on Base with BCC.", "Cast-to-predict culture > solo grind."],
            { path: "/#predict" },
          ),
        url: buttonUrl,
      };
    case "invite":
      return {
        title: "Join STACK XI matchday",
        text:
          body.text ??
          buildSharePost(
            [
              "🐸 STACK XI matchday on Base — predict with BCC, mint the squad, 1B culture airdrop.",
            ],
            { path: "/" },
          ),
        url: buttonUrl,
      };
    case "referral":
      return {
        title: "STACK XI referral",
        text:
          body.text ??
          buildSharePost(["🐸 Join me on STACK XI — predict, mint, earn culture XP."], {
            path: "/",
          }),
        url: buttonUrl,
      };
    case "campaign":
    default:
      return {
        title: body.title ?? "STACK XI culture campaign",
        text:
          body.text ??
          buildSharePost(["🐸 Pepe doesn't chase. Luck does. World Cup predictions on Base."], {
            path: "/",
          }),
        url: buttonUrl,
      };
  }
}

export const Route = createFileRoute("/api/telegram/prepare-share")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "telegram-prepare-share",
          maxPerWindow: 20,
        });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          return jsonError(503, "TELEGRAM_BOT_TOKEN not configured");
        }

        let body: PrepareShareBody;
        try {
          body = (await request.json()) as PrepareShareBody;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

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

        const { title, text, url } = buildShareContent(body);
        const resultId = `${body.shareType ?? "share"}-${user.id}-${Date.now()}`;

        try {
          const id = await savePreparedInlineMessage(botToken, user.id, {
            type: "article",
            id: resultId,
            title: title.slice(0, 64),
            description: text.slice(0, 256),
            input_message_content: {
              message_text: text.slice(0, 4096),
              disable_web_page_preview: false,
            },
            url,
          });

          return new Response(JSON.stringify({ ok: true, id }), {
            status: 200,
            headers: securityHeaders(),
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Failed to prepare share";
          return jsonError(502, message);
        }
      },
    },
  },
});
