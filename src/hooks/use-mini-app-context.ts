import { useEffect, useState } from "react";

export type MiniAppContext = {
  isMiniApp: boolean;
  isLoading: boolean;
};

function detectMiniApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.parent !== window || /warpcast|farcaster|baseapp|coinbase/i.test(navigator.userAgent)
  );
}

export function useMiniAppContext(): MiniAppContext {
  const [state, setState] = useState<MiniAppContext>({
    isMiniApp: false,
    isLoading: true,
  });

  useEffect(() => {
    setState({ isMiniApp: detectMiniApp(), isLoading: false });
  }, []);

  return state;
}
