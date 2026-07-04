import { SITE_URL } from "@/lib/seo/site-config";

export const TELEGRAM_WEB_APP_URL = SITE_URL;

export const TELEGRAM_BOT_USERNAME =
  import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? "";

export function telegramBotUrl(startApp?: string): string {
  if (!TELEGRAM_BOT_USERNAME) return "";
  const base = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
  if (!startApp) return base;
  return `${base}?startapp=${encodeURIComponent(startApp)}`;
}

export function telegramReferralUrl(referrerWallet: string): string {
  const slug = referrerWallet.slice(2, 10).toLowerCase();
  return telegramBotUrl(`ref_${slug}`);
}
