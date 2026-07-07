import { getAccount, switchChain } from "@wagmi/core";
import type { Config } from "wagmi";
import { BASE_CHAIN_ID } from "@/lib/base/config";

/** Require wagmi to be connected and on Base before sending a transaction. */
export async function ensureWalletReadyForTx(config: Config): Promise<`0x${string}`> {
  const account = getAccount(config);
  if (!account.isConnected || !account.address) {
    throw new Error("Wallet not ready — wait for sync to finish or reconnect.");
  }

  if (account.chainId !== BASE_CHAIN_ID) {
    await switchChain(config, { chainId: BASE_CHAIN_ID });
  }

  return account.address;
}
