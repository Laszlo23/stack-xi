#!/usr/bin/env bun
/**
 * Configure Telegram bot: menu button, description, webhook.
 * Usage: bun run setup:telegram
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv(): Record<string, string> {
  const path = join(import.meta.dir, "..", ".env");
  try {
    const raw = readFileSync(path, "utf8");
    const env: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let value = trimmed.slice(eq + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

const env = { ...loadEnv(), ...process.env };
const token = env.TELEGRAM_BOT_TOKEN;
const siteUrl = (env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(/\/$/, "");

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN missing in .env");
  process.exit(1);
}

async function api(method: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as { ok: boolean; description?: string; result?: unknown };
  if (!data.ok) {
    throw new Error(`${method} failed: ${data.description ?? res.statusText}`);
  }
  return data.result;
}

const me = (await api("getMe")) as { username: string; first_name: string };
console.log(`Bot: @${me.username} (${me.first_name})`);

await api("setChatMenuButton", {
  menu_button: {
    type: "web_app",
    text: "Play STACK XI",
    web_app: { url: siteUrl },
  },
});
console.log("Menu button set →", siteUrl);

await api("setMyDescription", {
  description:
    "STACK XI matchday on Base — predict with BCC, mint the squad, 1B culture airdrop. Pepe doesn't chase. Luck does. 🐸⚽",
});
await api("setMyShortDescription", {
  short_description: "World Cup predictions + squad mint on Base 🐸",
});

const webhookUrl = `${siteUrl}/api/telegram/webhook`;
await api("setWebhook", { url: webhookUrl, allowed_updates: ["message"] });
console.log("Webhook set →", webhookUrl);

console.log("\nEnable inline mode in @BotFather:");
console.log("  /setinline → choose @stack6bot → placeholder e.g. Share STACK XI");
console.log("  Required for native shareMessage in the mini app.");

console.log("\nShare these links:");
console.log(`  Bot:     https://t.me/${me.username}`);
console.log(`  Mini app: https://t.me/${me.username}?startapp=play`);
console.log(`  Predict:  https://t.me/${me.username}?startapp=predict`);
console.log("\nAdd to .env:");
console.log(`  VITE_TELEGRAM_BOT_USERNAME=${me.username}`);
console.log(`  VITE_COMMUNITY_TELEGRAM_URL=https://t.me/${me.username}`);
