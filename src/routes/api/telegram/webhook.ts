import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit, securityHeaders } from "@/lib/server/api-guard";

const SITE_URL = (process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(
  /\/$/,
  "",
);

async function telegramApi(method: string, body: Record<string, unknown>): Promise<Response> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN missing");
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function welcomeMessage(): string {
  return [
    "🐸 STACK XI — Building Culture on Base",
    "",
    "Matchday loop:",
    "1️⃣ Open the mini app",
    "2️⃣ Lock your BCC prediction",
    "3️⃣ Share your pick",
    "4️⃣ Invite friends → airdrop weight",
    "",
    "Pepe doesn't chase. Luck does.",
  ].join("\n");
}

function inlineKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "🎮 Play STACK XI",
          web_app: { url: SITE_URL },
        },
      ],
      [
        {
          text: "⚽ Predict matchday",
          web_app: { url: `${SITE_URL}/#predict` },
        },
      ],
      [
        {
          text: "🎁 Share & earn",
          web_app: { url: `${SITE_URL}/profile` },
        },
      ],
    ],
  };
}

export const Route = createFileRoute("/api/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "telegram-webhook",
          maxPerWindow: 120,
        });
        if (rateLimited) return rateLimited;

        if (!process.env.TELEGRAM_BOT_TOKEN) {
          return new Response(JSON.stringify({ ok: false }), {
            status: 503,
            headers: securityHeaders(),
          });
        }

        let update: {
          message?: { chat: { id: number }; text?: string };
        };
        try {
          update = (await request.json()) as typeof update;
        } catch {
          return new Response(JSON.stringify({ ok: false }), {
            status: 400,
            headers: securityHeaders(),
          });
        }

        const chatId = update.message?.chat.id;
        const text = update.message?.text?.trim() ?? "";

        if (chatId && (text.startsWith("/start") || text.startsWith("/play"))) {
          await telegramApi("sendMessage", {
            chat_id: chatId,
            text: welcomeMessage(),
            reply_markup: inlineKeyboard(),
          });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: securityHeaders(),
        });
      },
    },
  },
});
