import { createHash, randomBytes } from "node:crypto";
import { verifyMessage } from "viem";

export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}

export function buildSocialLinkMessage(address: string, nonce: string): string {
  return `Link STACK XI social accounts\nWallet: ${address}\nNonce: ${nonce}`;
}

export async function verifyWalletSignature(input: {
  address: `0x${string}`;
  message: string;
  signature: `0x${string}`;
}): Promise<boolean> {
  try {
    return await verifyMessage({
      address: input.address,
      message: input.message,
      signature: input.signature,
    });
  } catch {
    return false;
  }
}

export function generatePkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function generateOAuthState(): string {
  return randomBytes(24).toString("base64url");
}
