/** Server-only Alchemy RPC + agent wallet helpers. */

import { readFileSync } from "node:fs";
import { privateKeyToAccount } from "viem/accounts";

function readPrivateKeyFromFile(filePath: string): `0x${string}` | null {
  try {
    const trimmed = readFileSync(filePath, "utf8").trim();
    return trimmed.startsWith("0x") ? (trimmed as `0x${string}`) : null;
  } catch {
    return null;
  }
}

export function getAlchemyBaseRpcUrl(): string | null {
  const endpoint = process.env.ALCHEMY_BASE_ENDPOINT?.trim();
  if (endpoint?.startsWith("http")) return endpoint;

  const key = process.env.ALCHEMY_API_KEY?.trim();
  if (!key) return null;
  return `https://base-mainnet.g.alchemy.com/v2/${key}`;
}

/** Base mainnet RPC for server scripts and x402 signing reads. */
export function getServerBaseRpcUrl(): string {
  const explicit = process.env.BASE_RPC_URL?.trim();
  if (explicit) return explicit;
  return getAlchemyBaseRpcUrl() ?? "https://mainnet.base.org";
}

/**
 * Local EVM key for x402 micropayments (Alchemy CLI local wallet).
 * Priority: dedicated swap key → ALCHEMY_WALLET_KEY_FILE → ALCHEMY_WALLET_KEY → PRIVATE_KEY.
 */
export function resolveAlchemyX402PayerKey(): `0x${string}` | null {
  const keyFile = process.env.ALCHEMY_WALLET_KEY_FILE?.trim();
  if (keyFile) {
    const fromFile = readPrivateKeyFromFile(keyFile);
    if (fromFile) return fromFile;
  }

  const candidates = [
    process.env.X402_SWAP_PAYER_PRIVATE_KEY,
    process.env.ALCHEMY_WALLET_KEY,
    process.env.PRIVATE_KEY,
  ];

  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed?.startsWith("0x")) {
      return trimmed as `0x${string}`;
    }
  }

  return null;
}

export function getExpectedAlchemyPayerAddress(): `0x${string}` | null {
  const expected = process.env.ALCHEMY_PUBLIC_WALLET_ADDRESS?.trim();
  if (!expected?.startsWith("0x")) return null;
  return expected as `0x${string}`;
}

export function assertAlchemyPayerAddressMatch(actual: `0x${string}`): void {
  const expected = getExpectedAlchemyPayerAddress();
  if (!expected) return;
  if (actual.toLowerCase() !== expected.toLowerCase()) {
    throw new Error(
      `Alchemy payer mismatch: signing key is ${actual} but ALCHEMY_PUBLIC_WALLET_ADDRESS is ${expected}. Add ALCHEMY_WALLET_KEY for the agent wallet.`,
    );
  }
}

export function isAlchemyX402PayerConfigured(): boolean {
  return resolveAlchemyX402PayerKey() !== null;
}

export function isAlchemyPayerAddressMismatch(): boolean {
  const expected = getExpectedAlchemyPayerAddress();
  const key = resolveAlchemyX402PayerKey();
  if (!expected || !key) return false;
  try {
    const actual = privateKeyToAccount(key).address;
    return actual.toLowerCase() !== expected.toLowerCase();
  } catch {
    return true;
  }
}

export function getAlchemyX402PayerSource(): "dedicated" | "alchemy_wallet" | "private_key" | null {
  if (process.env.X402_SWAP_PAYER_PRIVATE_KEY?.trim().startsWith("0x")) return "dedicated";
  if (
    process.env.ALCHEMY_WALLET_KEY_FILE?.trim() ||
    process.env.ALCHEMY_WALLET_KEY?.trim().startsWith("0x")
  ) {
    return "alchemy_wallet";
  }
  if (process.env.PRIVATE_KEY?.trim().startsWith("0x")) return "private_key";
  return null;
}
