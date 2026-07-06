import { base } from "viem/chains";

/** Client-safe Base RPC — prefer VITE_BASE_RPC_URL for reliable balance reads. */
export function getClientBaseRpcUrl(): string {
  const explicit = import.meta.env.VITE_BASE_RPC_URL?.trim();
  if (explicit) return explicit;
  return base.rpcUrls.default.http[0] ?? "https://mainnet.base.org";
}
