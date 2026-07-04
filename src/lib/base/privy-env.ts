/** Privy embedded wallets require HTTPS (not merely window.isSecureContext — LAN HTTP can be "secure"). */
export function isPrivySecureContext(): boolean {
  if (typeof window === "undefined") return true;
  const { protocol, hostname } = window.location;
  if (protocol === "https:") return true;
  // Localhost dev over HTTP: wagmi-only; embedded wallets still need HTTPS in Privy SDK.
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") {
    return false;
  }
  return false;
}

/** Use Privy login modal + embedded wallet path (production HTTPS only). */
export function shouldUsePrivyConnectFlow(): boolean {
  if (typeof window === "undefined") return true;
  return window.location.protocol === "https:";
}
