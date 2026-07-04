import { Link2 } from "lucide-react";
import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useMemberTasks } from "@/hooks/use-member-tasks";
import {
  connectFarcasterAccount,
  connectXAccount,
  useSocialConnections,
  useSocialLinkSign,
} from "@/hooks/use-social-connections";

export function SocialConnectionsPanel() {
  const { address, isConnected } = useBaseWallet();
  const { status, isLoading, refresh } = useSocialConnections(address);
  const { signLinkMessage, isSigning } = useSocialLinkSign();
  const { completeTask, refreshProgress } = useMemberTasks();

  useEffect(() => {
    if (status.x) completeTask("connect_x");
    if (status.farcaster) completeTask("connect_farcaster");
  }, [status.x, status.farcaster, completeTask]);

  useEffect(() => {
    const pendingToken = sessionStorage.getItem("stackxi:fc-quick-auth-token");
    if (!pendingToken || !address) return;

    void (async () => {
      try {
        const { message, signature } = await signLinkMessage(address);
        await connectFarcasterAccount({
          address,
          token: pendingToken,
          message,
          signature,
        });
        sessionStorage.removeItem("stackxi:fc-quick-auth-token");
        await refresh();
        completeTask("connect_farcaster");
        refreshProgress();
      } catch {
        // User can retry manually
      }
    })();
  }, [address, signLinkMessage, refresh, completeTask, refreshProgress]);

  if (!isConnected || !address) return null;

  async function handleConnectX() {
    const { message, signature } = await signLinkMessage(address!);
    const authUrl = await connectXAccount({ address: address!, message, signature });
    window.location.href = authUrl;
  }

  async function handleConnectFarcaster() {
    const { sdk, quickAuth } = await import("@farcaster/miniapp-sdk");
    await sdk.actions.ready();
    const { token } = await quickAuth.getToken();
    const { message, signature } = await signLinkMessage(address!);
    await connectFarcasterAccount({ address: address!, token, message, signature });
    await refresh();
    completeTask("connect_farcaster");
    refreshProgress();
  }

  return (
    <section className="glass rounded-2xl p-5 space-y-4">
      <div>
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Link2 className="h-3.5 w-3.5" />
          Social accounts
        </div>
        <h3 className="mt-1 font-display text-xl font-bold">Connect for verified missions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Link X and Farcaster to auto-verify engagement tasks. Hybrid mode: API when available,
          honor fallback otherwise.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 p-4">
          <div className="font-display font-bold">X / Twitter</div>
          {isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
          ) : status.x ? (
            <p className="mt-2 text-sm text-primary">Connected as @{status.x.username}</p>
          ) : (
            <button
              type="button"
              disabled={isSigning}
              onClick={() => void handleConnectX()}
              className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60"
            >
              {isSigning ? "Sign to connect…" : "Connect X"}
            </button>
          )}
        </div>

        <div className="rounded-xl border border-border/60 p-4">
          <div className="font-display font-bold">Farcaster</div>
          {isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
          ) : status.farcaster ? (
            <p className="mt-2 text-sm text-primary">
              Connected as @{status.farcaster.username ?? status.farcaster.fid} (fid{" "}
              {status.farcaster.fid})
            </p>
          ) : (
            <button
              type="button"
              disabled={isSigning}
              onClick={() => void handleConnectFarcaster()}
              className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60"
            >
              {isSigning ? "Sign to connect…" : "Connect Farcaster"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function SocialConnectToast() {
  const { x } = useSearch({ from: "/profile" });

  if (!x) return null;

  const messages: Record<string, string> = {
    connected: "X account connected successfully.",
    error: "X connection failed. Try again.",
    expired: "X connection expired. Try again.",
    unconfigured: "X OAuth not configured on server yet.",
    token_error: "X token exchange failed.",
    user_error: "Could not load X profile.",
  };

  const message = messages[x] ?? null;
  if (!message) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
      {message}
    </div>
  );
}
