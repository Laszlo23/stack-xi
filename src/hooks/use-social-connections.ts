import { useCallback, useEffect, useState } from "react";
import { useSignMessage } from "wagmi";

function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildSocialLinkMessage(address: string, nonce: string): string {
  return `Link STACK XI social accounts\nWallet: ${address}\nNonce: ${nonce}`;
}

export function useSocialLinkSign() {
  const { signMessageAsync, isPending } = useSignMessage();

  const signLinkMessage = useCallback(
    async (address: `0x${string}`) => {
      const nonce = generateNonce();
      const message = buildSocialLinkMessage(address, nonce);
      const signature = await signMessageAsync({ message });
      return { message, signature, nonce };
    },
    [signMessageAsync],
  );

  return { signLinkMessage, isSigning: isPending };
}

export type SocialConnectionStatus = {
  x: { username: string; userId: string } | null;
  farcaster: { fid: number; username: string | null } | null;
};

const EMPTY_STATUS: SocialConnectionStatus = { x: null, farcaster: null };

export function useSocialConnections(address: string | undefined) {
  const [status, setStatus] = useState<SocialConnectionStatus>(EMPTY_STATUS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) {
      setStatus(EMPTY_STATUS);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/social/status?address=${encodeURIComponent(address)}`);
      if (!res.ok) throw new Error("Failed to load social status");
      const data = (await res.json()) as SocialConnectionStatus;
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load social status");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, isLoading, error, refresh };
}

export async function connectXAccount(input: {
  address: `0x${string}`;
  message: string;
  signature: `0x${string}`;
}): Promise<string> {
  const res = await fetch("/api/auth/x/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Failed to start X OAuth");
  }
  const data = (await res.json()) as { authUrl: string };
  return data.authUrl;
}

export async function connectFarcasterAccount(input: {
  address: `0x${string}`;
  token: string;
  message?: string;
  signature?: `0x${string}`;
}): Promise<void> {
  const res = await fetch("/api/auth/farcaster/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Failed to connect Farcaster");
  }
}

export async function verifySocialTaskApi(
  address: string,
  taskId: string,
): Promise<{ verified: boolean; method: string; message: string }> {
  const res = await fetch("/api/social/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, taskId }),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Verification failed");
  }
  return (await res.json()) as { verified: boolean; method: string; message: string };
}

export async function signAndConnectX(
  address: `0x${string}`,
  signMessage: (message: string) => Promise<`0x${string}`>,
): Promise<void> {
  const nonce = generateNonce();
  const message = buildSocialLinkMessage(address, nonce);
  const signature = await signMessage(message);
  const authUrl = await connectXAccount({ address, message, signature });
  window.location.href = authUrl;
}
