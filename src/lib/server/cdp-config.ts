/** Server-only CDP (Coinbase Developer Platform) credential checks. */

const SWAP_PAYER_ACCOUNT_NAME = "stack-xi-x402-payer";

export function getCdpSwapPayerAccountName(): string {
  return process.env.CDP_SWAP_PAYER_ACCOUNT_NAME?.trim() || SWAP_PAYER_ACCOUNT_NAME;
}

export function isCdpConfigured(): boolean {
  return Boolean(
    process.env.CDP_API_KEY_ID?.trim() &&
      process.env.CDP_API_KEY_SECRET?.trim() &&
      process.env.CDP_WALLET_SECRET?.trim(),
  );
}
