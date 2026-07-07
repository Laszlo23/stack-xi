import { WagmiProvider, createConfig as createPrivyWagmiConfig, type Config } from "@privy-io/wagmi";
import type { ReactNode } from "react";
import { buildConnectors } from "@/lib/base/wagmi-config";
import { buildLifiWagmiTransports, LIFI_WAGMI_CHAINS } from "@/lib/swap/lifi-wagmi-chains";

/** Wagmi config for @privy-io/wagmi — Base default + LI.FI source chains for cross-chain swaps. */
export function createPrivyConfig(): Config {
  return createPrivyWagmiConfig({
    chains: [...LIFI_WAGMI_CHAINS],
    connectors: buildConnectors(),
    multiInjectedProviderDiscovery: false,
    transports: buildLifiWagmiTransports(),
  });
}

export function PrivyWagmiProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: Config;
}) {
  return (
    <WagmiProvider config={config} reconnectOnMount>
      {children}
    </WagmiProvider>
  );
}
