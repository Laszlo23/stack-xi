import { useEffect } from "react";

export function FarcasterMiniAppReady() {
  useEffect(() => {
    let cancelled = false;

    void import("@farcaster/miniapp-sdk")
      .then(async ({ sdk, quickAuth }) => {
        if (cancelled) return;
        await sdk.actions.ready();

        try {
          const { token } = await quickAuth.getToken();
          if (token && !cancelled) {
            sessionStorage.setItem("stackxi:fc-quick-auth-token", token);
          }
        } catch {
          // Quick Auth unavailable outside mini-app host
        }
      })
      .catch(() => {
        // Outside a Farcaster mini-app host — no-op.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
