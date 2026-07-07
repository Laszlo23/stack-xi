import { useSignIn } from "@farcaster/auth-kit";
import type { StatusAPIResponse } from "@farcaster/auth-client";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export type FarcasterSignInResult = StatusAPIResponse;

export function FarcasterSignInButton({
  onSuccess,
  onError,
  className = "",
  compact,
}: {
  onSuccess: (result: FarcasterSignInResult) => void;
  onError?: (message: string) => void;
  className?: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const { signIn, isPolling, isSuccess } = useSignIn({
    onSuccess: (result) => {
      if (result.state !== "completed" || !result.message || !result.signature || !result.fid) {
        onError?.(t("farcasterAuth.incomplete"));
        return;
      }
      onSuccess(result);
    },
    onError: (error) => {
      onError?.(error?.message ?? t("farcasterAuth.failed"));
    },
  });

  const busy = isPolling;
  const label = busy
    ? t("farcasterAuth.signingIn")
    : isSuccess
      ? t("farcasterAuth.signedIn")
      : compact
        ? t("farcasterAuth.short")
        : t("farcasterAuth.signIn");

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => signIn()}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-60 ${className}`}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span aria-hidden>🟣</span>}
      {label}
    </button>
  );
}
