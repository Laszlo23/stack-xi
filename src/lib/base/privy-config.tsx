import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { base } from "wagmi/chains";
import { isPrivySecureContext } from "@/lib/base/privy-env";
import { BaseWagmiProvider, createWagmiConfig } from "@/lib/base/wagmi-config";
import { createPrivyConfig, PrivyWagmiProvider } from "@/lib/base/privy-wagmi-config";
import {
  ConnectBaseWalletProvider,
  PrivyConnectBridge,
} from "@/hooks/use-connect-base-wallet";
import { PrivyWalletSync } from "@/features/wallet/PrivyWalletSync";
import { PrivyResolvedWalletBridge } from "@/hooks/use-resolved-wallet-address";

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID?.trim();
const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID?.trim();

export function isPrivyEnabled(): boolean {
  return Boolean(privyAppId);
}

function PrivyConnectLayer({ children }: { children: ReactNode }) {
  return (
    <PrivyConnectBridge>
      <PrivyResolvedWalletBridge>
        <PrivyWalletSync />
        {children}
      </PrivyResolvedWalletBridge>
    </PrivyConnectBridge>
  );
}

export function Web3Providers({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  const [wagmiConfig] = useState(createWagmiConfig);
  const [privyConfig] = useState(createPrivyConfig);
  const secureContext = isPrivySecureContext();

  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <BaseWagmiProvider config={wagmiConfig}>
          <ConnectBaseWalletProvider>{children}</ConnectBaseWalletProvider>
        </BaseWagmiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId || undefined}
      config={{
        loginMethods: ["wallet", "email", "farcaster"],
        appearance: {
          theme: "dark",
          accentColor: "#22c55e",
        },
        embeddedWallets: secureContext
          ? {
              ethereum: {
                createOnLogin: "users-without-wallets",
              },
            }
          : undefined,
        defaultChain: base,
        supportedChains: [base],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={privyConfig}>
          <PrivyConnectLayer>{children}</PrivyConnectLayer>
        </PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
