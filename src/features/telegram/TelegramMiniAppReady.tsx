import { useEffect } from "react";
import { getTelegramWebApp } from "@/lib/telegram/types";

export function TelegramMiniAppReady() {
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;

    tg.ready();
    tg.expand();

    document.documentElement.classList.add("telegram-mini-app");
    if (tg.colorScheme === "dark") {
      document.documentElement.classList.add("dark");
    }

    const startParam = tg.initDataUnsafe.start_param;
    if (startParam?.startsWith("ref_") && typeof window !== "undefined") {
      sessionStorage.setItem("stackxi:tg-ref", startParam);
    }
    if (startParam === "predict" && typeof window !== "undefined") {
      sessionStorage.setItem("stackxi:tg-deeplink", "predict");
    }
  }, []);

  return null;
}
