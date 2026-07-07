import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { usePrivyBaseConnect } from "@/hooks/use-privy-base-connect";

type BaseWalletValue = ReturnType<typeof useBaseWallet>;

type PrivyLoginMethods = ("wallet" | "email" | "farcaster")[];

type PrivyLoginActions = {
  /** Call synchronously from a click handler — opens Privy modal immediately. */
  requestWalletLogin: () => void;
  requestFarcasterLogin: () => void;
  privyReady: boolean;
};

const ConnectBaseWalletContext = createContext<(BaseWalletValue & Partial<PrivyLoginActions>) | null>(
  null,
);

function mergeConnectState(
  base: BaseWalletValue,
  privy: ReturnType<typeof usePrivyBaseConnect> | null,
  privyLogout?: () => Promise<void>,
  privyLogin?: {
    connectWallet: () => Promise<`0x${string}`>;
    loginWithFarcaster: () => Promise<void>;
    requestWalletLogin: () => void;
    requestFarcasterLogin: () => void;
    privyReady: boolean;
    bridgeError: string | null;
    clearBridgeError: () => void;
  },
): BaseWalletValue & Partial<PrivyLoginActions> {
  const disconnectWallet = async () => {
    base.disconnectWallet();
    if (privyLogout) {
      try {
        await privyLogout();
      } catch {
        // Wagmi disconnect is the primary session clear for onchain actions.
      }
    }
  };

  if (!privy || !privyLogin) {
    return { ...base, disconnectWallet };
  }

  return {
    ...base,
    connectWallet: privyLogin.connectWallet,
    loginWithFarcaster: privyLogin.loginWithFarcaster,
    requestWalletLogin: privyLogin.requestWalletLogin,
    requestFarcasterLogin: privyLogin.requestFarcasterLogin,
    privyReady: privyLogin.privyReady,
    isConnecting: privy.connectPending || base.isConnecting || base.isWalletSyncing,
    connectPending: privy.connectPending || base.connectPending,
    connectError: privyLogin.bridgeError ?? privy.connectError ?? base.connectError,
    clearConnectError: () => {
      privyLogin.clearBridgeError();
      privy.clearConnectError();
      base.clearConnectError();
    },
    disconnectWallet,
  };
}

export function ConnectBaseWalletProvider({
  children,
  privyConnect = null,
  privyLogout,
  privyLogin,
}: {
  children: ReactNode;
  privyConnect?: ReturnType<typeof usePrivyBaseConnect> | null;
  privyLogout?: () => Promise<void>;
  privyLogin?: {
    connectWallet: () => Promise<`0x${string}`>;
    loginWithFarcaster: () => Promise<void>;
    requestWalletLogin: () => void;
    requestFarcasterLogin: () => void;
    privyReady: boolean;
    bridgeError: string | null;
    clearBridgeError: () => void;
  };
}) {
  const base = useBaseWallet();
  const value = useMemo(
    () => mergeConnectState(base, privyConnect, privyLogout, privyLogin),
    [base, privyConnect, privyLogout, privyLogin],
  );

  return (
    <ConnectBaseWalletContext.Provider value={value}>{children}</ConnectBaseWalletContext.Provider>
  );
}

/** Must render under PrivyProvider — opens Privy login synchronously, then syncs wagmi. */
export function PrivyConnectBridge({ children }: { children: ReactNode }) {
  const privyConnect = usePrivyBaseConnect();
  const { authenticated, ready: privyReady } = usePrivy();
  const { logout } = useLogout();
  const [bridgeError, setBridgeError] = useState<string | null>(null);

  const authenticatedRef = useRef(authenticated);
  const privyReadyRef = useRef(privyReady);
  authenticatedRef.current = authenticated;
  privyReadyRef.current = privyReady;

  const loginWaiterRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const syncWalletRef = useRef(privyConnect.connectWallet);
  syncWalletRef.current = privyConnect.connectWallet;

  const { login } = useLogin({
    onComplete: () => {
      loginWaiterRef.current?.resolve();
      loginWaiterRef.current = null;
      void syncWalletRef.current();
    },
    onError: (error) => {
      const message = String(error);
      setBridgeError(message);
      loginWaiterRef.current?.reject(new Error(message));
      loginWaiterRef.current = null;
    },
  });

  const privyLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const waitForPrivyLogin = useCallback(
    (methods: PrivyLoginMethods): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        loginWaiterRef.current = { resolve, reject };
        login({ loginMethods: methods });
      });
    },
    [login],
  );

  const requestPrivyLogin = useCallback(
    (methods: PrivyLoginMethods) => {
      setBridgeError(null);
      privyConnect.clearConnectError();

      if (!privyReadyRef.current) {
        setBridgeError("Wallet service still loading — try again in a moment.");
        return;
      }

      if (authenticatedRef.current) {
        void syncWalletRef.current();
        return;
      }

      login({ loginMethods: methods });
    },
    [login, privyConnect],
  );

  const requestWalletLogin = useCallback(() => {
    requestPrivyLogin(["wallet", "email", "farcaster"]);
  }, [requestPrivyLogin]);

  const requestFarcasterLogin = useCallback(() => {
    requestPrivyLogin(["farcaster"]);
  }, [requestPrivyLogin]);

  const connectWallet = useCallback(async (): Promise<`0x${string}`> => {
    if (!privyReadyRef.current) {
      const message = "Wallet service still loading — try again in a moment.";
      setBridgeError(message);
      throw new Error(message);
    }
    if (!authenticatedRef.current) {
      await waitForPrivyLogin(["wallet", "email", "farcaster"]);
    }
    return syncWalletRef.current();
  }, [waitForPrivyLogin]);

  const loginWithFarcaster = useCallback(async (): Promise<void> => {
    if (!privyReadyRef.current) {
      const message = "Wallet service still loading — try again in a moment.";
      setBridgeError(message);
      throw new Error(message);
    }
    if (!authenticatedRef.current) {
      await waitForPrivyLogin(["farcaster"]);
    }
    await syncWalletRef.current();
  }, [waitForPrivyLogin]);

  const privyLogin = useMemo(
    () => ({
      connectWallet,
      loginWithFarcaster,
      requestWalletLogin,
      requestFarcasterLogin,
      privyReady,
      bridgeError,
      clearBridgeError: () => setBridgeError(null),
    }),
    [
      connectWallet,
      loginWithFarcaster,
      requestWalletLogin,
      requestFarcasterLogin,
      privyReady,
      bridgeError,
    ],
  );

  return (
    <ConnectBaseWalletProvider
      privyConnect={privyConnect}
      privyLogout={privyLogout}
      privyLogin={privyLogin}
    >
      {children}
    </ConnectBaseWalletProvider>
  );
}

export function useConnectBaseWallet(): BaseWalletValue & Partial<PrivyLoginActions> {
  const context = useContext(ConnectBaseWalletContext);
  const fallback = useBaseWallet();
  return context ?? fallback;
}
