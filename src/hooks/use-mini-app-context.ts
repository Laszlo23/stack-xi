import { useEffect, useState } from "react";
import { isTelegramMiniApp } from "@/lib/telegram/types";
import "@/lib/world/types";

export type MiniAppContext = {
  isMiniApp: boolean;
  isTelegram: boolean;
  isWorldApp: boolean;
  isLoading: boolean;
};

function detectMiniApp(): Pick<MiniAppContext, "isMiniApp" | "isTelegram" | "isWorldApp"> {
  if (typeof window === "undefined") {
    return { isMiniApp: false, isTelegram: false, isWorldApp: false };
  }
  const isTelegram = isTelegramMiniApp();
  const isWorldApp =
    typeof window.WorldApp !== "undefined" ||
    /worldapp|world coin/i.test(navigator.userAgent);
  return {
    isTelegram,
    isWorldApp,
    isMiniApp:
      isTelegram ||
      isWorldApp ||
      window.parent !== window ||
      /warpcast|farcaster|baseapp|coinbase|telegram/i.test(navigator.userAgent),
  };
}

export function useMiniAppContext(): MiniAppContext {
  const [state, setState] = useState<MiniAppContext>({
    isMiniApp: false,
    isTelegram: false,
    isWorldApp: false,
    isLoading: true,
  });

  useEffect(() => {
    const base = detectMiniApp();
    void import("@worldcoin/minikit-js")
      .then(({ MiniKit }) => {
        setState({
          isMiniApp: base.isMiniApp || MiniKit.isInWorldApp(),
          isTelegram: base.isTelegram,
          isWorldApp: base.isWorldApp || MiniKit.isInWorldApp(),
          isLoading: false,
        });
      })
      .catch(() => {
        setState({ ...base, isLoading: false });
      });
  }, []);

  return state;
}
