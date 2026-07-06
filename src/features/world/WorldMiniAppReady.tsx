import { useEffect } from "react";

export function WorldMiniAppReady() {
  useEffect(() => {
    const appId = import.meta.env.VITE_WORLD_APP_ID as string | undefined;
    if (!appId?.trim()) return;

    void import("@worldcoin/minikit-js")
      .then(({ MiniKit }) => {
        const result = MiniKit.install(appId.trim());
        if (!result.success && import.meta.env.DEV) {
          console.warn("[World] MiniKit install:", result.errorMessage ?? "failed");
        }
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn("[World] MiniKit load failed", err);
        }
      });
  }, []);

  return null;
}
