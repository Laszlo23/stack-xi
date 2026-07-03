import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import type { ReactNode } from "react";

const config = createConfig({
  chains: [base],
  connectors: [injected({ shimDisconnect: true }), coinbaseWallet({ appName: "STACK XI" })],
  transports: {
    [base.id]: http(),
  },
});

export function BaseWagmiProvider({ children }: { children: ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}

export { config as wagmiConfig };
