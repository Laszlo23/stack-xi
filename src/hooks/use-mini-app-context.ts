import { useEffect, useState } from "react";
import { isTelegramMiniApp } from "@/lib/telegram/types";

export type MiniAppContext = {
  isMiniApp: boolean;
  isTelegram: boolean;
  isLoading: boolean;
};

function detectMiniApp(): Pick<MiniAppContext, "isMiniApp" | "isTelegram"> {
  if (typeof window === "undefined") {
    return { isMiniApp: false, isTelegram: false };
  }
  const isTelegram = isTelegramMiniApp();
  return {
    isTelegram,
    isMiniApp:
      isTelegram ||
      window.parent !== window ||
      /warpcast|farcaster|baseapp|coinbase|telegram/i.test(navigator.userAgent),
  };
}

export function useMiniAppContext(): MiniAppContext {
  const [state, setState] = useState<MiniAppContext>({
    isMiniApp: false,
    isTelegram: false,
    isLoading: true,
  });

  useEffect(() => {
    setState({ ...detectMiniApp(), isLoading: false });
  }, []);

  return state;
}
