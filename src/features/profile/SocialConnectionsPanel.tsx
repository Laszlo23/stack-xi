import { ExternalLink, Link2 } from "lucide-react";
import { useProfile } from "@farcaster/auth-kit";
import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { FarcasterSignInButton } from "@/features/farcaster/FarcasterSignInButton";
import { useMiniAppContext } from "@/hooks/use-mini-app-context";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useMemberTasks } from "@/hooks/use-member-tasks";
import {
  connectFarcasterAccount,
  connectXAccount,
  useSocialConnections,
  useSocialLinkSign,
} from "@/hooks/use-social-connections";
import { storeSiwfSession } from "@/lib/farcaster/siwf-session";

const FARCASTER_MINIAPP_LAUNCH_URL =
  "https://farcaster.xyz/~/mini-apps/launch?domain=pepe.buildingcultureid.space";

export function SocialConnectionsPanel() {
  const { address, hasWalletSession, canSign, isWalletSyncing } = useWalletSession();
  const { isMiniApp, isLoading: miniAppLoading } = useMiniAppContext();
  const { isAuthenticated, profile } = useProfile();
  const { status, isLoading, error, refresh } = useSocialConnections(address);
  const { signLinkMessage, isSigning } = useSocialLinkSign();
  const { completeTask, refreshProgress } = useMemberTasks();
  const [fcError, setFcError] = useState<string | null>(null);
  const [fcConnecting, setFcConnecting] = useState(false);

  useEffect(() => {
    if (status.x) completeTask("connect_x");
    if (status.farcaster) completeTask("connect_farcaster");
  }, [status.x, status.farcaster, completeTask]);

  if (!hasWalletSession || !address) return null;

  async function handleConnectX() {
    if (!address || !canSign) {
      setFcError("Wait for wallet sync to finish, then try again.");
      return;
    }
    sessionStorage.setItem("stackxi:post-oauth", "profile");
    const { message, signature } = await signLinkMessage(address);
    const authUrl = await connectXAccount({ address, message, signature });
    window.location.href = authUrl;
  }

  async function handleConnectFarcasterMiniApp() {
    if (!address || !canSign) {
      setFcError("Wait for wallet sync to finish, then try again.");
      return;
    }
    setFcConnecting(true);
    setFcError(null);
    try {
      const { sdk, quickAuth } = await import("@farcaster/miniapp-sdk");
      await sdk.actions.ready();
      const { token } = await quickAuth.getToken();
      const { message, signature } = await signLinkMessage(address);
      await connectFarcasterAccount({ address, token, message, signature });
      await refresh();
      completeTask("connect_farcaster");
      refreshProgress();
    } catch (err) {
      setFcError(err instanceof Error ? err.message : "Farcaster connect failed");
    } finally {
      setFcConnecting(false);
    }
  }

  const showFcDeepLink = !miniAppLoading && !isMiniApp;
  const fcSignedInWeb = isAuthenticated && Boolean(profile.username ?? profile.fid);

  return (
    <section className="glass space-y-4 rounded-2xl p-5">
      <div>
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Link2 className="h-3.5 w-3.5" />
          Social accounts
        </div>
        <h3 className="mt-1 font-display text-xl font-bold">Connect for verified missions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Link X and Farcaster to auto-verify engagement tasks.
        </p>
        {isWalletSyncing && (
          <p className="mt-2 text-xs text-primary">Wallet syncing — social connect unlocks in a moment.</p>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
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
              disabled={isSigning || isWalletSyncing}
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
          ) : showFcDeepLink ? (
            <div className="mt-3 space-y-2">
              <FarcasterSignInButton
                onSuccess={(result) => {
                  if (!result.fid || !result.message || !result.signature || !result.nonce) return;
                  storeSiwfSession({
                    fid: result.fid,
                    username: result.username,
                    message: result.message,
                    signature: result.signature,
                    nonce: result.nonce,
                  });
                  setFcError(null);
                  void refresh();
                  completeTask("connect_farcaster");
                  refreshProgress();
                }}
                onError={setFcError}
              />
              {fcSignedInWeb && (
                <p className="text-[11px] leading-snug text-primary">
                  Signed in as @{profile.username ?? profile.fid} — linking wallet…
                </p>
              )}
              <a
                href={FARCASTER_MINIAPP_LAUNCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary"
              >
                Or open mini-app <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <button
              type="button"
              disabled={isSigning || fcConnecting || isWalletSyncing}
              onClick={() => void handleConnectFarcasterMiniApp()}
              className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60"
            >
              {fcConnecting || isSigning ? "Connecting…" : "Connect Farcaster"}
            </button>
          )}
          {fcError && <p className="mt-2 text-xs text-destructive">{fcError}</p>}
        </div>
      </div>
    </section>
  );
}

export function SocialConnectToast() {
  const { x, fc } = useSearch({ from: "/profile" });

  const messages: Record<string, string> = {
    connected: "Account connected successfully.",
    error: "Connection failed. Try again.",
    expired: "Connection expired. Try again.",
    unconfigured: "OAuth not configured on server yet.",
    token_error: "Token exchange failed.",
    user_error: "Could not load profile.",
  };

  const parts: string[] = [];
  if (x && messages[x]) {
    parts.push(x === "connected" ? "X account connected successfully." : `X: ${messages[x]}`);
  }
  if (fc && messages[fc]) {
    parts.push(
      fc === "connected" ? "Farcaster connected successfully." : `Farcaster: ${messages[fc]}`,
    );
  }

  if (parts.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
      {parts.join(" ")}
    </div>
  );
}
