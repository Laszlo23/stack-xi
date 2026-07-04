import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSignMessage } from "wagmi";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { buildSocialLinkMessage } from "@/hooks/use-social-connections";
import { mergeMemberProgress } from "@/lib/profile/task-storage";
import { getTelegramWebApp, isTelegramMiniApp } from "@/lib/telegram/types";

const SESSION_KEY = "stackxi:telegram-session";

export type TelegramSessionUser = {
  userId: number;
  username: string | null;
  linkedWallet: string | null;
};

type TelegramSessionContextValue = {
  isTelegram: boolean;
  isLoading: boolean;
  error: string | null;
  user: TelegramSessionUser | null;
  initData: string | null;
  startParam: string | null;
  needsWalletLink: boolean;
  refresh: () => Promise<void>;
  linkWallet: (address: `0x${string}`) => Promise<void>;
  clearError: () => void;
};

const TelegramSessionContext = createContext<TelegramSessionContextValue | null>(null);

function readCachedSession(): TelegramSessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TelegramSessionUser;
  } catch {
    return null;
  }
}

function writeCachedSession(user: TelegramSessionUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

async function verifyTelegramSession(input: {
  initData: string;
  address?: `0x${string}`;
  message?: string;
  signature?: `0x${string}`;
}): Promise<TelegramSessionUser> {
  const res = await fetch("/api/auth/telegram/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Telegram verify failed");
  }
  const data = (await res.json()) as {
    telegram: TelegramSessionUser;
    linkedWallet?: string | null;
  };
  return {
    userId: data.telegram.userId,
    username: data.telegram.username,
    linkedWallet: data.linkedWallet ?? data.telegram.linkedWallet ?? null,
  };
}

export function TelegramSessionProvider({ children }: { children: ReactNode }) {
  const tg = getTelegramWebApp();
  const isTelegram = isTelegramMiniApp();
  const { address, isConnected } = useBaseWallet();
  const { signMessageAsync } = useSignMessage();
  const [user, setUser] = useState<TelegramSessionUser | null>(() => readCachedSession());
  const [isLoading, setIsLoading] = useState(isTelegram);
  const [error, setError] = useState<string | null>(null);

  const initData = tg?.initData ?? null;
  const startParam = tg?.initDataUnsafe.start_param ?? null;

  const needsWalletLink = Boolean(
    isTelegram &&
      isConnected &&
      address &&
      user &&
      user.linkedWallet?.toLowerCase() !== address.toLowerCase(),
  );

  const refresh = useCallback(async () => {
    if (!isTelegram || !initData) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const session = await verifyTelegramSession({ initData });
      setUser(session);
      writeCachedSession(session);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Telegram session failed";
      setError(message);
      setUser(null);
      writeCachedSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [initData, isTelegram]);

  const clearError = useCallback(() => setError(null), []);

  const linkWallet = useCallback(
    async (wallet: `0x${string}`) => {
      if (!initData || !user) {
        throw new Error("Telegram session not ready");
      }
      setError(null);
      const nonce = crypto.randomUUID();
      const message = buildSocialLinkMessage(wallet, nonce);
      const signature = await signMessageAsync({ message });
      const session = await verifyTelegramSession({
        initData,
        address: wallet,
        message,
        signature,
      });
      mergeMemberProgress(wallet, user.userId);
      setUser(session);
      writeCachedSession(session);
    },
    [initData, signMessageAsync, user],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      isTelegram,
      isLoading,
      error,
      user,
      initData,
      startParam,
      needsWalletLink,
      refresh,
      linkWallet,
      clearError,
    }),
    [
      isTelegram,
      isLoading,
      error,
      user,
      initData,
      startParam,
      needsWalletLink,
      refresh,
      linkWallet,
      clearError,
    ],
  );

  return (
    <TelegramSessionContext.Provider value={value}>{children}</TelegramSessionContext.Provider>
  );
}

export function useTelegramSession() {
  const ctx = useContext(TelegramSessionContext);
  if (!ctx) {
    throw new Error("useTelegramSession must be used within TelegramSessionProvider");
  }
  return ctx;
}

export function useTelegramSessionOptional() {
  return useContext(TelegramSessionContext);
}
