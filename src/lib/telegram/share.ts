import { getTelegramWebApp } from "@/lib/telegram/types";

export type TelegramShareType = "prediction" | "invite" | "campaign" | "referral";

export type PrepareTelegramShareInput = {
  initData: string;
  shareType: TelegramShareType;
  text?: string;
  title?: string;
  buttonUrl?: string;
};

export async function prepareTelegramShare(input: PrepareTelegramShareInput): Promise<string> {
  const res = await fetch("/api/telegram/prepare-share", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Failed to prepare Telegram share");
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

export function shareToTelegram(preparedId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (!tg?.shareMessage) {
      resolve(false);
      return;
    }

    const onSent = () => {
      cleanup();
      resolve(true);
    };
    const onFailed = () => {
      cleanup();
      resolve(false);
    };

    function cleanup() {
      tg.offEvent?.("shareMessageSent", onSent);
      tg.offEvent?.("shareMessageFailed", onFailed);
    }

    tg.onEvent?.("shareMessageSent", onSent);
    tg.onEvent?.("shareMessageFailed", onFailed);
    tg.shareMessage(preparedId);
  });
}

export async function shareViaTelegram(input: PrepareTelegramShareInput): Promise<boolean> {
  const preparedId = await prepareTelegramShare(input);
  const sent = await shareToTelegram(preparedId);
  if (sent) return true;

  const tg = getTelegramWebApp();
  const fallbackText = encodeURIComponent(input.text ?? "STACK XI matchday on Base 🐸");
  const fallbackUrl = encodeURIComponent(input.buttonUrl ?? "https://pepe.buildingcultureid.space");
  tg?.openTelegramLink(`https://t.me/share/url?url=${fallbackUrl}&text=${fallbackText}`);
  return false;
}
