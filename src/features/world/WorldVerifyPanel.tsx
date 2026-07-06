import { useCallback, useEffect, useState } from "react";
import type { IDKitResult } from "@worldcoin/idkit-core";
import { IDKitRequestWidget } from "@worldcoin/idkit";

import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { useMiniAppContext } from "@/hooks/use-mini-app-context";

type WorldStartConfig = {
  configured: boolean;
  app_id?: `app_${string}`;
  action?: string;
  action_description?: string;
  preset?: unknown;
  allow_legacy_proofs?: boolean;
  rp_context?: {
    rp_id: string;
    nonce: string;
    created_at: number;
    expires_at: number;
    signature: string;
  };
};

type WorldVerifyPanelProps = {
  compact?: boolean;
  onVerified?: () => void;
};

export function WorldVerifyPanel({ compact, onVerified }: WorldVerifyPanelProps) {
  const { isWorldApp } = useMiniAppContext();
  const { address, isConnected, connectWallet, isConnecting } = useConnectBaseWallet();
  const [config, setConfig] = useState<WorldStartConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/auth/world/start")
      .then((r) => r.json())
      .then((data: WorldStartConfig) => setConfig(data))
      .catch(() => setConfig({ configured: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = useCallback(
    async (proof: IDKitResult) => {
      if (!address) throw new Error("Connect wallet first");
      const res = await fetch("/api/auth/world/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, proof }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Verify failed (${res.status})`);
      }
    },
    [address],
  );

  if (loading) {
    return (
      <p className="text-xs text-muted-foreground">
        {compact ? "Loading World ID…" : "Checking World ID configuration…"}
      </p>
    );
  }

  if (!config?.configured || !config.app_id || !config.rp_context) {
    return (
      <p className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
        World ID not configured yet — set VITE_WORLD_APP_ID, WORLD_RP_ID, and WORLD_RP_SIGNING_KEY
        in the developer portal.
      </p>
    );
  }

  if (verified) {
    return (
      <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
        Verified human — prediction slot unlocked on this wallet.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4"}>
      {!compact && (
        <>
          <p className="font-display text-sm font-bold">Verify as a unique human</p>
          <p className="text-xs text-muted-foreground">
            {isWorldApp
              ? "World App detected — verify with World ID to unlock sybil-resistant predictions."
              : "Open in World App for the best verify flow, or use the widget here."}
          </p>
        </>
      )}

      {!isConnected ? (
        <button
          type="button"
          onClick={() => void connectWallet()}
          disabled={isConnecting}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60"
        >
          {isConnecting ? "Connecting…" : "Connect wallet to verify"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          Verify with World ID
        </button>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <IDKitRequestWidget
        open={open}
        onOpenChange={setOpen}
        app_id={config.app_id}
        action={config.action ?? "predict-human"}
        action_description={config.action_description}
        preset={config.preset as never}
        allow_legacy_proofs={config.allow_legacy_proofs ?? true}
        rp_context={config.rp_context}
        handleVerify={handleVerify}
        onSuccess={() => {
          setVerified(true);
          setError(null);
          onVerified?.();
        }}
        onError={(code) => setError(`World ID error: ${code}`)}
      />
    </div>
  );
}
