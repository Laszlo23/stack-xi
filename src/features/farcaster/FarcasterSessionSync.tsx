import { useProfile, useSignInMessage } from "@farcaster/auth-kit";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";
import { useMiniAppContext } from "@/hooks/use-mini-app-context";
import {
  connectFarcasterAccount,
  linkFarcasterToWallet,
  useSocialConnections,
  useSocialLinkSign,
} from "@/hooks/use-social-connections";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { isPrivyEnabled } from "@/lib/base/privy-config";
import {
  clearStoredSiwfSession,
  readStoredSiwfSession,
} from "@/lib/farcaster/siwf-session";

/** Links Farcaster identity (SIWF, Privy, or mini-app quick auth) to the active wallet. */
export function FarcasterSessionSync() {
  const { address, canSign } = useWalletSession();
  const { signLinkMessage } = useSocialLinkSign();
  const { status, refresh } = useSocialConnections(address);
  const { isMiniApp } = useMiniAppContext();
  const { isAuthenticated, profile } = useProfile();
  const signInMessage = useSignInMessage();
  const { user, authenticated: privyAuthenticated } = usePrivy();
  const syncingRef = useRef(false);
  const linkedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!address || !canSign || syncingRef.current || status.farcaster) return;

    const linkKey = `${address.toLowerCase()}`;
    if (linkedKeyRef.current === linkKey) return;

    void (async () => {
      syncingRef.current = true;
      try {
        const pendingQuickAuth = sessionStorage.getItem("stackxi:fc-quick-auth-token");
        if (pendingQuickAuth) {
          const { message, signature } = await signLinkMessage(address);
          await connectFarcasterAccount({
            address,
            token: pendingQuickAuth,
            message,
            signature,
          });
          sessionStorage.removeItem("stackxi:fc-quick-auth-token");
          linkedKeyRef.current = linkKey;
          await refresh();
          return;
        }

        const siwf = readStoredSiwfSession();
        if (siwf) {
          const { message, signature } = await signLinkMessage(address);
          await linkFarcasterToWallet({
            address,
            message,
            signature,
            fid: siwf.fid,
            username: siwf.username,
            siwfMessage: siwf.message,
            siwfSignature: siwf.signature,
            siwfNonce: siwf.nonce,
          });
          clearStoredSiwfSession();
          linkedKeyRef.current = linkKey;
          await refresh();
          return;
        }

        if (isAuthenticated && profile.fid && signInMessage.message && signInMessage.signature) {
          const stored = readStoredSiwfSession();
          const nonce = stored?.nonce;
          if (!nonce) return;

          const { message, signature } = await signLinkMessage(address);
          await linkFarcasterToWallet({
            address,
            message,
            signature,
            fid: profile.fid,
            username: profile.username,
            siwfMessage: signInMessage.message,
            siwfSignature: signInMessage.signature,
            siwfNonce: nonce,
          });
          linkedKeyRef.current = linkKey;
          await refresh();
          return;
        }

        if (isPrivyEnabled() && privyAuthenticated && user) {
          const fc = user.linkedAccounts.find((account) => account.type === "farcaster");
          if (fc && fc.type === "farcaster" && fc.fid) {
            const { message, signature } = await signLinkMessage(address);
            await linkFarcasterToWallet({
              address,
              message,
              signature,
              fid: fc.fid,
              username: fc.username ?? undefined,
            });
            linkedKeyRef.current = linkKey;
            await refresh();
          }
        }
      } catch {
        // Profile panel shows explicit connect errors.
      } finally {
        syncingRef.current = false;
      }
    })();
  }, [
    address,
    canSign,
    status.farcaster,
    isAuthenticated,
    profile.fid,
    profile.username,
    signInMessage.message,
    signInMessage.signature,
    privyAuthenticated,
    user,
    signLinkMessage,
    refresh,
    isMiniApp,
  ]);

  return null;
}
