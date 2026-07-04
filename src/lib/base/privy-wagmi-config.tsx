import { WagmiProvider, createConfig as createPrivyWagmiConfig, type Config } from "@privy-io/wagmi";
import { http } from "wagmi";
import { base } from "wagmi/chains";
import type { ReactNode } from "react";
import { buildConnectors } from "@/lib/base/wagmi-config";

/** Wagmi config for @privy-io/wagmi — disables multi-injected discovery (avoids TON/Telegram wallets). */
export function createPrivyConfig(): Config {
  return createPrivyWagmiConfig({
    chains: [base],
    connectors: buildConnectors(),
    transports: {
      [base.id]: http(),
    },
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
