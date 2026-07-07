import { getClientBaseRpcUrl } from "@/lib/base/client-rpc";
import { SITE_URL } from "@/lib/seo/site-config";

export function getFarcasterAuthDomain(): string {
  return new URL(SITE_URL).hostname;
}

export function getFarcasterAuthKitConfig() {
  return {
    domain: getFarcasterAuthDomain(),
    siweUri: SITE_URL,
    rpcUrl: getClientBaseRpcUrl(),
    relay: "https://relay.farcaster.xyz",
  } as const;
}
