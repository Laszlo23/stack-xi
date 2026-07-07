import { AuthKitProvider } from "@farcaster/auth-kit";
import type { ReactNode } from "react";
import { getFarcasterAuthKitConfig } from "@/lib/farcaster/auth-kit-config";
import "@farcaster/auth-kit/styles.css";

const AUTH_KIT_CONFIG = getFarcasterAuthKitConfig();

export function FarcasterAuthProvider({ children }: { children: ReactNode }) {
  return <AuthKitProvider config={AUTH_KIT_CONFIG}>{children}</AuthKitProvider>;
}
