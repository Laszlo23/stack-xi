import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { base } from "wagmi/chains";
import { isPrivySecureContext, shouldUsePrivyConnectFlow } from "@/lib/base/privy-env";
import { BaseWagmiProvider, createWagmiConfig } from "@/lib/base/wagmi-config";
import { createPrivyConfig, PrivyWagmiProvider } from "@/lib/base/privy-wagmi-config";
import {
  ConnectBaseWalletProvider,
  PrivyConnectBridge,
} from "@/hooks/use-connect-base-wallet";

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID?.trim();

export function isPrivyEnabled(): boolean {
  return Boolean(privyAppId);
}

function PrivyConnectLayer({ children }: { children: ReactNode }) {
  const privyConnectFlow = shouldUsePrivyConnectFlow();
  if (privyConnectFlow) {
    return <PrivyConnectBridge>{children}</PrivyConnectBridge>;
  }
  return <ConnectBaseWalletProvider>{children}</ConnectBaseWalletProvider>;
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
      config={{
        loginMethods: ["wallet", "email"],
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
