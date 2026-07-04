import { createHmac } from "node:crypto";

type InitDataEntry = { key: string; value: string };

function parseInitData(initData: string): InitDataEntry[] {
  return initData.split("&").map((part) => {
    const [key, ...rest] = part.split("=");
    return { key: decodeURIComponent(key ?? ""), value: decodeURIComponent(rest.join("=")) };
  });
}

/** Validate Telegram Mini App initData per https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  if (!initData || !botToken) return false;

  const entries = parseInitData(initData);
  const hash = entries.find((e) => e.key === "hash")?.value;
  if (!hash) return false;

  const dataCheckString = entries
    .filter((e) => e.key !== "hash")
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((e) => `${e.key}=${e.value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return computed === hash;
}

export function parseTelegramUserFromInitData(initData: string): {
  id: number;
  username?: string;
  firstName?: string;
} | null {
  const userRaw = parseInitData(initData).find((e) => e.key === "user")?.value;
  if (!userRaw) return null;
  try {
    const user = JSON.parse(userRaw) as { id: number; username?: string; first_name?: string };
    return { id: user.id, username: user.username, firstName: user.first_name };
  } catch {
    return null;
  }
}

export function parseStartParam(initData: string): string | undefined {
  return parseInitData(initData).find((e) => e.key === "start_param")?.value;
}
