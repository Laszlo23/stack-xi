/**
 * Server-only CDP non-custodial wallet used as the x402 payer for 0x swap quotes.
 * @see https://docs.cdp.coinbase.com/wallets/quickstart/api-key-auth
 */

import { CdpClient } from "@coinbase/cdp-sdk";
import { toAccount } from "viem/accounts";
import type { LocalAccount } from "viem/accounts";
import { getCdpSwapPayerAccountName, isCdpConfigured } from "@/lib/server/cdp-config";

let cdpClient: CdpClient | null = null;
let payerAccount: LocalAccount | null = null;
let payerAddress: `0x${string}` | null = null;
let initPromise: Promise<`0x${string}`> | null = null;

function getCdpClient(): CdpClient {
  if (!cdpClient) {
    cdpClient = new CdpClient();
  }
  return cdpClient;
}

export async function getCdpSwapPayerSigner(): Promise<LocalAccount> {
  if (payerAccount) return payerAccount;

  if (!isCdpConfigured()) {
    throw new Error(
      "CDP credentials missing — set CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET",
    );
  }

  const cdp = getCdpClient();
  const account = await cdp.evm.getOrCreateAccount({
    name: getCdpSwapPayerAccountName(),
  });

  payerAccount = toAccount(account);
  payerAddress = payerAccount.address;
  return payerAccount;
}

export async function getCdpSwapPayerAddress(): Promise<`0x${string}`> {
  if (payerAddress) return payerAddress;
  if (!initPromise) {
    initPromise = getCdpSwapPayerSigner().then((signer) => signer.address);
  }
  return initPromise;
}
